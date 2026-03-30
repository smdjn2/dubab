'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('hosted'); // hosted, joined
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (session) fetchProfile();
  }, [session, status]);

  useEffect(() => {
    if (session) fetchMyPosts();
  }, [session, activeTab]);

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

  async function fetchMyPosts() {
    setLoadingPosts(true);
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        if (activeTab === 'hosted') {
          setPosts(data.filter((p) => p.host?.id === session?.user?.id));
        } else {
          setPosts(data.filter((p) => p.participants?.some((part) => part.id === session?.user?.id)));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  }

  const settingsItems = [
    { label: '프로필 수정', path: '/my/edit' },
    { label: '이용약관', path: '/terms' },
  ];

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
            <div className="text-xl font-extrabold text-sage-500">{profile.mannerScore}°</div>
            <div className="text-xs text-gray-400 mt-0.5">매너온도</div>
          </div>
        </div>
      </div>

      {/* My Posts Tabs */}
      <div className="bg-white my-2">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('hosted')}
            className={`flex-1 py-3.5 text-[14px] font-semibold border-none cursor-pointer transition-colors ${
              activeTab === 'hosted' ? 'text-sage-500 border-b-2 border-sage-400 bg-white' : 'text-gray-400 bg-white'
            }`}
            style={activeTab === 'hosted' ? { borderBottom: '2px solid #8BA888' } : {}}
          >
            내가 올린 글
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            className={`flex-1 py-3.5 text-[14px] font-semibold border-none cursor-pointer transition-colors ${
              activeTab === 'joined' ? 'text-sage-500 bg-white' : 'text-gray-400 bg-white'
            }`}
            style={activeTab === 'joined' ? { borderBottom: '2px solid #8BA888' } : {}}
          >
            참여한 글
          </button>
        </div>

        <div className="p-4">
          {loadingPosts ? (
            <div className="text-center py-8 text-gray-400 text-sm">불러오는 중...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">🍽️</div>
              <div className="text-[13px]">{activeTab === 'hosted' ? '아직 올린 글이 없어요' : '아직 참여한 글이 없어요'}</div>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                onClick={() => router.push(`/post/${post.id}`)}
                className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-b-0 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-sage-500 bg-sage-100 px-2 py-0.5 rounded-full font-medium">{post.category}</span>
                    {post.status === 'full' && <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">마감</span>}
                    {post.status === 'closed' && <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">종료</span>}
                  </div>
                  <div className="text-[14px] font-semibold mt-1 truncate">{post.title}</div>
                  <div className="text-[12px] text-gray-400 mt-0.5">{post.restaurant} · 👥 {post.currentPeople}/{post.maxPeople}</div>
                </div>
                <span className="text-gray-300 flex-shrink-0">›</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white my-2 p-5">
        <h3 className="text-base font-bold mb-3.5">설정</h3>
        {settingsItems.map((item) => (
          <div
            key={item.label}
            onClick={() => router.push(item.path)}
            className="flex justify-between items-center py-3.5 border-b border-gray-50 last:border-b-0 cursor-pointer"
          >
            <span className="text-[15px]">{item.label}</span>
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
