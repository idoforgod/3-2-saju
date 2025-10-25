'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSubscription } from '@/app/providers/subscription-provider';
import { QuotaExhaustedModal } from './quota-exhausted-modal';
import { AnalysisForm } from './analysis-form';
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            새 사주 분석
          </h1>
          <p className="text-gray-600 mb-8">
            정보를 입력하시면 AI가 사주를 분석해드립니다
          </p>

          <AnalysisForm />
        </div>
      </div>
    </div>
  );
}
