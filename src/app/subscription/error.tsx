'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function SubscriptionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Subscription error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-6">
            구독 정보를 불러오는 중 문제가 발생했습니다.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={reset} variant="outline">
              다시 시도
            </Button>
            <Button onClick={() => (window.location.href = '/dashboard')}>
              대시보드로 이동
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
