'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-purple-600 mb-4">500</h1>
        <p className="text-xl text-gray-700 mb-4">오류가 발생했습니다</p>
        <p className="text-sm text-gray-600 mb-6">
          잠시 후 다시 시도해주세요.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()}>다시 시도</Button>
          <Link href="/">
            <Button variant="outline">홈으로</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
