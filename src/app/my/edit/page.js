'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const AGE_GROUPS = ['10대', '20대', '30대', '40대', '50대+'];
const EMOJIS = ['😊', '😎', '🤗', '😋', '🥰', '🤩', '😇', '🧑‍🍳', '🍔', '🍕', '🍣', '🍜', '🍰', '🍗', '🥗', '🍺'];

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', emoji: '😊', area: '', gender: '', ageGroup: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (session) fetchProfile();
  }, [session, status]);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setForm({
          name: data.name || '',
          emoji: data.emoji || '😊',
          area: data.area || '',
          gender: data.gender || '',
          ageGroup: data.ageGroup || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push('/my');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-400 animate-pulse text-4xl">😊</div>;
  }

  return (
    <div className="min-h-screen bg-white animate-[fadeIn_0.25s_ease]">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="border-none bg-transparent text-2xl text-gray-400 cursor-pointer">✕</button>
        <h2 className="text-lg font-bold">프로필 수정</h2>
        <button
          onClick={handleSave}
          disabled={saving || !form.name.trim()}
          className="text-[15px] font-semibold text-sage-500 bg-transparent border-none cursor-pointer disabled:text-gray-300"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>

      <div className="p-5">
        {/* Emoji */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-20 h-20 rounded-full bg-sage-200 mx-auto mb-2 flex items-center justify-center text-4xl border-none cursor-pointer hover:bg-sage-300 transition-colors"
          >
            {form.emoji}
          </button>
          <div className="text-xs text-gray-400">탭하여 이모지 변경</div>

          {showEmojiPicker && (
            <div className="grid grid-cols-8 gap-2 mt-3 p-3 bg-gray-50 rounded-xl">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => { setForm((f) => ({ ...f, emoji: e })); setShowEmojiPicker(false); }}
                  className={`text-2xl p-1.5 rounded-lg border-none cursor-pointer transition-all ${
                    form.emoji === e ? 'bg-sage-200 scale-110' : 'bg-transparent hover:bg-gray-200'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Name */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">닉네임</label>
          <input
            className="w-full py-3.5 px-4 border-[1.5px] border-gray-200 rounded-xl text-[15px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        {/* Area */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">내 동네</label>
          <input
            className="w-full py-3.5 px-4 border-[1.5px] border-gray-200 rounded-xl text-[15px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors"
            placeholder="예: 역삼동"
            value={form.area}
            onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
          />
        </div>

        {/* Gender */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">성별</label>
          <div className="flex gap-2">
            {['남', '여'].map((g) => (
              <button
                key={g}
                onClick={() => setForm((f) => ({ ...f, gender: f.gender === g ? '' : g }))}
                className={`flex-1 py-3 border-[1.5px] rounded-xl text-sm cursor-pointer transition-all ${
                  form.gender === g ? 'border-sage-400 bg-sage-100 text-sage-500 font-semibold' : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                {g === '남' ? '남성' : '여성'}
              </button>
            ))}
          </div>
        </div>

        {/* Age Group */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">나이대</label>
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((age) => (
              <button
                key={age}
                onClick={() => setForm((f) => ({ ...f, ageGroup: f.ageGroup === age ? '' : age }))}
                className={`px-4 py-2.5 border-[1.5px] rounded-full text-sm cursor-pointer transition-all ${
                  form.ageGroup === age ? 'border-sage-400 bg-sage-100 text-sage-500 font-semibold' : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
