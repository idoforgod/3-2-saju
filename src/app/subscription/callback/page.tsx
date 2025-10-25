'use client';

import { useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscription } from '@/app/providers/subscription-provider';
import { toast } from 'sonner';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSubscription } = useSubscription();

  const processPayment = useCallback(async (authKey: string, customerKey: string) => {
    try {
      const response = await fetch('/api/payments/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, customerKey }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '결제 처리 실패');
      }

      // Context 업데이트
      await refreshSubscription();

      toast.success('Pro 구독이 완료되었습니다!');
      router.push('/subscription');
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error instanceof Error ? error.message : '결제 처리 중 오류 발생');
      router.push('/subscription');
    }
  }, [refreshSubscription, router]);

  useEffect(() => {
    const success = searchParams.get('success') === 'true';
    const authKey = searchParams.get('authKey');
    const customerKey = searchParams.get('customerKey');

    if (!success) {
      toast.error('결제가 취소되었습니다');
      router.push('/subscription');
      return;
    }

    if (!authKey || !customerKey) {
      toast.error('결제 정보가 올바르지 않습니다');
      router.push('/subscription');
      return;
    }

    // API 호출: BillingKey로 첫 결제 실행
    processPayment(authKey, customerKey);
  }, [searchParams, router, processPayment]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
        <p className="text-gray-700 font-medium">결제 처리 중...</p>
        <p className="text-gray-500 text-sm mt-2">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
