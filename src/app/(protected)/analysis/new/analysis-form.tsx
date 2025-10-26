'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sajuInputSchema, type SajuInput } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSubscription } from '@/app/providers/subscription-provider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Sparkles, Zap, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AnalysisForm() {
  const { quota, planType, decrementQuota, refreshSubscription } = useSubscription();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('분석 중...');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SajuInput>({
    resolver: zodResolver(sajuInputSchema),
  });

  const onSubmit = async (data: SajuInput) => {
    // 제출 전 쿼터 재확인 (동시 요청 방지)
    if (quota <= 0) {
      toast.error('사용 가능한 횟수가 없습니다');
      return;
    }

    setIsSubmitting(true);

    // 로딩 메시지 변형
    const messages = [
      '분석 중...',
      'AI가 사주를 분석하고 있습니다...',
      '천간과 지지를 계산하고 있습니다...',
      '오행 균형을 분석하고 있습니다...',
      '거의 완료되었습니다...',
    ];
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 5000);

    try {
      const result = await fetch('/api/analysis/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      clearInterval(messageInterval);

      // HTTP 에러 응답
      if (!result.ok) {
        const error = await result.json();

        switch (result.status) {
          case 401:
            toast.error('로그인이 필요합니다');
            router.push('/sign-in');
            return;

          case 403:
            toast.error('사용 가능한 횟수가 없습니다');
            await refreshSubscription();
            return;

          case 400:
            toast.error(error.error || '입력값을 확인해주세요');
            return;

          case 500:
          default:
            toast.error('분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            return;
        }
      }

      // 성공 처리
      const response = await result.json();

      // 낙관적 업데이트 (즉시 UI 반영)
      decrementQuota();

      toast.success('분석이 완료되었습니다!');
      router.push(`/analysis/${response.analysisId}`);

    } catch (error) {
      clearInterval(messageInterval);
      console.error('Unexpected error:', error);

      // 쿼터 복구 (서버에서 재조회)
      await refreshSubscription();

      toast.error('네트워크 연결을 확인해주세요');
    } finally {
      setIsSubmitting(false);
      setLoadingMessage('분석 중...');
    }
  };

  const isPro = planType === 'pro';

  return (
    <div className="relative">
      {/* 쿼터 표시 */}
      <div className="relative mb-8 p-4 sm:p-5 border-2 border-border rounded-xl bg-gradient-to-br from-card to-muted/30 shadow-purple-md">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            <span className="text-sm text-muted-foreground">
              남은 횟수: <span className="font-bold text-foreground">{quota}회</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isPro ? (
              <Zap className="w-5 h-5 text-primary fill-primary" />
            ) : (
              <Sparkles className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              플랜: <span className={cn("font-bold", isPro ? "text-primary" : "text-foreground")}>{isPro ? 'Pro' : '무료'}</span>
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 이름 */}
        <div>
          <Label htmlFor="name" className="text-sm font-semibold text-foreground mb-2">
            이름 *
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="홍길동"
            disabled={isSubmitting}
            className="mt-2 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              {errors.name.message}
            </p>
          )}
        </div>

        {/* 생년월일 */}
        <div>
          <Label htmlFor="birthDate" className="text-sm font-semibold text-foreground mb-2">
            생년월일 *
          </Label>
          <Input
            id="birthDate"
            type="date"
            {...register('birthDate')}
            disabled={isSubmitting}
            className="mt-2 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {errors.birthDate && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              {errors.birthDate.message}
            </p>
          )}
        </div>

        {/* 출생시간 (선택) */}
        <div>
          <Label htmlFor="birthTime" className="text-sm font-semibold text-foreground mb-2">
            출생시간 (선택)
          </Label>
          <Input
            id="birthTime"
            type="time"
            {...register('birthTime')}
            placeholder="14:30"
            disabled={isSubmitting}
            className="mt-2 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {errors.birthTime && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              {errors.birthTime.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            출생시간을 모르시면 비워두세요
          </p>
        </div>

        {/* 성별 */}
        <div>
          <Label className="text-sm font-semibold text-foreground mb-2">성별 *</Label>
          <div className="flex gap-4 mt-3">
            <label className="group flex items-center gap-2 cursor-pointer px-4 py-3 border-2 border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all">
              <input
                type="radio"
                value="male"
                {...register('gender')}
                disabled={isSubmitting}
                className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
              />
              <span className="text-sm font-medium group-hover:text-primary transition-colors">남성</span>
            </label>
            <label className="group flex items-center gap-2 cursor-pointer px-4 py-3 border-2 border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all">
              <input
                type="radio"
                value="female"
                {...register('gender')}
                disabled={isSubmitting}
                className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
              />
              <span className="text-sm font-medium group-hover:text-primary transition-colors">여성</span>
            </label>
          </div>
          {errors.gender && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              {errors.gender.message}
            </p>
          )}
        </div>

        {/* 제출 버튼 */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gradient-purple text-white shadow-purple-lg hover:shadow-purple-xl hover:scale-105 transition-all duration-200"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span>분석 중...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              <span>분석 시작 (쿼터 1회 차감)</span>
            </>
          )}
        </Button>

        {/* 안내 메시지 */}
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <Zap className="w-4 h-4 text-primary fill-primary" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary">Pro 구독</span> 시 월 10회 + 고급 AI 모델 이용 가능
          </p>
        </div>
      </form>

      {/* 로딩 중 오버레이 */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative bg-card border-2 border-primary/20 rounded-2xl p-8 text-center max-w-md mx-4 shadow-purple-2xl animate-scale-in">
            {/* 배경 장식 */}
            <div className="absolute inset-0 gradient-purple opacity-5 blur-2xl rounded-2xl pointer-events-none" />

            {/* 로딩 아이콘 */}
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse-slow" />
              <Loader2 className="relative w-12 h-12 animate-spin text-primary" />
            </div>

            {/* 메시지 */}
            <h3 className="relative text-xl sm:text-2xl font-bold text-foreground mb-2">
              {loadingMessage}
            </h3>
            <p className="relative text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              약 15-30초 소요됩니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
