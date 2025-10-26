'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface QuotaBannerProps {
  quota: number;
  planType: 'free' | 'pro';
  isLoading: boolean;
}

export function QuotaBanner({ quota, planType, isLoading }: QuotaBannerProps) {
  if (isLoading) {
    return (
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg animate-pulse">
        <div className="h-4 bg-purple-200 rounded w-32 mb-2" />
        <div className="h-6 bg-purple-300 rounded w-24" />
      </div>
    );
  }

  // 쿼터 소진
  if (quota === 0) {
    return (
      <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
        <p className="text-red-700 font-semibold mb-3">
          남은 분석 횟수가 없습니다. Pro 구독을 시작해주세요.
        </p>
        <Link href="/subscription">
          <Button variant="default" className="bg-primary hover:bg-primary/90">
            Pro 구독하기
          </Button>
        </Link>
      </div>
    );
  }

  // 쿼터 부족 경고 (1-3회)
  if (quota <= 3) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
        <p className="text-yellow-800 font-semibold">
          ⚠️ 남은 분석 횟수: <span className="text-2xl">{quota}회</span>
          {planType === 'pro' && ' | Pro 구독 중'}
        </p>
      </div>
    );
  }

  // 정상 (4회 이상)
  return (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <p className="text-purple-800 font-semibold">
        남은 분석 횟수: <span className="text-2xl">{quota}회</span>
        {planType === 'pro' && ' | Pro 구독 중'}
      </p>
    </div>
  );
}
