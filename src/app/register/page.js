'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const AGE_GROUPS = ['10대', '20대', '30대', '40대', '50대+'];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '', password: '', passwordConfirm: '',
    name: '', gender: '', ageGroup: '', area: '역삼동',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.passwordConfirm) {
      return setError('비밀번호가 일치하지 않습니다.');
    }
    if (form.password.length < 6) {
      return setError('비밀번호는 6자 이상이어야 합니다.');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          gender: form.gender || null,
          ageGroup: form.ageGroup || null,
          area: form.area,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '회원가입에 실패했습니다.');
        return;
      }

      // 자동 로그인
      await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      router.push('/');
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="border-none bg-transparent text-2xl text-gray-400 cursor-pointer">✕</button>
        <h2 className="text-lg font-bold">회원가입</h2>
        <div className="w-6" />
      </div>

      <form onSubmit={handleSubmit} className="p-5">
        {/* 이름 */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">닉네임 *</label>
          <input
            className="w-full py-3.5 px-4 border-[1.5px] border-gray-200 rounded-xl text-[15px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors"
            placeholder="듀밥에서 사용할 닉네임"
            value={form.name} onChange={(e) => update('name', e.target.value)} required
          />
        </div>

        {/* 이메일 */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">이메일 *</label>
          <input
            type="email"
            className="w-full py-3.5 px-4 border-[1.5px] border-gray-200 rounded-xl text-[15px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors"
            placeholder="example@email.com"
            value={form.email} onChange={(e) => update('email', e.target.value)} required
          />
        </div>

        {/* 비밀번호 */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">비밀번호 *</label>
          <input
            type="password"
            className="w-full py-3.5 px-4 border-[1.5px] border-gray-200 rounded-xl text-[15px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors mb-3"
            placeholder="6자 이상"
            value={form.password} onChange={(e) => update('password', e.target.value)} required
          />
          <input
            type="password"
            className="w-full py-3.5 px-4 border-[1.5px] border-gray-200 rounded-xl text-[15px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors"
            placeholder="비밀번호 확인"
            value={form.passwordConfirm} onChange={(e) => update('passwordConfirm', e.target.value)} required
          />
        </div>

        {/* 성별 */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">성별</label>
          <div className="flex gap-2">
            {['남', '여'].map((g) => (
              <button
                key={g} type="button"
                onClick={() => update('gender', form.gender === g ? '' : g)}
                className={`flex-1 py-3 border-[1.5px] rounded-xl text-sm cursor-pointer transition-all ${
                  form.gender === g ? 'border-sage-400 bg-sage-100 text-sage-500 font-semibold' : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                {g === '남' ? '남성' : '여성'}
              </button>
            ))}
          </div>
        </div>

        {/* 나이대 */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">나이대</label>
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((age) => (
              <button
                key={age} type="button"
                onClick={() => update('ageGroup', form.ageGroup === age ? '' : age)}
                className={`px-4 py-2.5 border-[1.5px] rounded-full text-sm cursor-pointer transition-all ${
                  form.ageGroup === age ? 'border-sage-400 bg-sage-100 text-sage-500 font-semibold' : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {/* 동네 */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">동네</label>
          <input
            className="w-full py-3.5 px-4 border-[1.5px] border-gray-200 rounded-xl text-[15px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors"
            placeholder="예: 역삼동"
            value={form.area} onChange={(e) => update('area', e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 border-none rounded-[14px] text-base font-bold cursor-pointer text-white bg-sage-400 transition-all active:scale-[0.97] disabled:opacity-50"
        >
          {loading ? '가입 중...' : '가입하기'}
        </button>
      </form>
    </div>
  );
}