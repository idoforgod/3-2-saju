'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { StatusResponse } from '../lib/dto';
import { Sparkles, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FreePlanCardProps {
  subscription: StatusResponse;
  onSubscribe: () => void;
}

export function FreePlanCard({ subscription, onSubscribe }: FreePlanCardProps) {
  const quotaPercentage = (subscription.quota / 3) * 100;

  return (
    <Card className="relative overflow-hidden border-2 border-border shadow-purple-xl">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-muted-foreground" />
          <CardTitle className="text-2xl">무료 체험</CardTitle>
        </div>
        <CardDescription className="text-base">
          기본 사주 분석을 체험해보세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 쿼터 표시 */}
        <div className="p-4 rounded-xl border-2 border-border bg-gradient-to-br from-card to-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-accent" />
            <p className="text-sm font-medium text-muted-foreground">남은 쿼터</p>
          </div>
          <p className="text-3xl font-bold text-foreground mb-3">
            {subscription.quota}회 <span className="text-xl text-muted-foreground">/ 3회</span>
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

        {/* Pro 구독 버튼 */}
        <Button
          onClick={onSubscribe}
          className="w-full gradient-purple text-white shadow-purple-lg hover:shadow-purple-xl hover:scale-105 transition-all duration-200"
          size="lg"
        >
          <Zap className="w-5 h-5 mr-2 fill-white" />
          Pro 구독 시작
        </Button>
      </CardContent>
    </Card>
  );
}
