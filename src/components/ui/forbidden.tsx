import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-purple-600 mb-4">403</h1>
        <p className="text-xl text-gray-700 mb-6">접근 권한이 없습니다</p>
        <Link href="/dashboard">
          <Button>대시보드로 돌아가기</Button>
        </Link>
      </div>
    </div>
  );
}
