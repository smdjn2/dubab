import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/posts/:id/like - 좋아요 토글
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: session.user.id, postId: params.id } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.like.create({
        data: { userId: session.user.id, postId: params.id },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('좋아요 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}