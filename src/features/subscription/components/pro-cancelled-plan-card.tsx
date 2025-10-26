'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { StatusResponse } from '../lib/dto';

interface ProCancelledPlanCardProps {
  subscription: StatusResponse;
  onReactivate: () => void;
}

export function ProCancelledPlanCard({ subscription, onReactivate }: ProCancelledPlanCardProps) {
  return (
    <Card className="border-orange-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600">
          ⚠️ 구독 취소 예정
        </CardTitle>
        <CardDescription>해지일까지 Pro 혜택이 유지됩니다</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">해지일</p>
          <p className="text-lg font-semibold">
            {subscription.nextPaymentDate
              ? format(new Date(subscription.nextPaymentDate), 'yyyy년 MM월 dd일', { locale: ko })
              : '-'}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">남은 쿼터</p>
          <p className="text-lg font-semibold">{subscription.quota}회 / 10회</p>
        </div>

        <Button onClick={onReactivate} className="w-full" size="lg">
          취소 철회
        </Button>
      </CardContent>
    </Card>
  );
}
