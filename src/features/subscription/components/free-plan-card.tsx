'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { StatusResponse } from '../lib/dto';

interface FreePlanCardProps {
  subscription: StatusResponse;
  onSubscribe: () => void;
}

export function FreePlanCard({ subscription, onSubscribe }: FreePlanCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>무료 체험</CardTitle>
        <CardDescription>기본 사주 분석을 체험해보세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">남은 쿼터</p>
          <p className="text-2xl font-bold">{subscription.quota}회 / 3회</p>
        </div>

        <Button onClick={onSubscribe} className="w-full" size="lg">
          Pro 구독 시작
        </Button>
      </CardContent>
    </Card>
  );
}
