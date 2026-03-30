'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Toggle from '@/components/Toggle';

const CATEGORIES = ['한식', '중식', '일식', '양식', '분식', '카페', '술', '기타'];

export default function CreatePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [maxPeople, setMaxPeople] = useState(4);
  const [conditions, setConditions] = useState('');
  const [desc, setDesc] = useState('');
  const [showGender, setShowGender] = useState(true);
  const [showAge, setShowAge] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title && category && restaurant && time && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    if (!session) return router.push('/login');

    setSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, category, restaurant, location, time,
          description: desc, conditions, maxPeople, showGender, showAge,
        }),
      });
      if (res.ok) {
        router.push('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white min-h-screen animate-[fadeIn_0.25s_ease]">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="border-none bg-transparent text-2xl text-gray-400 cursor-pointer">✕</button>
        <h2 className="text-lg font-bold">모집글 작성</h2>
        <div className="w-6" />
      </div>

      <div className="p-5">
        {/* 제목 */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">제목 *</label>
          <input
            className="w-full py-3.5 px-4 border-[1.5px] border-gray-200 rounded-xl text-[15px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors"
            placeholder="예: 마라탕 같이 먹을 사람!"
            value={title} onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 카테고리 */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">카테고리 *</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2.5 border-[1.5px] rounded-full text-sm cursor-pointer transition-all ${
                  category === cat
                    ? 'border-sage-400 bg-sage-100 text-sage-500 font-semibold'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 식당 */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">식당/장소 *</label>
          <input
            className="w-full py-3.5 px-4 border-[1.5px] border-gray-200 rounded-xl text-[15px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors"
            placeholder="예: 하이디라오 강남점"
            value={restaurant} onChange={(e) => setRestaurant(e.target.value)}
          />
        </div>

        {/* 위치 */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">상세 위치</label>
          <input
            className="w-full py-3.5 px-4 border-[1.5px] border-gray-200 rounded-xl text-[15px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors"
            placeholder="예: 강남역 3번 출구 앞"
            value={location} onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* 시간 */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">시간 *</label>
          <input
            className="w-full py-3.5 px-4 border-[1.5px] border-gray-200 rounded-xl text-[15px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors"
            placeholder="예: 오늘 저녁 7시"
            value={time} onChange={(e) => setTime(e.target.value)}
          />
        </div>

        {/* 인원 */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">최대 인원</label>
          <div className="flex items-center gap-4">
            <button onClick={() => setMaxPeople(Math.max(2, maxPeople - 1))}
              className="w-10 h-10 rounded-full border-[1.5px] border-gray-200 flex items-center justify-center text-xl cursor-pointer bg-gray-50 active:bg-sage-400 active:text-white active:border-sage-400 transition-all">
              −
            </button>
            <span className="text-xl font-bold min-w-[30px] text-center">{maxPeople}</span>
            <button onClick={() => setMaxPeople(Math.min(10, maxPeople + 1))}
              className="w-10 h-10 rounded-full border-[1.5px] border-gray-200 flex items-center justify-center text-xl cursor-pointer bg-gray-50 active:bg-sage-400 active:text-white active:border-sage-400 transition-all">
              +
            </button>
            <span className="text-sm text-gray-400">명</span>
          </div>
        </div>

        {/* 조건 */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">참여 조건</label>
          <input
            className="w-full py-3.5 px-4 border-[1.5px] border-gray-200 rounded-xl text-[15px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors"
            placeholder="예: 매운 거 잘 드시는 분 (선택)"
            value={conditions} onChange={(e) => setConditions(e.target.value)}
          />
        </div>

        {/* 상세 내용 */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">상세 내용</label>
          <textarea
            className="w-full py-3.5 px-4 border-[1.5px] border-gray-200 rounded-xl text-[15px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors resize-none min-h-[100px]"
            placeholder="모집 내용을 자유롭게 작성해주세요"
            value={desc} onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        {/* 공개 설정 */}
        <div className="h-px bg-gray-100 my-2 mb-6" />
        <div className="text-base font-bold mb-4 flex items-center gap-2">🔒 개인정보 공개 설정</div>

        <div className="mb-6">
          <Toggle label="👤 성별 공개" status={showGender ? '공개' : '비공개'} on={showGender} onToggle={() => setShowGender(!showGender)} />
          <Toggle label="🎂 나이대 공개" status={showAge ? '공개' : '비공개'} on={showAge} onToggle={() => setShowAge(!showAge)} />
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            공개 시 모집글과 참여자 목록에 내 성별/나이대가 표시됩니다.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-4 border-none rounded-[14px] text-base font-bold cursor-pointer text-white mt-3 transition-all active:scale-[0.97] ${
            canSubmit ? 'bg-sage-400' : 'bg-sage-400/50'
          }`}
        >
          {submitting ? '등록 중...' : '모집글 올리기'}
        </button>
      </div>
    </div>
  );
}