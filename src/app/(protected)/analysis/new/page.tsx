'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSubscription } from '@/app/providers/subscription-provider';
import { QuotaExhaustedModal } from './quota-exhausted-modal';
import { AnalysisForm } from './analysis-form';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function NewAnalysisPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const { quota } = useSubscription();
  const [showQuotaModal, setShowQuotaModal] = useState(false);

  // 비로그인 사용자 리다이렉트
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/analysis/new');
    }
  }, [isLoaded, isSignedIn, router]);

  // 쿼터 확인
  useEffect(() => {
    if (isLoaded && isSignedIn && quota <= 0) {
      setShowQuotaModal(true);
    }
  }, [isLoaded, isSignedIn, quota]);

  // 로딩 중
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-purple-subtle">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse-slow" />
            <Loader2 className="relative w-10 h-10 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 비로그인 상태 (리다이렉트 대기)
  if (!isSignedIn) {
    return null;
  }

  // 쿼터 소진
  if (showQuotaModal) {
    return (
      <QuotaExhaustedModal
        onClose={() => router.push('/dashboard')}
        onSubscribe={() => router.push('/subscription')}
      />
    );
  }

  // 정상 진입
  return (
    <div className="min-h-screen gradient-purple-subtle py-12 sm:py-16 px-4 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <Card className="relative overflow-hidden border-2 border-border shadow-purple-xl p-6 sm:p-8 animate-fade-in-up">
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-64 h-64 gradient-purple opacity-5 blur-3xl pointer-events-none" />

          {/* 헤더 */}
          <div className="relative mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              <span className="text-gradient-purple">새 사주 분석</span>
            </h1>
            <p className="text-base text-muted-foreground">
              정보를 입력하시면 AI가 사주를 분석해드립니다
            </p>
          </div>

          <AnalysisForm />
        </Card>
      </div>
    </div>
  );
}
