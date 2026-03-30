'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

const NOTIFICATION_ICONS = {
  join: '👋',
  comment: '💬',
  chat: '📨',
  manner: '⭐',
};

export default function AlertsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (session) fetchNotifications();
  }, [session, status]);

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  function formatTime(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '방금';
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-400 animate-pulse text-4xl">🔔</div>;
  }

  return (
    <div className="pb-20 min-h-screen bg-sage-50 animate-[fadeIn_0.25s_ease]">
      {/* Header */}
      <div className="sticky top-0 bg-white px-5 py-4 flex items-center justify-between border-b border-gray-100 z-50">
        <h1 className="text-lg font-bold">알림</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[13px] text-sage-500 bg-transparent border-none cursor-pointer font-medium"
          >
            모두 읽음
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🔔</div>
          <div className="text-[15px]">아직 알림이 없어요</div>
          <div className="text-[13px] mt-1">모집에 참여하면 알림을 받을 수 있어요</div>
        </div>
      ) : (
        <div>
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => n.postId && router.push(`/post/${n.postId}`)}
              className={`flex items-start gap-3 px-5 py-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-sage-50 ${
                !n.isRead ? 'bg-sage-50/80' : 'bg-white'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center text-lg flex-shrink-0">
                {NOTIFICATION_ICONS[n.type] || '📢'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[14px] leading-relaxed ${!n.isRead ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                  {n.message}
                </p>
                <span className="text-[12px] text-gray-400 mt-1 block">{formatTime(n.createdAt)}</span>
              </div>
              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-sage-400 flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
