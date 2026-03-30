import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/posts - 모집글 목록 조회
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where = {};
    if (category && category !== '전체') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { restaurant: { contains: search } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
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
        },
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 호스트의 성별/나이대 공개 설정에 따라 필터링
    const formatted = posts.map((post) => ({
      id: post.id,
      title: post.title,
      category: post.category,
      restaurant: post.restaurant,
      location: post.location,
      time: post.time,
      description: post.description,
      conditions: post.conditions,
      maxPeople: post.maxPeople,
      currentPeople: post.currentPeople,
      showGender: post.showGender,
      showAge: post.showAge,
      status: post.status,
      createdAt: post.createdAt,
      likesCount: post._count.likes,
      host: {
        ...post.host,
        gender: post.showGender ? post.host.gender : null,
        ageGroup: post.showAge ? post.host.ageGroup : null,
      },
      participants: post.participants.map((p) => ({
        ...p.user,
        gender: post.showGender ? p.user.gender : null,
        ageGroup: post.showAge ? p.user.ageGroup : null,
        joinedAt: p.joinedAt,
      })),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('게시글 조회 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// POST /api/posts - 모집글 생성
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { title, category, restaurant, location, time, description, conditions, maxPeople, showGender, showAge } = body;

    if (!title || !category || !restaurant || !time) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        category,
        restaurant,
        location: location || '위치 미정',
        time,
        description: description || '같이 맛있게 먹어요!',
        conditions: conditions || '없음',
        maxPeople: maxPeople || 4,
        showGender: showGender ?? true,
        showAge: showAge ?? true,
        hostId: session.user.id,
      },
    });

    // 호스트를 첫 번째 참여자로 추가
    await prisma.participant.create({
      data: { userId: session.user.id, postId: post.id },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('게시글 생성 에러:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}