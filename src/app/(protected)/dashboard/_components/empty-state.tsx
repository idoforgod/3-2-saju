'use client';

import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="text-center py-12">
      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        아직 분석 이력이 없습니다
      </h3>
      <p className="text-gray-600 mb-6">
        첫 분석을 시작해보세요!
      </p>
      <Link href="/analysis/new">
        <Button>새 분석하기</Button>
      </Link>
    </div>
  );
}
