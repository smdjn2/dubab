'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else {
      router.push('/');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="text-5xl mb-3">🍽️</div>
        <h1 className="text-3xl font-extrabold text-sage-500">듀밥</h1>
        <p className="text-sm text-gray-400 mt-2">같이 밥 먹을 사람을 찾아보세요</p>
      </div>

      {/* Kakao Login */}
      <button
        onClick={() => signIn('kakao', { callbackUrl: '/' })}
        className="w-full py-4 rounded-[14px] text-base font-bold cursor-pointer mb-3 border-none transition-all active:scale-[0.97]"
        style={{ background: '#FEE500', color: '#191919' }}
      >
        카카오로 시작하기
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 w-full my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">또는</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Email Login */}
      <form onSubmit={handleEmailLogin} className="w-full">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full py-3.5 px-4 border-[1.5px] border-gray-200 rounded-xl text-[15px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors mb-3"
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full py-3.5 px-4 border-[1.5px] border-gray-200 rounded-xl text-[15px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors mb-3"
          required
        />

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 border-none rounded-[14px] text-base font-bold cursor-pointer text-white bg-sage-400 transition-all active:scale-[0.97] disabled:opacity-50"
        >
          {loading ? '로그인 중...' : '이메일로 로그인'}
        </button>
      </form>

      <button
        onClick={() => router.push('/register')}
        className="mt-4 text-sm text-gray-400 bg-transparent border-none cursor-pointer hover:text-sage-500 transition-colors"
      >
        계정이 없으신가요? <span className="font-semibold text-sage-500">회원가입</span>
      </button>
    </div>
  );
}