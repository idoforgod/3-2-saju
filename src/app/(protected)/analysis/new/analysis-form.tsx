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
import { Loader2 } from 'lucide-react';

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

  return (
    <div className="relative">
      {/* 쿼터 표시 */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">
            남은 횟수: <span className="font-bold text-purple-600">{quota}회</span>
          </span>
          <span className="text-gray-700">
            플랜: <span className="font-bold text-purple-600">{planType === 'pro' ? 'Pro' : '무료'}</span>
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 이름 */}
        <div>
          <Label htmlFor="name">이름 *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="홍길동"
            disabled={isSubmitting}
            className="mt-2"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* 생년월일 */}
        <div>
          <Label htmlFor="birthDate">생년월일 *</Label>
          <Input
            id="birthDate"
            type="date"
            {...register('birthDate')}
            disabled={isSubmitting}
            className="mt-2"
          />
          {errors.birthDate && (
            <p className="text-sm text-red-600 mt-1">{errors.birthDate.message}</p>
          )}
        </div>

        {/* 출생시간 (선택) */}
        <div>
          <Label htmlFor="birthTime">출생시간 (선택)</Label>
          <Input
            id="birthTime"
            type="time"
            {...register('birthTime')}
            placeholder="14:30"
            disabled={isSubmitting}
            className="mt-2"
          />
          {errors.birthTime && (
            <p className="text-sm text-red-600 mt-1">{errors.birthTime.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            출생시간을 모르시면 비워두세요
          </p>
        </div>

        {/* 성별 */}
        <div>
          <Label>성별 *</Label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="male"
                {...register('gender')}
                disabled={isSubmitting}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm">남성</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="female"
                {...register('gender')}
                disabled={isSubmitting}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm">여성</span>
            </label>
          </div>
          {errors.gender && (
            <p className="text-sm text-red-600 mt-1">{errors.gender.message}</p>
          )}
        </div>

        {/* 제출 버튼 */}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              분석 중...
            </>
          ) : (
            '분석 시작 (쿼터 1회 차감)'
          )}
        </Button>

        {/* 안내 메시지 */}
        <p className="text-xs text-gray-500 text-center">
          💡 Pro 구독 시 월 10회 + 고급 AI 모델 이용 가능
        </p>
      </form>

      {/* 로딩 중 오버레이 */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center max-w-md mx-4">
            <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{loadingMessage}</h3>
            <p className="text-gray-600">
              약 15-30초 소요됩니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
