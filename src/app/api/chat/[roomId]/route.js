import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/chat/:roomId - 메시지 조회
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const after = searchParams.get('after');

    const room = await prisma.chatRoom.findUnique({
      where: { id: params.roomId },
      select: { postId: true },
    });

    if (!room) {
      return NextResponse.json({ error: '채팅방을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 참여자인지 확인
    const participant = await prisma.participant.findUnique({
      where: { userId_postId: { userId: session.user.id, postId: room.postId } },
    });

    if (!participant) {
      return NextResponse.json({ error: '참여자만 채팅을 볼 수 있습니다.' }, { status: 403 });
    }

    const where = { roomId: params.roomId };
    if (after) {
      where.createdAt = { gt: new Date(after) };
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true, emoji: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('메시지 조회 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// POST /api/chat/:roomId - 메시지 전송
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: '메시지를 입력해주세요.' }, { status: 400 });
    }

    const room = await prisma.chatRoom.findUnique({
      where: { id: params.roomId },
      select: { postId: true },
    });

    if (!room) {
      return NextResponse.json({ error: '채팅방을 찾을 수 없습니다.' }, { status: 404 });
    }

    const participant = await prisma.participant.findUnique({
      where: { userId_postId: { userId: session.user.id, postId: room.postId } },
    });

    if (!participant) {
      return NextResponse.json({ error: '참여자만 메시지를 보낼 수 있습니다.' }, { status: 403 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        roomId: params.roomId,
        senderId: session.user.id,
      },
      include: {
        sender: { select: { id: true, name: true, emoji: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('메시지 전송 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
