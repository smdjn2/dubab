const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 테스트 유저 생성
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'test@dubab.kr',
        password: await bcrypt.hash('test1234', 10),
        name: '맛집탐험가',
        emoji: '😋',
        area: '강남동',
        gender: '남',
        ageGroup: '20대',
      },
    }),
    prisma.user.create({
      data: {
        name: '초밥러버', emoji: '🍣', area: '역삼동',
        gender: '여', ageGroup: '30대',
        email: 'sushi@dubab.kr',
        password: await bcrypt.hash('test1234', 10),
      },
    }),
    prisma.user.create({
      data: {
        name: '치킨마스터', emoji: '🍗', area: '삼성동',
        gender: '남', ageGroup: '30대',
        email: 'chicken@dubab.kr',
        password: await bcrypt.hash('test1234', 10),
      },
    }),
    prisma.user.create({
      data: {
        name: '헬스인', emoji: '💪', area: '역삼동',
        gender: '남', ageGroup: '20대',
        email: 'health@dubab.kr',
        password: await bcrypt.hash('test1234', 10),
      },
    }),
    prisma.user.create({
      data: {
        name: '떡순이', emoji: '🍢', area: '서초동',
        gender: '여', ageGroup: '20대',
        email: 'tteok@dubab.kr',
        password: await bcrypt.hash('test1234', 10),
      },
    }),
  ]);

  // 테스트 모집글 생성
  const posts = [
    {
      title: '마라탕 같이 먹을 사람! 🌶️',
      category: '중식',
      restaurant: '하이디라오 강남점',
      location: '강남역 3번 출구',
      time: '오늘 저녁 7:00',
      description: '마라탕 레벨3 이상 가능하신 분! 마라샹궈도 시킬 예정이에요.',
      conditions: '매운 거 잘 드시는 분',
      maxPeople: 4,
      currentPeople: 1,
      showGender: true,
      showAge: true,
      hostId: users[0].id,
    },
    {
      title: '점심에 초밥 어때요? 🍣',
      category: '일식',
      restaurant: '스시히로 역삼점',
      location: '역삼역 1번 출구',
      time: '오늘 낮 12:00',
      description: '적당한 초밥집이에요. 런치 세트 먹으려고 합니다!',
      maxPeople: 3,
      currentPeople: 1,
      showGender: false,
      showAge: true,
      hostId: users[1].id,
    },
    {
      title: '퇴근 후 치맥 한 잔 🍺',
      category: '술',
      restaurant: 'BBQ치킨 선릉점',
      location: '선릉역 5번 출구',
      time: '오늘 저녁 8:30',
      description: '금요일 퇴근 후 가볍게 치맥 한 잔 하실 분!',
      conditions: '성인만',
      maxPeople: 6,
      currentPeople: 1,
      showGender: true,
      showAge: false,
      hostId: users[2].id,
    },
    {
      title: '샐러드 같이 먹어요 🥗',
      category: '양식',
      restaurant: '스윗그린 강남점',
      location: '강남역 11번 출구',
      time: '내일 낮 12:30',
      description: '운동 후 가볍게 샐러드 먹을 분! 건강한 대화 나눠요',
      conditions: '건강한 식단에 관심 있는 분',
      maxPeople: 2,
      currentPeople: 1,
      showGender: true,
      showAge: true,
      hostId: users[3].id,
    },
    {
      title: '떡볶이 먹방 갈 사람~ 🍢',
      category: '분식',
      restaurant: '엽기떡볶이 서초점',
      location: '서초역 4번 출구',
      time: '오늘 저녁 6:00',
      description: '엽떡 까르보 + 주먹밥 조합! 같이 먹방해요~',
      maxPeople: 4,
      currentPeople: 1,
      showGender: true,
      showAge: true,
      hostId: users[4].id,
    },
  ];

  for (const postData of posts) {
    const post = await prisma.post.create({ data: postData });
    // 호스트를 참여자로도 추가
    await prisma.participant.create({
      data: { userId: postData.hostId, postId: post.id },
    });
  }

  console.log('시드 데이터 생성 완료!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());