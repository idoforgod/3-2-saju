'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { QuotaBanner } from './QuotaBanner';
import { AnalyzingLoader } from './AnalyzingLoader';
import { ErrorAlert } from './ErrorAlert';
import { useSubscription } from '@/app/providers/subscription-provider';
import { useCreateAnalysis } from '../hooks/useCreateAnalysis';
import { parseApiError } from '../utils/parseApiError';
import { sajuInputSchema } from '../backend/schema';
import type { SajuFormData, AnalysisState, AnalysisError } from '../types';
import { defaultFormValues } from '../types';

export function NewAnalysisPage() {
  const router = useRouter();
  const { quota, planType, refreshSubscription } = useSubscription();
  const createAnalysisMutation = useCreateAnalysis();

  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [errorInfo, setErrorInfo] = useState<AnalysisError | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(sajuInputSchema),
    defaultValues: defaultFormValues,
    mode: 'onBlur',
  });

  const onSubmit = async (data: any) => {
    try {
      // 1. 검증 시작
      setAnalysisState('validating');
      setErrorInfo(null);

      // 2. 쿼터 확인
      if (quota <= 0) {
        setAnalysisState('idle');
        setErrorInfo({
          type: 'quota',
          message: '남은 분석 횟수가 없습니다. Pro 구독을 이용해주세요.',
          recoverable: false,
          actionLabel: 'Pro 구독하기',
          actionPath: '/subscription',
        });
        return;
      }

      // 3. 분석 시작
      setAnalysisState('analyzing');

      // 4. API 호출
      const response = await createAnalysisMutation.mutateAsync(data);

      // 5. 성공 - 결과 페이지로 이동
      setAnalysisState('success');
      await refreshSubscription(); // 쿼터 갱신
      router.push(`/analysis/${response.data.analysisId}`);
    } catch (error) {
      // 6. 에러 처리
      setAnalysisState('error');
      const parsedError = parseApiError(error);
      setErrorInfo(parsedError);
    }
  };

  const handleRetry = () => {
    setAnalysisState('idle');
    setErrorInfo(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* 페이지 제목 */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">새 사주 분석</h1>
        <p className="text-gray-600">정보를 입력하고 AI 사주 분석을 받아보세요</p>
      </div>

      {/* 쿼터 배너 */}
      <div className="mb-8">
        <QuotaBanner quota={quota} planType={planType} isLoading={false} />
      </div>

      {/* 에러 알림 */}
      {errorInfo && (
        <div className="mb-6">
          <ErrorAlert error={errorInfo} onRetry={handleRetry} />
        </div>
      )}

      {/* 폼 */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-md p-8 space-y-6">
        {/* 이름 */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            이름 *
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            placeholder="예: 홍길동"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            disabled={isSubmitting || analysisState === 'analyzing'}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* 생년월일 */}
        <div>
          <label htmlFor="birthDate" className="block text-sm font-semibold text-gray-700 mb-2">
            생년월일 *
          </label>
          <input
            {...register('birthDate')}
            type="date"
            id="birthDate"
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            disabled={isSubmitting || analysisState === 'analyzing'}
          />
          {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>}
        </div>

        {/* 출생시간 (선택) */}
        <div>
          <label htmlFor="birthTime" className="block text-sm font-semibold text-gray-700 mb-2">
            출생시간 (선택)
          </label>
          <input
            {...register('birthTime')}
            type="time"
            id="birthTime"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            disabled={isSubmitting || analysisState === 'analyzing'}
          />
          <p className="mt-1 text-xs text-gray-500">모르시면 비워두세요. "시간 미상"으로 분석됩니다.</p>
          {errors.birthTime && <p className="mt-1 text-sm text-red-600">{errors.birthTime.message}</p>}
        </div>

        {/* 성별 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">성별 *</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                {...register('gender')}
                type="radio"
                value="male"
                className="mr-2 w-4 h-4 text-primary"
                disabled={isSubmitting || analysisState === 'analyzing'}
              />
              <span className="text-gray-700">남성</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                {...register('gender')}
                type="radio"
                value="female"
                className="mr-2 w-4 h-4 text-primary"
                disabled={isSubmitting || analysisState === 'analyzing'}
              />
              <span className="text-gray-700">여성</span>
            </label>
          </div>
          {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
        </div>

        {/* 제출 버튼 */}
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          disabled={quota === 0 || isSubmitting || analysisState === 'analyzing'}
        >
          {analysisState === 'analyzing' ? 'AI 분석 중...' : '사주 분석 시작'}
        </Button>
      </form>

      {/* 로딩 모달 */}
      {analysisState === 'analyzing' && <AnalyzingLoader />}
    </div>
  );
}
