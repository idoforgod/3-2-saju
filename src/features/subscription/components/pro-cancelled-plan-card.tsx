'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { StatusResponse } from '../lib/dto';
import { AlertTriangle, Clock, Calendar, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProCancelledPlanCardProps {
  subscription: StatusResponse;
  onReactivate: () => void;
}

export function ProCancelledPlanCard({ subscription, onReactivate }: ProCancelledPlanCardProps) {
  const quotaPercentage = (subscription.quota / 10) * 100;

  return (
    <Card className="relative overflow-hidden border-2 border-warning/50 shadow-purple-xl">
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-warning/5 blur-3xl pointer-events-none" />

      <CardHeader className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-full bg-warning/10">
            <AlertTriangle className="w-6 h-6 text-warning" />
          </div>
          <CardTitle className="text-2xl text-warning">구독 취소 예정</CardTitle>
        </div>
        <CardDescription className="text-base">
          해지일까지 Pro 혜택이 유지됩니다
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* 해지일 */}
        <div className="p-4 rounded-xl border-2 border-warning/20 bg-warning/5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-warning" />
            <p className="text-sm font-medium text-muted-foreground">해지일</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {subscription.nextPaymentDate
              ? format(new Date(subscription.nextPaymentDate), 'yyyy년 MM월 dd일', { locale: ko })
              : '-'}
          </p>
        </div>

        {/* 쿼터 정보 */}
        <div className="p-4 rounded-xl border-2 border-border bg-gradient-to-br from-card to-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-accent" />
            <p className="text-sm font-medium text-muted-foreground">남은 쿼터</p>
          </div>
          <p className="text-3xl font-bold text-foreground mb-3">
            {subscription.quota}회 <span className="text-xl text-muted-foreground">/ 10회</span>
          </p>
          {/* 진행 바 */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                quotaPercentage > 50 ? "bg-success" :
                quotaPercentage > 20 ? "bg-warning" : "bg-destructive"
              )}
              style={{ width: `${quotaPercentage}%` }}
            />
          </div>
        </div>

        {/* 재활성화 버튼 */}
        <Button
          onClick={onReactivate}
          className="w-full gradient-purple text-white shadow-purple-lg hover:shadow-purple-xl hover:scale-105 transition-all duration-200"
          size="lg"
        >
          <RefreshCcw className="w-5 h-5 mr-2" />
          취소 철회
        </Button>
      </CardContent>
    </Card>
  );
}
