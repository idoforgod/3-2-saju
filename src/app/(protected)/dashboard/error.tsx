'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * 대시보드 에러 페이지
 * Next.js App Router의 error.tsx 컨벤션 사용
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러를 콘솔에 로깅 (프로덕션에서는 에러 추적 서비스로 전송)
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {/* 에러 아이콘 */}
        <div className="mb-6">
          <svg
            className="w-24 h-24 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* 에러 메시지 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          오류가 발생했습니다
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          {error.message || '데이터를 불러오는 중 문제가 발생했습니다.'}
        </p>

        {/* 재시도 버튼 */}
        <div className="flex gap-4">
          <Button
            onClick={reset}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            다시 시도
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
          >
            홈으로 돌아가기
          </Button>
        </div>

        {/* 에러 상세 정보 (개발 환경에서만 표시) */}
        {process.env.NODE_ENV === 'development' && error.digest && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left max-w-2xl w-full">
            <p className="text-xs font-mono text-gray-600">
              Error Digest: {error.digest}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
