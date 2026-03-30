import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    // 카카오 로그인
    {
      id: 'kakao',
      name: '카카오',
      type: 'oauth',
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      authorization: {
        url: 'https://kauth.kakao.com/oauth/authorize',
        params: { scope: 'profile_nickname account_email' },
      },
      token: 'https://kauth.kakao.com/oauth/token',
      userinfo: 'https://kapi.kakao.com/v2/user/me',
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.kakao_account?.profile?.nickname ?? '듀밥유저',
          email: profile.kakao_account?.email,
          kakaoId: String(profile.id),
        };
      },
    },
    // 이메일/비밀번호 로그인
    CredentialsProvider({
      name: '이메일',
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emoji: user.emoji,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'kakao') {
        // 카카오 유저 upsert
        const existing = await prisma.user.findUnique({
          where: { kakaoId: user.kakaoId || String(user.id) },
        });
        if (!existing) {
          await prisma.user.create({
            data: {
              kakaoId: user.kakaoId || String(user.id),
              name: user.name || '듀밥유저',
              email: user.email,
              emoji: '😊',
              area: '역삼동',
            },
          });
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        // 로그인 시 DB에서 유저 조회
        let dbUser;
        if (account?.provider === 'kakao') {
          dbUser = await prisma.user.findUnique({
            where: { kakaoId: user.kakaoId || String(user.id) },
          });
        } else {
          dbUser = await prisma.user.findUnique({
            where: { id: user.id },
          });
        }
        if (dbUser) {
          token.userId = dbUser.id;
          token.emoji = dbUser.emoji;
          token.area = dbUser.area;
          token.gender = dbUser.gender;
          token.ageGroup = dbUser.ageGroup;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId;
        session.user.emoji = token.emoji;
        session.user.area = token.area;
        session.user.gender = token.gender;
        session.user.ageGroup = token.ageGroup;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,
};