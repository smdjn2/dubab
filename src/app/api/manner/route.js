import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/manner - 매너 평가
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { targetId, postId, score } = await request.json();

    if (!targetId || !postId || !score || score < 1 || score > 5) {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }

    if (targetId === session.user.id) {
      return NextResponse.json({ error: '자신을 평가할 수 없습니다.' }, { status: 400 });
    }

    // 같은 게시글에서 이미 평가했는지 확인
    const existing = await prisma.mannerReview.findUnique({
      where: { reviewerId_targetId_postId: { reviewerId: session.user.id, targetId, postId } },
    });

    if (existing) {
      return NextResponse.json({ error: '이미 평가했습니다.' }, { status: 409 });
    }

    await prisma.mannerReview.create({
      data: {
        score,
        reviewerId: session.user.id,
        targetId,
        postId,
      },
    });

    // 평균 매너 점수 업데이트
    const reviews = await prisma.mannerReview.findMany({
      where: { targetId },
      select: { score: true },
    });

    const avg = reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length;
    // 36.5 기준으로 +-0.5 단위 반영
    const newScore = Math.round((36.5 + (avg - 3) * 0.5) * 10) / 10;

    await prisma.user.update({
      where: { id: targetId },
      data: { mannerScore: Math.max(0, Math.min(50, newScore)) },
    });

    // 대상에게 알림
    await prisma.notification.create({
      data: {
        type: 'manner',
        message: `${session.user.name}님이 매너 평가를 남겼습니다.`,
        userId: targetId,
        postId,
      },
    });

    return NextResponse.json({ success: true, newScore });
  } catch (error) {
    console.error('매너 평가 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
