import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

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
 * - Clerk 환경 변수가 없으면 bypass
 */
const hasClerkConfig = () => {
  return !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'your_clerk_publishable_key_here' &&
    process.env.CLERK_SECRET_KEY !== 'your_clerk_secret_key_here'
  );
};

// Clerk 미들웨어 인스턴스 (lazy initialization)
let clerkMiddlewareInstance: ((req: NextRequest, evt: NextFetchEvent) => ReturnType<typeof clerkMiddleware>) | null = null;

const getClerkMiddleware = () => {
  if (!clerkMiddlewareInstance) {
    clerkMiddlewareInstance = clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        await auth.protect();
      }
    });
  }
  return clerkMiddlewareInstance;
};

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  // Clerk 설정이 없으면 bypass
  if (!hasClerkConfig()) {
    console.warn('[Proxy] Clerk 환경 변수가 설정되지 않았습니다. 인증 없이 진행합니다.');
    return NextResponse.next();
  }

  // Clerk 미들웨어 실행
  return getClerkMiddleware()(request, event);
}

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
