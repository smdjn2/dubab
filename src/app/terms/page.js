'use client';

import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white animate-[fadeIn_0.25s_ease]">
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="border-none bg-transparent text-2xl text-gray-400 cursor-pointer">✕</button>
        <h2 className="text-lg font-bold">이용약관</h2>
        <div className="w-6" />
      </div>

      <div className="p-5 text-sm text-gray-600 leading-relaxed">
        <h3 className="text-base font-bold text-gray-800 mb-3">듀밥 서비스 이용약관</h3>

        <h4 className="font-semibold text-gray-700 mt-5 mb-2">제1조 (목적)</h4>
        <p className="mb-3">
          이 약관은 듀밥(이하 &quot;서비스&quot;)이 제공하는 소셜 다이닝 매칭 서비스의 이용 조건 및 절차에 관한 사항을 규정합니다.
        </p>

        <h4 className="font-semibold text-gray-700 mt-5 mb-2">제2조 (서비스 내용)</h4>
        <p className="mb-3">
          서비스는 같이 식사할 사람을 찾고 매칭해주는 플랫폼을 제공합니다. 모집글 작성, 참여, 채팅, 매너 평가 등의 기능을 포함합니다.
        </p>

        <h4 className="font-semibold text-gray-700 mt-5 mb-2">제3조 (회원가입 및 탈퇴)</h4>
        <p className="mb-3">
          1. 회원가입은 이메일 또는 카카오 소셜 로그인을 통해 가능합니다.<br />
          2. 회원은 언제든지 서비스 탈퇴를 요청할 수 있습니다.
        </p>

        <h4 className="font-semibold text-gray-700 mt-5 mb-2">제4조 (이용자의 의무)</h4>
        <p className="mb-3">
          1. 타인의 개인정보를 무단으로 수집하거나 유포하지 않습니다.<br />
          2. 허위 정보를 게시하지 않습니다.<br />
          3. 다른 이용자에게 불쾌감을 주는 행위를 하지 않습니다.<br />
          4. 상업적 목적으로 서비스를 이용하지 않습니다.
        </p>

        <h4 className="font-semibold text-gray-700 mt-5 mb-2">제5조 (매너 점수)</h4>
        <p className="mb-3">
          매너 점수는 다른 이용자의 평가를 기반으로 산정됩니다. 매너 점수가 지속적으로 낮을 경우 서비스 이용이 제한될 수 있습니다.
        </p>

        <h4 className="font-semibold text-gray-700 mt-5 mb-2">제6조 (신고 및 제재)</h4>
        <p className="mb-3">
          부적절한 행위를 하는 이용자는 신고할 수 있으며, 운영 정책에 따라 이용이 제한될 수 있습니다.
        </p>

        <h4 className="font-semibold text-gray-700 mt-5 mb-2">제7조 (면책사항)</h4>
        <p className="mb-3">
          서비스는 이용자 간 만남에서 발생하는 문제에 대해 직접적인 책임을 지지 않습니다. 안전한 만남을 위해 공공장소에서의 만남을 권장합니다.
        </p>

        <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-400">
          시행일: 2024년 1월 1일
        </div>
      </div>
    </div>
  );
}
