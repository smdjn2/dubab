export { default } from 'next-auth/middleware';

// 로그인이 필요한 페이지 보호
export const config = {
  matcher: ['/create', '/my'],
};