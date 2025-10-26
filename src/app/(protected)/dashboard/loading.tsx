'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * 대시보드 로딩 UI
 * Next.js App Router의 loading.tsx 컨벤션 사용
 */
export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* 페이지 제목 Skeleton */}
      <Skeleton className="h-10 w-48 mb-8" />

      {/* 구독 카드 Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>

      {/* 분석 이력 제목 Skeleton */}
      <Skeleton className="h-6 w-32 mb-4" />

      {/* 분석 이력 카드 그리드 Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
