'use client';

import { useSubscription } from '@/app/providers/subscription-provider';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export function SubscriptionCard() {
  const { user } = useUser();
  const { quota, planType, status, subscription } = useSubscription();

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">
        환영합니다, {user?.firstName}님!
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600">플랜</p>
          <p className="text-lg font-bold">
            {planType === 'pro' ? 'Pro 플랜' : '무료 플랜'}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600">남은 횟수</p>
          <p className="text-lg font-bold">{quota}회</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">상태</p>
          <p className="text-lg font-bold">
            {status === 'active' ? '활성' :
             status === 'cancelled' ? '취소됨' : '해지됨'}
          </p>
        </div>
      </div>

      {planType === 'free' && (
        <Link href="/subscription">
          <Button className="mt-4 w-full md:w-auto">
            Pro로 업그레이드
          </Button>
        </Link>
      )}

      {subscription?.nextPaymentDate && (
        <p className="text-sm text-gray-600 mt-4">
          다음 결제일: {new Date(subscription.nextPaymentDate).toLocaleDateString('ko-KR')}
        </p>
      )}
    </Card>
  );
}
