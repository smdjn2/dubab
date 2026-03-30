'use client';

import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import PostCard from '@/components/PostCard';

const CATEGORIES = ['전체', '한식', '중식', '일식', '양식', '분식', '카페', '술', '기타'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('전체');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('dubab_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  async function handleSearch(searchQuery) {
    const q = searchQuery || query;
    if (!q.trim() && category === '전체') return;

    setLoading(true);
    setSearched(true);

    // 최근 검색어 저장
    if (q.trim()) {
      const updated = [q.trim(), ...recentSearches.filter((s) => s !== q.trim())].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('dubab_recent_searches', JSON.stringify(updated));
    }

    try {
      const params = new URLSearchParams();
      if (category !== '전체') params.set('category', category);
      if (q.trim()) params.set('search', q.trim());

      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function clearRecentSearches() {
    setRecentSearches([]);
    localStorage.removeItem('dubab_recent_searches');
  }

  return (
    <div className="pb-20 min-h-screen bg-sage-50 animate-[fadeIn_0.25s_ease]">
      {/* Search Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="w-full py-3.5 pl-11 pr-4 border-[1.5px] border-gray-200 rounded-xl text-[15px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors"
            placeholder="음식, 장소, 키워드로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            autoFocus
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); if (searched) handleSearch(); }}
              className={`whitespace-nowrap px-3.5 py-2 rounded-full text-[13px] font-medium border-[1.5px] flex-shrink-0 transition-all ${
                category === cat
                  ? 'border-sage-400 bg-sage-100 text-sage-500'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Searches */}
      {!searched && recentSearches.length > 0 && (
        <div className="bg-white my-2 p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[15px] font-bold">최근 검색어</h3>
            <button onClick={clearRecentSearches} className="text-xs text-gray-400 bg-transparent border-none cursor-pointer">
              전체 삭제
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s, i) => (
              <button
                key={i}
                onClick={() => { setQuery(s); handleSearch(s); }}
                className="px-3.5 py-2 bg-gray-100 rounded-full text-[13px] text-gray-600 border-none cursor-pointer hover:bg-sage-100 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {searched && (
        <div className="py-1">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3 animate-pulse">🔍</div>
              <div className="text-sm">검색 중...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">😅</div>
              <div className="text-[15px]">검색 결과가 없어요</div>
              <div className="text-[13px] mt-1">다른 키워드로 검색해보세요</div>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}

      {/* Empty State */}
      {!searched && recentSearches.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🔍</div>
          <div className="text-[15px]">먹고 싶은 음식이나 장소를 검색해보세요</div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
