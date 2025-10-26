'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { StatusResponse } from '../lib/dto';

interface ProActivePlanCardProps {
  subscription: StatusResponse;
  onCancel: () => void;
}

export function ProActivePlanCard({ subscription, onCancel }: ProActivePlanCardProps) {
  const maskBillingKey = (key: string | null) => {
    if (!key) return '';
    return `**** **** **** ${key.slice(-4)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ✅ Pro 구독 중
        </CardTitle>
        <CardDescription>월 10회 프리미엄 사주 분석</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">남은 쿼터</p>
            <p className="text-lg font-semibold">{subscription.quota}회 / 10회</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">결제 금액</p>
            <p className="text-lg font-semibold">9,900원</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">다음 결제일</p>
            <p className="text-sm">
              {subscription.nextPaymentDate
                ? format(new Date(subscription.nextPaymentDate), 'yyyy년 MM월 dd일', { locale: ko })
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">결제 수단</p>
            <p className="text-sm">{maskBillingKey(subscription.billingKey)}</p>
          </div>
        </div>

        <Button onClick={onCancel} variant="ghost" className="w-full">
          구독 취소
        </Button>
      </CardContent>
    </Card>
  );
}
