'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import BottomNav from '@/components/BottomNav';
import PostCard from '@/components/PostCard';

const CATEGORIES = ['전체', '한식', '중식', '일식', '양식', '분식', '카페', '술', '기타'];

export default function HomePage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [blockedIds, setBlockedIds] = useState([]);

  useEffect(() => {
    if (session) fetchBlockList();
  }, [session]);

  useEffect(() => {
    fetchPosts();
  }, [activeFilter, searchQuery, blockedIds]);

  async function fetchBlockList() {
    try {
      const res = await fetch('/api/block');
      if (res.ok) {
        const blocks = await res.json();
        setBlockedIds(blocks.map((b) => b.blocked.id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchPosts() {
    try {
      const params = new URLSearchParams();
      if (activeFilter !== '전체') params.set('category', activeFilter);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();

      // 차단한 사용자의 게시글 필터링
      const filtered = blockedIds.length > 0
        ? data.filter((post) => !blockedIds.includes(post.host?.id))
        : data;

      setPosts(filtered);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white px-5 py-4 flex items-center justify-between border-b border-gray-100 z-50">
        <h1 className="text-[22px] font-extrabold text-sage-500">듀밥</h1>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          {session?.user?.area || '강남구 역삼동'}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-medium border-[1.5px] flex-shrink-0 transition-all ${
              activeFilter === cat
                ? 'border-sage-400 bg-sage-100 text-sage-500'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="py-1">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3 animate-pulse">🍽️</div>
            <div className="text-sm">불러오는 중...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🍽️</div>
            <div className="text-[15px]">아직 모집글이 없어요</div>
            <div className="text-[13px] mt-1">첫 번째 모집글을 올려보세요!</div>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      <BottomNav />
    </div>
  );
}
