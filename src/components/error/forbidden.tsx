'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * 403 Forbidden 컴포넌트
 * 권한 없는 리소스 접근 시 표시
 */
export function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-orange-600 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          접근 권한이 없습니다
        </h2>
        <p className="text-gray-600 mb-6">
          이 페이지에 접근할 권한이 없습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button>홈으로 돌아가기</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">로그인</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
