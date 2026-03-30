'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function ChatListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (session) fetchRooms();
  }, [session, status]);

  async function fetchRooms() {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '방금';
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-400 animate-pulse text-4xl">💬</div>;
  }

  return (
    <div className="pb-20 min-h-screen bg-sage-50 animate-[fadeIn_0.25s_ease]">
      {/* Header */}
      <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 z-50">
        <h1 className="text-lg font-bold">채팅</h1>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">💬</div>
          <div className="text-[15px]">아직 참여 중인 채팅방이 없어요</div>
          <div className="text-[13px] mt-1">모집에 참여하면 채팅방이 생겨요</div>
        </div>
      ) : (
        <div>
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => router.push(`/chat/${room.id}`)}
              className="flex items-center gap-3 px-5 py-4 bg-white border-b border-gray-50 cursor-pointer hover:bg-sage-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-sage-200 flex items-center justify-center text-lg flex-shrink-0">
                🍽️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold truncate">{room.postTitle}</span>
                  <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
                    {room.lastMessage ? formatTime(room.lastMessage.createdAt) : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[13px] text-gray-400 truncate">
                    {room.lastMessage
                      ? `${room.lastMessage.senderName}: ${room.lastMessage.content}`
                      : '아직 대화가 없습니다'}
                  </span>
                  <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
                    👥 {room.currentPeople}/{room.maxPeople}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
