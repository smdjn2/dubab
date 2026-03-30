import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/posts/:id/join - 참여하기
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (post.currentPeople >= post.maxPeople) {
      return NextResponse.json({ error: '인원이 마감되었습니다.' }, { status: 400 });
    }

    // 중복 참여 방지
    const existing = await prisma.participant.findUnique({
      where: { userId_postId: { userId: session.user.id, postId: post.id } },
    });
    if (existing) {
      return NextResponse.json({ error: '이미 참여 중입니다.' }, { status: 400 });
    }

    // 참여 처리 (트랜잭션)
    await prisma.$transaction([
      prisma.participant.create({
        data: { userId: session.user.id, postId: post.id },
      }),
      prisma.post.update({
        where: { id: post.id },
        data: {
          currentPeople: { increment: 1 },
          status: post.currentPeople + 1 >= post.maxPeople ? 'full' : 'open',
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('참여 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// DELETE /api/posts/:id/join - 참여 취소
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (post.hostId === session.user.id) {
      return NextResponse.json({ error: '파티장은 참여를 취소할 수 없습니다.' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.participant.delete({
        where: { userId_postId: { userId: session.user.id, postId: post.id } },
      }),
      prisma.post.update({
        where: { id: post.id },
        data: {
          currentPeople: { decrement: 1 },
          status: 'open',
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('참여 취소 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}