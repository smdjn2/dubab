import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/report
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { reason, targetUserId, postId } = await request.json();

    if (!reason?.trim() || !targetUserId) {
      return NextResponse.json({ error: '신고 사유와 대상을 입력해주세요.' }, { status: 400 });
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: '자신을 신고할 수 없습니다.' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reason: reason.trim(),
        reporterId: session.user.id,
        targetUserId,
        postId: postId || null,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('신고 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
