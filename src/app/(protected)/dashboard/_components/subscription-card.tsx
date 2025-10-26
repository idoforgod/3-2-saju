'use client';

import { useSubscription } from '@/app/providers/subscription-provider';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Zap, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function SubscriptionCard() {
  const { user } = useUser();
  const { quota, planType, status, subscription } = useSubscription();
  const isPro = planType === 'pro';
  const maxQuota = isPro ? 10 : 3;
  const quotaPercentage = (quota / maxQuota) * 100;

  return (
    <Card className="relative overflow-hidden p-6 sm:p-8 mb-8 border-2 border-border shadow-purple-lg hover:shadow-purple-xl transition-all duration-300 animate-fade-in-up">
      {/* 배경 그라데이션 (Pro 플랜만) */}
      {isPro && (
        <div className="absolute top-0 right-0 w-64 h-64 gradient-purple opacity-10 blur-3xl pointer-events-none" />
      )}

      {/* 헤더 */}
      <div className="relative mb-6">
        <div className="flex items-center gap-3 mb-2">
          {isPro ? (
            <div className="p-2 rounded-xl bg-primary/10">
              <Zap className="w-6 h-6 text-primary fill-primary" />
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-muted">
              <Sparkles className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">안녕하세요,</p>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {user?.firstName || user?.username}님
            </h2>
          </div>
        </div>
      </div>

      {/* 통계 그리드 */}
      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* 플랜 */}
        <div className="group p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-xs font-medium text-muted-foreground">플랜</p>
          </div>
          <p className={cn(
            "text-lg font-bold",
            isPro ? "text-gradient-purple" : "text-foreground"
          )}>
            {isPro ? 'Pro 플랜' : '무료 플랜'}
          </p>
        </div>

        {/* 남은 횟수 */}
        <div className="group p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-accent" />
            <p className="text-xs font-medium text-muted-foreground">남은 횟수</p>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-lg font-bold text-foreground">{quota}회</p>
            <p className="text-sm text-muted-foreground">/ {maxQuota}회</p>
          </div>
          {/* 진행 바 */}
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
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

        {/* 상태 */}
        <div className="group p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              "w-2 h-2 rounded-full",
              status === 'active' ? "bg-success animate-pulse" :
              status === 'cancelled' ? "bg-warning" : "bg-destructive"
            )} />
            <p className="text-xs font-medium text-muted-foreground">상태</p>
          </div>
          <p className="text-lg font-bold text-foreground">
            {status === 'active' ? '활성' :
             status === 'cancelled' ? '취소됨' : '해지됨'}
          </p>
        </div>
      </div>

      {/* 하단 액션 */}
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {subscription?.nextPaymentDate && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span>📅</span>
              <span>다음 결제일: {new Date(subscription.nextPaymentDate).toLocaleDateString('ko-KR')}</span>
            </p>
          )}
        </div>

        {!isPro && (
          <Link href="/subscription">
            <Button className="gradient-purple text-white shadow-purple-md hover:shadow-purple-lg hover:scale-105 transition-all duration-200">
              <Zap className="w-4 h-4 mr-2" />
              Pro로 업그레이드
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
