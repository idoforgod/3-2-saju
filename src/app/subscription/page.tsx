'use client';

import { useState } from 'react';
import { useSubscriptionStatus } from '@/features/subscription/hooks/use-subscription-status';
import { useCancel } from '@/features/subscription/hooks/use-cancel';
import { useReactivate } from '@/features/subscription/hooks/use-reactivate';
import { SubscriptionStatusCard } from '@/features/subscription/components/subscription-status-card';
import { ProPlanInfoCard } from '@/features/subscription/components/pro-plan-info-card';
import { CancelConfirmModal } from '@/features/subscription/components/cancel-confirm-modal';
import { ReactivateConfirmModal } from '@/features/subscription/components/reactivate-confirm-modal';
import { toast } from 'sonner';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubscriptionPage() {
  const { subscription, isLoading, error } = useSubscriptionStatus();
  const { cancel, isCancelling } = useCancel();
  const { reactivate, isReactivating } = useReactivate();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);

  const handleSubscribe = () => {
    toast.info('토스페이먼츠 결제 위젯 연동이 필요합니다');
    // TODO: 토스페이먼츠 위젯 모달 열기
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    try {
      await cancel();
      setShowCancelModal(false);
      window.location.reload();
    } catch (error) {
      // 에러는 useCancel 훅에서 toast로 표시됨
    }
  };

  const handleReactivateClick = () => {
    setShowReactivateModal(true);
  };

  const handleReactivateConfirm = async () => {
    try {
      await reactivate();
      setShowReactivateModal(false);
      window.location.reload();
    } catch (error) {
      // 에러는 useReactivate 훅에서 toast로 표시됨
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-purple-subtle flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse-slow" />
            <Loader2 className="relative w-10 h-10 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">구독 정보 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="min-h-screen gradient-purple-subtle flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          {/* 에러 아이콘 */}
          <div className="flex justify-center mb-6">
            <div className="relative inline-flex items-center justify-center w-16 h-16">
              <div className="absolute inset-0 bg-destructive/10 rounded-full blur-xl animate-pulse-slow" />
              <div className="relative p-3 rounded-full bg-destructive/10">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
            </div>
          </div>

          <p className="text-lg font-semibold text-destructive mb-6">
            {error || '구독 정보를 불러올 수 없습니다'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-purple-subtle py-12 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 animate-fade-in-up">
          <span className="text-gradient-purple">구독</span> 관리
        </h1>

        <div className="space-y-6">
          <div className="animate-fade-in-up animation-delay-100">
            <SubscriptionStatusCard
              subscription={subscription}
              onSubscribe={handleSubscribe}
              onCancel={handleCancelClick}
              onReactivate={handleReactivateClick}
            />
          </div>

          {subscription.planType === 'free' && (
            <div className="animate-fade-in-up animation-delay-200">
              <ProPlanInfoCard />
            </div>
          )}
        </div>

        {/* 구독 취소 확인 모달 */}
        <CancelConfirmModal
          open={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelConfirm}
          isLoading={isCancelling}
          nextPaymentDate={subscription.nextPaymentDate}
        />

        {/* 재활성화 확인 모달 */}
        <ReactivateConfirmModal
          open={showReactivateModal}
          onClose={() => setShowReactivateModal(false)}
          onConfirm={handleReactivateConfirm}
          isLoading={isReactivating}
          nextPaymentDate={subscription.nextPaymentDate}
          billingKey={subscription.billingKey}
        />
      </div>
    </div>
  );
}
