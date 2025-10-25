'use client';

import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { useAuth } from '@clerk/nextjs';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { parseTossError } from '@/lib/toss-payments/errors';

interface TossPaymentWidgetProps {
  onSuccess?: () => void;
}

export function TossPaymentWidget({ onSuccess }: TossPaymentWidgetProps) {
  const { userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!userId) {
      toast.error('로그인이 필요합니다');
      return;
    }

    setIsLoading(true);

    try {
      // 1. 토스페이먼츠 SDK 로드
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        throw new Error('Toss Payments client key is not configured');
      }

      const tossPayments = await loadTossPayments(clientKey);

      // 2. BillingKey 발급 요청
      // @ts-expect-error - requestBillingAuth 메서드 타입 정의 누락
      await tossPayments.requestBillingAuth({
        method: 'CARD',
        customerKey: userId,
        successUrl: `${window.location.origin}/subscription/callback?success=true`,
        failUrl: `${window.location.origin}/subscription/callback?success=false`,
      });
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = parseTossError(error);
      toast.error(errorMessage || '결제 위젯을 불러올 수 없습니다');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        size="lg"
        onClick={() => setIsOpen(true)}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        Pro 구독하기
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Pro 플랜 구독</DialogTitle>
            <DialogDescription>
              프리미엄 기능을 이용하시려면 결제 정보를 등록해주세요
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <p className="text-gray-700">월 10회 분석 가능</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <p className="text-gray-700">Gemini Pro 모델 사용</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <p className="text-gray-700">상세한 대운/세운 해석</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <p className="text-gray-700 font-semibold">월 9,900원 (부가세 포함)</p>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                ℹ️ 첫 결제 시 9,900원이 즉시 결제되며, 이후 매월 자동으로 결제됩니다.
              </p>
            </div>

            <Button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? '로딩 중...' : '결제 진행'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
