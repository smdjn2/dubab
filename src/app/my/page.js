'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (session) fetchProfile();
  }, [session, status]);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (!profile) {
    return <div className="flex items-center justify-center h-screen text-gray-400 animate-pulse text-4xl">😊</div>;
  }

  return (
    <div className="bg-sage-50 min-h-screen pb-20 animate-[fadeIn_0.25s_ease]">
      {/* Profile */}
      <div className="bg-white pt-8 pb-6 px-5 text-center">
        <div className="w-[72px] h-[72px] rounded-full bg-sage-200 mx-auto mb-3 flex items-center justify-center text-[32px]">
          {profile.emoji}
        </div>
        <div className="text-xl font-bold mb-1">{profile.name}</div>
        <div className="flex justify-center gap-2 mb-1.5">
          {profile.gender && (
            <span className="text-[13px] text-sage-500 bg-sage-100 px-3 py-1 rounded-full font-medium">
              {profile.gender === '남' ? '남성' : '여성'}
            </span>
          )}
          {profile.ageGroup && (
            <span className="text-[13px] text-sage-500 bg-sage-100 px-3 py-1 rounded-full font-medium">
              {profile.ageGroup}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-400">📍 {profile.area}</div>

        <div className="flex justify-center gap-8 mt-5">
          <div className="text-center">
            <div className="text-xl font-extrabold text-sage-500">{profile._count?.posts || 0}</div>
            <div className="text-xs text-gray-400 mt-0.5">모집</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-extrabold text-sage-500">{profile._count?.participants || 0}</div>
            <div className="text-xs text-gray-400 mt-0.5">참여</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-extrabold text-sage-500">{profile.mannerScore}</div>
            <div className="text-xs text-gray-400 mt-0.5">매너온도</div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white my-2 p-5">
        <h3 className="text-base font-bold mb-3.5">설정</h3>
        {['내 동네 설정', '프로필 수정', '알림 설정', '이용약관'].map((item) => (
          <div key={item} className="flex justify-between items-center py-3.5 border-b border-gray-50 last:border-b-0 cursor-pointer">
            <span className="text-[15px]">{item}</span>
            <span className="text-gray-300">›</span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="bg-white my-2 p-5">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full py-3.5 border-[1.5px] border-gray-200 rounded-xl text-[15px] text-gray-500 bg-transparent cursor-pointer hover:bg-gray-50 transition-colors"
        >
          로그아웃
        </button>
      </div>

      <BottomNav />
    </div>
  );
}