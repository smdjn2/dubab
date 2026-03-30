import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/block - 차단 목록
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const blocks = await prisma.block.findMany({
      where: { blockerId: session.user.id },
      include: {
        blocked: { select: { id: true, name: true, emoji: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error('차단 목록 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// POST /api/block - 차단
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { blockedId } = await request.json();
    if (!blockedId || blockedId === session.user.id) {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }

    const existing = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: session.user.id, blockedId } },
    });

    if (existing) {
      return NextResponse.json({ error: '이미 차단한 유저입니다.' }, { status: 409 });
    }

    const block = await prisma.block.create({
      data: { blockerId: session.user.id, blockedId },
    });

    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    console.error('차단 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// DELETE /api/block - 차단 해제
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { blockedId } = await request.json();

    await prisma.block.delete({
      where: { blockerId_blockedId: { blockerId: session.user.id, blockedId } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('차단 해제 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
