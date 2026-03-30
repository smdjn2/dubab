'use client';

import { useRouter } from 'next/navigation';

const AVATAR_COLORS = ['#D5E2D2', '#D6F0FF', '#E8D6FF', '#D6FFE4'];

export default function PostCard({ post }) {
  const router = useRouter();

  const hostInfo = [];
  if (post.showGender && post.host?.gender) hostInfo.push(post.host.gender);
  if (post.showAge && post.host?.ageGroup) hostInfo.push(post.host.ageGroup);

  const isClosed = post.status === 'closed';
  const isFull = post.currentPeople >= post.maxPeople || post.status === 'full';
  const isSoon = !isFull && !isClosed && post.time?.includes('오늘');

  return (
    <div
      onClick={() => router.push(`/post/${post.id}`)}
      className="bg-white mx-4 my-2 rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex justify-between items-start mb-2.5">
        <span className="text-xs font-semibold text-sage-500 bg-sage-100 px-2.5 py-1 rounded-full">
          {post.category}
        </span>
        <span className="text-xs text-gray-400">{post.time}</span>
      </div>

      <h3 className="text-[17px] font-bold mb-1.5 leading-snug">{post.title}</h3>

      {hostInfo.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-400">
          <span>{post.host?.emoji} {post.host?.name}</span>
          <span className="text-[11px] text-sage-500 bg-sage-100 px-2 py-0.5 rounded-lg">
            {hostInfo.join(' · ')}
          </span>
        </div>
      )}

      <div className="flex items-center gap-1 text-[13px] text-gray-500 mb-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
        {post.restaurant} · {post.location}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
          <div className="flex">
            {(post.participants || []).slice(0, 3).map((p, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[11px]"
                style={{ background: AVATAR_COLORS[i % 4], marginLeft: i > 0 ? '-8px' : 0 }}
              >
                {p.emoji}
              </div>
            ))}
          </div>
          {post.currentPeople}/{post.maxPeople}명
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          isClosed ? 'text-gray-500 bg-gray-100' :
          isFull ? 'text-red-500 bg-red-50' :
          isSoon ? 'text-amber-500 bg-amber-50' :
          'text-green-500 bg-green-50'
        }`}>
          {isClosed ? '종료' : isFull ? '마감' : isSoon ? '곧 마감' : '모집중'}
        </span>
      </div>
    </div>
  );
}