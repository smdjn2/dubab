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
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMannerModal, setShowMannerModal] = useState(false);
  const [mannerTarget, setMannerTarget] = useState(null);
  const [mannerScore, setMannerScore] = useState(3);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    fetchPost();
    fetchComments();
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

  async function fetchComments() {
    try {
      const res = await fetch(`/api/posts/${params.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleJoin() {
    if (!session) return router.push('/login');
    if (post.isJoined) {
      // 참여 취소
      const res = await fetch(`/api/posts/${params.id}/join`, { method: 'DELETE' });
      if (res.ok) fetchPost();
    } else {
      const res = await fetch(`/api/posts/${params.id}/join`, { method: 'POST' });
      if (res.ok) fetchPost();
    }
  }

  async function handleLike() {
    if (!session) return router.push('/login');
    await fetch(`/api/posts/${params.id}/like`, { method: 'POST' });
    fetchPost();
  }

  async function handleComment() {
    if (!session) return router.push('/login');
    if (!newComment.trim() || sendingComment) return;

    setSendingComment(true);
    try {
      const res = await fetch(`/api/posts/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingComment(false);
    }
  }

  async function handleDelete() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/posts/${params.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/');
  }

  async function handleClosePost() {
    const res = await fetch(`/api/posts/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: post.status === 'closed' ? 'open' : 'closed' }),
    });
    if (res.ok) { fetchPost(); setShowMenu(false); }
  }

  async function handleManner() {
    if (!mannerTarget) return;
    try {
      const res = await fetch('/api/manner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: mannerTarget.id, postId: params.id, score: mannerScore }),
      });
      if (res.ok) {
        alert('매너 평가가 완료되었습니다!');
      } else {
        const data = await res.json();
        alert(data.error || '평가에 실패했습니다.');
      }
    } catch {
      alert('오류가 발생했습니다.');
    }
    setShowMannerModal(false);
    setMannerTarget(null);
    setMannerScore(3);
  }

  async function handleReport() {
    if (!reportReason.trim()) return;
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason, targetUserId: post.host.id, postId: params.id }),
      });
      alert('신고가 접수되었습니다.');
    } catch {
      alert('오류가 발생했습니다.');
    }
    setShowReportModal(false);
    setReportReason('');
  }

  async function handleBlock() {
    try {
      await fetch('/api/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedId: post.host.id }),
      });
      alert('차단되었습니다.');
      router.push('/');
    } catch {
      alert('오류가 발생했습니다.');
    }
  }

  async function goToChat() {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const rooms = await res.json();
        const room = rooms.find((r) => r.postId === params.id);
        if (room) router.push(`/chat/${room.id}`);
        else alert('채팅방이 아직 생성되지 않았습니다.');
      }
    } catch {
      alert('오류가 발생했습니다.');
    }
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

  if (loading || !post) {
    return <div className="flex items-center justify-center h-screen text-gray-400 animate-pulse text-4xl">🍽️</div>;
  }

  const isHost = session?.user?.id === post.host?.id;
  const isFull = post.currentPeople >= post.maxPeople;
  const isClosed = post.status === 'closed';
  const hostInfo = [];
  if (post.showGender && post.host?.gender) hostInfo.push(post.host.gender);
  if (post.showAge && post.host?.ageGroup) hostInfo.push(post.host.ageGroup);

  return (
    <div className="pb-24 animate-[fadeIn_0.25s_ease]">
      {/* Header */}
      <div className="bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[15px] text-gray-500 border-none bg-transparent cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            뒤로
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="border-none bg-transparent cursor-pointer text-gray-400 text-xl p-1"
            >
              ⋮
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 min-w-[140px]">
                {isHost ? (
                  <>
                    <button onClick={() => { router.push(`/post/${params.id}/edit`); setShowMenu(false); }}
                      className="w-full px-4 py-3 text-left text-sm border-none bg-white cursor-pointer hover:bg-gray-50">
                      수정하기
                    </button>
                    <button onClick={handleClosePost}
                      className="w-full px-4 py-3 text-left text-sm border-none bg-white cursor-pointer hover:bg-gray-50">
                      {isClosed ? '모집 재개' : '모집 마감'}
                    </button>
                    <button onClick={handleDelete}
                      className="w-full px-4 py-3 text-left text-sm text-red-500 border-none bg-white cursor-pointer hover:bg-gray-50">
                      삭제하기
                    </button>
                  </>
                ) : session ? (
                  <>
                    <button onClick={() => { setShowReportModal(true); setShowMenu(false); }}
                      className="w-full px-4 py-3 text-left text-sm border-none bg-white cursor-pointer hover:bg-gray-50">
                      신고하기
                    </button>
                    <button onClick={() => { handleBlock(); setShowMenu(false); }}
                      className="w-full px-4 py-3 text-left text-sm text-red-500 border-none bg-white cursor-pointer hover:bg-gray-50">
                      차단하기
                    </button>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block text-[13px] font-semibold text-sage-500 bg-sage-100 px-3 py-1.5 rounded-full">
            {post.category}
          </span>
          {isClosed && (
            <span className="inline-block text-[13px] font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              마감
            </span>
          )}
        </div>
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
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{post.description}</p>
      </div>

      {/* Participants */}
      <div className="bg-white my-2 p-5">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-bold">참여자 ({post.currentPeople}/{post.maxPeople})</h3>
          {post.isJoined && (
            <button
              onClick={goToChat}
              className="text-[13px] font-semibold text-sage-500 bg-sage-100 px-3 py-1.5 rounded-full border-none cursor-pointer hover:bg-sage-200 transition-colors"
            >
              💬 채팅방
            </button>
          )}
        </div>
        {(post.participants || []).map((p, i) => {
          const pInfo = [];
          if (post.showGender && p.gender) pInfo.push(p.gender);
          if (post.showAge && p.ageGroup) pInfo.push(p.ageGroup);
          const canRate = session?.user?.id && session.user.id !== p.id && post.isJoined;
          return (
            <div key={i} className="flex items-center gap-2.5 py-2.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                style={{ background: AVATAR_COLORS[i % 4] }}>{p.emoji}</div>
              <span className="text-sm font-medium">{p.name}</span>
              {i === 0 && <span className="text-[11px] text-sage-500 bg-sage-100 px-2 py-0.5 rounded-lg ml-1">파티장</span>}
              {pInfo.length > 0 && <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg ml-1">{pInfo.join(' · ')}</span>}
              {canRate && (
                <button
                  onClick={() => { setMannerTarget(p); setShowMannerModal(true); }}
                  className="ml-auto text-[11px] text-amber-500 bg-amber-50 px-2 py-1 rounded-lg border-none cursor-pointer hover:bg-amber-100 transition-colors"
                >
                  ⭐ 매너평가
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Comments */}
      <div className="bg-white my-2 p-5">
        <h3 className="text-base font-bold mb-3.5">댓글 ({comments.length})</h3>

        {comments.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-[13px]">
            아직 댓글이 없어요. 첫 번째 댓글을 남겨보세요!
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sage-200 flex items-center justify-center text-sm flex-shrink-0">
                  {c.user?.emoji || '😊'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold">{c.user?.name}</span>
                    <span className="text-[11px] text-gray-400">{formatTime(c.createdAt)}</span>
                  </div>
                  <p className="text-[14px] text-gray-700 mt-0.5 leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment input */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <input
            className="flex-1 py-2.5 px-3.5 border-[1.5px] border-gray-200 rounded-xl text-[13px] font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white transition-colors"
            placeholder={session ? '댓글을 입력하세요' : '로그인 후 댓글을 남길 수 있어요'}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            disabled={!session}
          />
          <button
            onClick={handleComment}
            disabled={!newComment.trim() || sendingComment || !session}
            className="px-4 py-2.5 bg-sage-400 text-white border-none rounded-xl text-[13px] font-semibold cursor-pointer disabled:opacity-50 transition-all"
          >
            등록
          </button>
        </div>
      </div>

      {/* Join bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] border-t border-gray-100 flex gap-3 items-center z-50">
        <button
          onClick={handleLike}
          className={`w-[52px] h-[52px] border-[1.5px] rounded-[14px] flex items-center justify-center bg-white cursor-pointer text-[22px] transition-all ${
            post.isLiked ? 'border-sage-400 bg-sage-100' : 'border-gray-200'
          }`}
        >
          <span style={{ color: post.isLiked ? '#6E8F6B' : '#ccc' }}>{post.isLiked ? '♥' : '♡'}</span>
        </button>
        {isHost ? (
          <button
            onClick={goToChat}
            className="flex-1 py-4 border-none rounded-[14px] text-base font-bold cursor-pointer transition-all text-white bg-sage-400 active:scale-[0.97]"
          >
            💬 채팅방 열기
          </button>
        ) : (
          <button
            onClick={handleJoin}
            disabled={(isFull || isClosed) && !post.isJoined}
            className={`flex-1 py-4 border-none rounded-[14px] text-base font-bold cursor-pointer transition-all text-white ${
              post.isJoined ? 'bg-green-500' : (isFull || isClosed) ? 'bg-gray-300 text-gray-500 cursor-default' : 'bg-sage-400 active:scale-[0.97]'
            }`}
          >
            {post.isJoined ? '참여 취소' : isClosed ? '모집 마감' : isFull ? '인원 마감' : '참여하기'}
          </button>
        )}
      </div>

      {/* Manner Modal */}
      {showMannerModal && mannerTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6" onClick={() => setShowMannerModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[350px] p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-1">매너 평가</h3>
            <p className="text-sm text-gray-500 mb-5">{mannerTarget.name}님의 매너를 평가해주세요</p>
            <div className="flex justify-center gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setMannerScore(s)}
                  className={`text-3xl border-none bg-transparent cursor-pointer transition-transform ${s <= mannerScore ? 'scale-110' : 'opacity-30'}`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <div className="text-center text-sm text-gray-500 mb-5">
              {mannerScore === 1 ? '별로예요' : mannerScore === 2 ? '아쉬워요' : mannerScore === 3 ? '보통이에요' : mannerScore === 4 ? '좋았어요' : '최고예요!'}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowMannerModal(false)} className="flex-1 py-3 border-[1.5px] border-gray-200 rounded-xl text-sm bg-white cursor-pointer">취소</button>
              <button onClick={handleManner} className="flex-1 py-3 border-none rounded-xl text-sm font-semibold bg-sage-400 text-white cursor-pointer">평가하기</button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6" onClick={() => setShowReportModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[350px] p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">신고하기</h3>
            <textarea
              className="w-full py-3 px-4 border-[1.5px] border-gray-200 rounded-xl text-sm font-[inherit] outline-none bg-gray-50 focus:border-sage-400 focus:bg-white resize-none min-h-[100px] transition-colors"
              placeholder="신고 사유를 입력해주세요"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 border-[1.5px] border-gray-200 rounded-xl text-sm bg-white cursor-pointer">취소</button>
              <button onClick={handleReport} disabled={!reportReason.trim()} className="flex-1 py-3 border-none rounded-xl text-sm font-semibold bg-red-500 text-white cursor-pointer disabled:opacity-50">신고하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
