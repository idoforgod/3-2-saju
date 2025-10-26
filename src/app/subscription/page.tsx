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
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error || '구독 정보를 불러올 수 없습니다'}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-purple-600 hover:underline"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">구독 관리</h1>

      <div className="space-y-6">
        <SubscriptionStatusCard
          subscription={subscription}
          onSubscribe={handleSubscribe}
          onCancel={handleCancelClick}
          onReactivate={handleReactivateClick}
        />

        {subscription.planType === 'free' && <ProPlanInfoCard />}
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
  );
}
