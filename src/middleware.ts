import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * 공개 경로 정의 (로그인 없이 접근 가능)
 */
const isPublicRoute = createRouteMatcher([
  '/', // 홈 (랜딩) 페이지
  '/sign-in(.*)', // Clerk 로그인 페이지
  '/sign-up(.*)', // Clerk 회원가입 페이지
  '/api/webhooks(.*)', // Webhook 엔드포인트 (Clerk, Toss Payments 등)
]);

/**
 * Clerk 미들웨어
 * - 공개 경로가 아닌 모든 경로에 대해 인증 요구
 * - 보호된 경로: /dashboard, /analysis, /subscription 등
 */
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

/**
 * 미들웨어가 실행될 경로 패턴
 * - 정적 파일 제외
 * - API 경로 포함
 */
export const config = {
  matcher: [
    // 모든 경로에서 실행하되, 정적 파일 제외
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API 경로 포함
    '/(api|trpc)(.*)',
  ],
};
