'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * 500 에러 페이지
 * 서버 에러 발생 시 표시
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          서버 오류가 발생했습니다
        </h2>
        <p className="text-gray-600 mb-6">
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>다시 시도</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
