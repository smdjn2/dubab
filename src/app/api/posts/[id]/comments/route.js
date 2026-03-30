import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/posts/:id/comments
export async function GET(request, { params }) {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: params.id },
      include: {
        user: {
          select: { id: true, name: true, emoji: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('댓글 조회 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// POST /api/posts/:id/comments
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        postId: params.id,
      },
      include: {
        user: { select: { id: true, name: true, emoji: true } },
      },
    });

    // 글 작성자에게 알림
    const post = await prisma.post.findUnique({ where: { id: params.id }, select: { hostId: true, title: true } });
    if (post && post.hostId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: 'comment',
          message: `${session.user.name}님이 "${post.title}" 글에 댓글을 남겼습니다.`,
          userId: post.hostId,
          postId: params.id,
        },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('댓글 작성 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
