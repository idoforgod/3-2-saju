'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Check, DollarSign, Brain, TrendingUp, Database } from 'lucide-react';

export function ProPlanInfoCard() {
  const features = [
    { icon: TrendingUp, text: '매월 10회 분석 가능', color: 'text-primary' },
    { icon: Brain, text: 'Gemini 2.5 Pro 모델 사용', color: 'text-accent' },
    { icon: Zap, text: '더 정밀한 사주 분석', color: 'text-warning' },
    { icon: Database, text: '분석 이력 무제한 보관', color: 'text-success' },
  ];

  return (
    <Card className="relative overflow-hidden border-2 border-border shadow-purple-xl">
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 w-64 h-64 gradient-purple opacity-5 blur-3xl pointer-events-none" />

      <CardHeader className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-6 h-6 text-primary fill-primary" />
          <CardTitle className="text-2xl text-gradient-purple">Pro 플랜</CardTitle>
        </div>
        <CardDescription className="text-base">
          매달 더 많은 분석
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* 가격 */}
        <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">월 구독료</p>
          </div>
          <p className="text-4xl font-bold text-primary">9,900원</p>
        </div>

        {/* 특징 목록 */}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 group">
              <div className="mt-0.5 p-1.5 rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                <Check className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
