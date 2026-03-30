import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/posts/:id - 모집글 상세 조회
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        host: {
          select: { id: true, name: true, emoji: true, area: true, gender: true, ageGroup: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, emoji: true, gender: true, ageGroup: true },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        _count: { select: { likes: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 현재 유저의 좋아요/참여 여부 확인
    let isLiked = false;
    let isJoined = false;
    if (session?.user?.id) {
      const like = await prisma.like.findUnique({
        where: { userId_postId: { userId: session.user.id, postId: post.id } },
      });
      isLiked = !!like;

      const participant = await prisma.participant.findUnique({
        where: { userId_postId: { userId: session.user.id, postId: post.id } },
      });
      isJoined = !!participant;
    }

    return NextResponse.json({
      ...post,
      host: {
        ...post.host,
        gender: post.showGender ? post.host.gender : null,
        ageGroup: post.showAge ? post.host.ageGroup : null,
      },
      participants: post.participants.map((p) => ({
        ...p.user,
        gender: post.showGender ? p.user.gender : null,
        ageGroup: post.showAge ? p.user.ageGroup : null,
      })),
      likesCount: post._count.likes,
      isLiked,
      isJoined,
    });
  } catch (error) {
    console.error('게시글 상세 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// DELETE /api/posts/:id - 모집글 삭제
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post || post.hostId !== session.user.id) {
      return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
    }

    await prisma.post.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('게시글 삭제 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}