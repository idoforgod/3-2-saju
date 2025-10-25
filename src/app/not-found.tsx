'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * 404 에러 페이지
 * 존재하지 않는 페이지 접근 시 표시
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-purple-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-gray-600 mb-6">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button>홈으로 돌아가기</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">대시보드로 이동</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
