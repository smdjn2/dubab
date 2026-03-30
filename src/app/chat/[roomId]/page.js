'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';

export default function ChatRoomPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const messagesRef = useRef([]);

  // Keep messagesRef in sync to avoid stale closure
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (session) {
      fetchMessages();
      pollRef.current = setInterval(pollNewMessages, 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [session, status]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/chat/${params.roomId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function pollNewMessages() {
    try {
      const current = messagesRef.current;
      const lastMsg = current[current.length - 1];
      const after = lastMsg ? lastMsg.createdAt : '';
      const res = await fetch(`/api/chat/${params.roomId}${after ? `?after=${after}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            const newMsgs = data.filter((m) => !ids.has(m.id));
            return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSend() {
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/chat/${params.roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.trim() }),
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setInput('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateStr) {
    const d = new Date(dateStr);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${m}`;
  }

  return (
    <div className="flex flex-col h-screen bg-sage-50 animate-[fadeIn_0.25s_ease]">
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center gap-3 border-b border-gray-100 flex-shrink-0">
        <button onClick={() => router.push('/chat')} className="border-none bg-transparent cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="text-[16px] font-bold flex-1">채팅</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-[13px]">
            첫 번째 메시지를 보내보세요!
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.sender?.id === session?.user?.id || msg.senderId === session?.user?.id;
          const showAvatar = !isMe && (i === 0 || messages[i - 1]?.senderId !== msg.senderId);

          return (
            <div key={msg.id} className={`flex mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <div className="w-8 mr-2 flex-shrink-0">
                  {showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-sage-200 flex items-center justify-center text-sm">
                      {msg.sender?.emoji || '😊'}
                    </div>
                  )}
                </div>
              )}
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                {showAvatar && !isMe && (
                  <div className="text-[12px] text-gray-500 mb-0.5 ml-1">{msg.sender?.name}</div>
                )}
                <div className={`flex items-end gap-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
                      isMe
                        ? 'bg-sage-400 text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] border-t border-gray-100 flex gap-2 flex-shrink-0">
        <input
          className="flex-1 py-3 px-4 border-[1.5px] border-gray-200 rounded-full text-[14px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors"
          placeholder="메시지를 입력하세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-11 h-11 rounded-full bg-sage-400 border-none flex items-center justify-center cursor-pointer text-white disabled:opacity-50 transition-all active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
