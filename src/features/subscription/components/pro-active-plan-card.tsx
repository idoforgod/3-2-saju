'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { StatusResponse } from '../lib/dto';
import { Zap, CheckCircle, Clock, DollarSign, Calendar, CreditCard, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProActivePlanCardProps {
  subscription: StatusResponse;
  onCancel: () => void;
}

export function ProActivePlanCard({ subscription, onCancel }: ProActivePlanCardProps) {
  const maskBillingKey = (key: string | null) => {
    if (!key) return '';
    return `**** **** **** ${key.slice(-4)}`;
  };

  const quotaPercentage = (subscription.quota / 10) * 100;

  return (
    <Card className="relative overflow-hidden border-2 border-primary/50 shadow-purple-2xl">
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 w-64 h-64 gradient-purple opacity-5 blur-3xl pointer-events-none" />

      <CardHeader className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-full bg-success/10">
            <CheckCircle className="w-6 h-6 text-success fill-success" />
          </div>
          <CardTitle className="text-2xl text-gradient-purple">Pro 구독 중</CardTitle>
        </div>
        <CardDescription className="text-base">
          월 10회 프리미엄 사주 분석
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6">
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

        {/* 결제 정보 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-success" />
              <p className="text-xs font-medium text-muted-foreground">결제 금액</p>
            </div>
            <p className="text-lg font-semibold text-foreground">9,900원</p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground">다음 결제일</p>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {subscription.nextPaymentDate
                ? format(new Date(subscription.nextPaymentDate), 'yyyy년 MM월 dd일', { locale: ko })
                : '-'}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors sm:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-accent" />
              <p className="text-xs font-medium text-muted-foreground">결제 수단</p>
            </div>
            <p className="text-sm font-semibold text-foreground font-mono">
              {maskBillingKey(subscription.billingKey)}
            </p>
          </div>
        </div>

        {/* 취소 버튼 */}
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all"
        >
          <XCircle className="w-4 h-4 mr-2" />
          구독 취소
        </Button>
      </CardContent>
    </Card>
  );
}
