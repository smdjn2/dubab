import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/chat - 내 채팅방 목록
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 내가 참여중인 게시글의 채팅방 조회
    const participants = await prisma.participant.findMany({
      where: { userId: session.user.id },
      select: { postId: true },
    });

    const postIds = participants.map((p) => p.postId);

    const chatRooms = await prisma.chatRoom.findMany({
      where: { postId: { in: postIds } },
      include: {
        post: {
          select: { id: true, title: true, category: true, currentPeople: true, maxPeople: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = chatRooms.map((room) => ({
      id: room.id,
      postId: room.post.id,
      postTitle: room.post.title,
      category: room.post.category,
      currentPeople: room.post.currentPeople,
      maxPeople: room.post.maxPeople,
      lastMessage: room.messages[0]
        ? { content: room.messages[0].content, senderName: room.messages[0].sender.name, createdAt: room.messages[0].createdAt }
        : null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('채팅방 목록 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
