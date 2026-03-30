'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

const AVATAR_COLORS = ['#D5E2D2', '#D6F0FF', '#E8D6FF', '#D6FFE4'];

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [params.id]);

  async function fetchPost() {
    try {
      const res = await fetch(`/api/posts/${params.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPost(data);
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!session) return router.push('/login');
    const res = await fetch(`/api/posts/${params.id}/join`, { method: 'POST' });
    if (res.ok) fetchPost();
  }

  async function handleLike() {
    if (!session) return router.push('/login');
    await fetch(`/api/posts/${params.id}/like`, { method: 'POST' });
    fetchPost();
  }

  if (loading || !post) {
    return <div className="flex items-center justify-center h-screen text-gray-400 animate-pulse text-4xl">🍽️</div>;
  }

  const isFull = post.currentPeople >= post.maxPeople;
  const hostInfo = [];
  if (post.showGender && post.host?.gender) hostInfo.push(post.host.gender);
  if (post.showAge && post.host?.ageGroup) hostInfo.push(post.host.ageGroup);

  return (
    <div className="pb-24 animate-[fadeIn_0.25s_ease]">
      {/* Header */}
      <div className="bg-white p-5">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[15px] text-gray-500 border-none bg-transparent cursor-pointer mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          뒤로
        </button>

        <span className="inline-block text-[13px] font-semibold text-sage-500 bg-sage-100 px-3 py-1.5 rounded-full mb-3">
          {post.category}
        </span>
        <h2 className="text-[22px] font-extrabold leading-tight mb-2">{post.title}</h2>

        <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-gray-100">
          <div className="w-10 h-10 rounded-full bg-sage-200 flex items-center justify-center text-lg">
            {post.host?.emoji}
          </div>
          <div>
            <div className="text-[15px] font-semibold">{post.host?.name}</div>
            <div className="text-[13px] text-gray-400">📍 {post.host?.area}</div>
            {hostInfo.length > 0 && (
              <div className="flex gap-1.5 mt-1">
                {hostInfo.map((info, i) => (
                  <span key={i} className="text-[11px] text-sage-500 bg-sage-100 px-2 py-0.5 rounded-lg">{info}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info rows */}
      <div className="bg-white my-2 p-5">
        {[
          { icon: '📍', label: '장소', value: post.restaurant, sub: post.location },
          { icon: '🕐', label: '시간', value: post.time },
          { icon: '👥', label: '인원', value: `${post.currentPeople}/${post.maxPeople}명` },
          ...(post.conditions && post.conditions !== '없음' ? [{ icon: '📋', label: '참여 조건', value: post.conditions }] : []),
        ].map((row, i) => (
          <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-b-0">
            <div className="w-9 h-9 rounded-[10px] bg-sage-50 flex items-center justify-center text-lg flex-shrink-0">{row.icon}</div>
            <div>
              <div className="text-xs text-gray-400">{row.label}</div>
              <div className="text-[15px] font-medium">{row.value}</div>
              {row.sub && <div className="text-[13px] text-gray-400 mt-0.5">{row.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="bg-white my-2 p-5">
        <h3 className="text-base font-bold mb-2.5">상세 내용</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{post.description}</p>
      </div>

      {/* Participants */}
      <div className="bg-white my-2 p-5">
        <h3 className="text-base font-bold mb-3.5">참여자 ({post.currentPeople}/{post.maxPeople})</h3>
        {(post.participants || []).map((p, i) => {
          const pInfo = [];
          if (post.showGender && p.gender) pInfo.push(p.gender);
          if (post.showAge && p.ageGroup) pInfo.push(p.ageGroup);
          return (
            <div key={i} className="flex items-center gap-2.5 py-2.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                style={{ background: AVATAR_COLORS[i % 4] }}>{p.emoji}</div>
              <span className="text-sm font-medium">{p.name}</span>
              {i === 0 && <span className="text-[11px] text-sage-500 bg-sage-100 px-2 py-0.5 rounded-lg ml-1">파티장</span>}
              {pInfo.length > 0 && <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg ml-1">{pInfo.join(' · ')}</span>}
            </div>
          );
        })}
      </div>

      {/* Join bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] border-t border-gray-100 flex gap-3 items-center">
        <button
          onClick={handleLike}
          className={`w-[52px] h-[52px] border-[1.5px] rounded-[14px] flex items-center justify-center bg-white cursor-pointer text-[22px] transition-all ${
            post.isLiked ? 'border-sage-400 bg-sage-100' : 'border-gray-200'
          }`}
        >
          <span style={{ color: post.isLiked ? '#6E8F6B' : '#ccc' }}>{post.isLiked ? '♥' : '♡'}</span>
        </button>
        <button
          onClick={handleJoin}
          disabled={isFull && !post.isJoined}
          className={`flex-1 py-4 border-none rounded-[14px] text-base font-bold cursor-pointer transition-all text-white ${
            post.isJoined ? 'bg-green-500' : isFull ? 'bg-gray-300 text-gray-500 cursor-default' : 'bg-sage-400 active:scale-[0.97]'
          }`}
        >
          {post.isJoined ? '참여 완료 ✓' : isFull ? '인원 마감' : '참여하기'}
        </button>
      </div>
    </div>
  );
}