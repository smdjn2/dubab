# 듀밥 🍽️

같이 밥 먹을 사람을 찾는 동네 기반 웹앱

## 기술 스택

- **프론트엔드**: Next.js 14 (App Router) + Tailwind CSS
- **백엔드**: Next.js API Routes
- **데이터베이스**: Prisma ORM + SQLite (개발) / Vercel Postgres (배포)
- **인증**: NextAuth.js (카카오 소셜 + 이메일/비밀번호)
- **배포**: Vercel

---

## 로컬 개발 환경 세팅

### 1. 의존성 설치

```bash
cd dubab
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 아래 값을 설정:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="아무-랜덤-문자열-여기에-입력"
```

> 카카오 로그인은 선택사항입니다. 없으면 이메일 로그인만 사용 가능합니다.

### 3. 데이터베이스 초기화

```bash
npx prisma db push
npm run db:seed
```

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 으로 접속!

테스트 계정: `test@dubab.kr` / `test1234`

---

## Vercel 배포 방법

### 1. GitHub에 코드 올리기

```bash
git init
git add .
git commit -m "듀밥 초기 버전"
git remote add origin https://github.com/YOUR_USERNAME/dubab.git
git push -u origin main
```

### 2. Vercel에서 배포

1. [vercel.com](https://vercel.com) 에 GitHub로 로그인
2. "New Project" → GitHub 레포 선택
3. **Environment Variables** 탭에서 아래 변수 추가:

| 변수명 | 값 |
|--------|-----|
| `DATABASE_URL` | Vercel Postgres 연결 문자열 |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | 랜덤 문자열 (터미널에서 `openssl rand -base64 32`) |
| `KAKAO_CLIENT_ID` | 카카오 REST API 키 (선택) |
| `KAKAO_CLIENT_SECRET` | 카카오 Client Secret (선택) |

4. "Deploy" 클릭!

### 3. 배포용 DB 설정 (Vercel Postgres)

1. Vercel 대시보드 → Storage → Create Database → Postgres
2. 생성된 연결 문자열을 `DATABASE_URL`에 설정
3. `prisma/schema.prisma`에서 provider를 변경:

```prisma
datasource db {
  provider = "postgresql"   // sqlite → postgresql로 변경
  url      = env("DATABASE_URL")
}
```

4. 재배포하면 자동으로 테이블이 생성됩니다

### 4. 카카오 로그인 설정 (선택)

1. [developers.kakao.com](https://developers.kakao.com) 접속
2. 앱 생성 → REST API 키 복사
3. 카카오 로그인 → 활성화
4. Redirect URI 추가: `https://your-app.vercel.app/api/auth/callback/kakao`
5. 동의항목: 닉네임, 이메일 선택

---

## 프로젝트 구조

```
dubab/
├── prisma/
│   ├── schema.prisma      # DB 스키마
│   └── seed.js            # 시드 데이터
├── public/
│   └── manifest.json      # PWA 설정
├── src/
│   ├── app/
│   │   ├── page.js        # 홈 (피드)
│   │   ├── layout.js      # 루트 레이아웃
│   │   ├── globals.css    # 전역 스타일
│   │   ├── login/         # 로그인
│   │   ├── register/      # 회원가입
│   │   ├── create/        # 모집글 작성
│   │   ├── post/[id]/     # 모집글 상세
│   │   ├── my/            # 마이페이지
│   │   └── api/
│   │       ├── auth/      # 인증 API
│   │       ├── posts/     # 모집글 CRUD
│   │       └── user/      # 유저 프로필
│   ├── components/
│   │   ├── BottomNav.js
│   │   ├── PostCard.js
│   │   └── Toggle.js
│   ├── lib/
│   │   ├── prisma.js      # Prisma 클라이언트
│   │   └── auth.js        # NextAuth 설정
│   └── middleware.js       # 인증 미들웨어
├── package.json
├── tailwind.config.js
└── vercel.json
```

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/posts` | 모집글 목록 (필터/검색) |
| POST | `/api/posts` | 모집글 생성 |
| GET | `/api/posts/:id` | 모집글 상세 |
| DELETE | `/api/posts/:id` | 모집글 삭제 |
| POST | `/api/posts/:id/join` | 참여하기 |
| DELETE | `/api/posts/:id/join` | 참여 취소 |
| POST | `/api/posts/:id/like` | 좋아요 토글 |
| GET | `/api/user` | 내 프로필 |
| PATCH | `/api/user` | 프로필 수정 |
| POST | `/api/auth/register` | 회원가입 |
