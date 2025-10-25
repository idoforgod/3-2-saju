'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ForbiddenPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const getMessage = () => {
    switch (reason) {
      case 'not_owner':
        return '본인의 분석 결과만 조회할 수 있습니다.';
      default:
        return '접근 권한이 없습니다.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-purple-600 mb-4">403</h1>
        <p className="text-xl text-gray-700 mb-6">{getMessage()}</p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button>대시보드로 이동</Button>
          </Link>
          <Link href="/analysis/new">
            <Button variant="outline">새 분석하기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
