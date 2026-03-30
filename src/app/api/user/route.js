import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/user - 내 프로필 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, name: true, email: true, emoji: true,
        area: true, gender: true, ageGroup: true, mannerScore: true,
        _count: {
          select: {
            posts: true,
            participants: true,
          },
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('프로필 조회 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// PATCH /api/user - 프로필 수정
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { name, emoji, area, gender, ageGroup } = await request.json();

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(emoji && { emoji }),
        ...(area && { area }),
        ...(gender !== undefined && { gender }),
        ...(ageGroup !== undefined && { ageGroup }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('프로필 수정 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}