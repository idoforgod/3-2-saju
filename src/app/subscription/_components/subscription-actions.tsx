'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/app/providers/subscription-provider';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface SubscriptionActionsProps {
  status: 'active' | 'cancelled' | 'terminated';
  nextPaymentDate?: string;
}

export function SubscriptionActions({ status, nextPaymentDate }: SubscriptionActionsProps) {
  const router = useRouter();
  const { refreshSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/cancel', { method: 'POST' });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '취소 실패');
      }

      await refreshSubscription();
      toast.success(`구독이 취소되었습니다. ${nextPaymentDate}까지 Pro 기능을 사용할 수 있습니다.`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '구독 취소 중 오류 발생');
    } finally {
      setIsLoading(false);
      setShowCancelDialog(false);
    }
  };

  const handleReactivate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/reactivate', { method: 'POST' });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '재활성화 실패');
      }

      await refreshSubscription();
      toast.success('구독이 재활성화되었습니다');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '재활성화 중 오류 발생');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/terminate', { method: 'POST' });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '해지 실패');
      }

      await refreshSubscription();
      toast.success('구독이 해지되었습니다');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '해지 처리 중 오류 발생');
    } finally {
      setIsLoading(false);
      setShowTerminateDialog(false);
    }
  };

  if (status === 'active') {
    return (
      <>
        <Button
          variant="destructive"
          onClick={() => setShowCancelDialog(true)}
          className="w-full"
          disabled={isLoading}
        >
          구독 취소
        </Button>

        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>구독을 취소하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-2 text-left mt-4">
                  <p>• 다음 결제일({nextPaymentDate})까지 Pro 기능을 계속 사용할 수 있습니다</p>
                  <p>• 결제일 전까지 언제든지 재활성화할 수 있습니다</p>
                  <p>• 결제일 이후에는 무료 플랜으로 전환됩니다</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel} disabled={isLoading}>
                {isLoading ? '처리 중...' : '확인'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="flex gap-4">
        <Button onClick={handleReactivate} disabled={isLoading} className="flex-1">
          재활성화
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowTerminateDialog(true)}
          disabled={isLoading}
          className="flex-1"
        >
          즉시 해지
        </Button>

        <AlertDialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>구독을 즉시 해지하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-2 text-left mt-4 text-red-600">
                  <p className="font-semibold">⚠️ 경고:</p>
                  <p>• 남은 기간에 상관없이 즉시 무료 플랜으로 전환됩니다</p>
                  <p>• 남은 분석 횟수가 모두 삭제됩니다</p>
                  <p>• 저장된 결제 정보(BillingKey)가 삭제됩니다</p>
                  <p>• 재구독 시 결제 정보를 다시 입력해야 합니다</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleTerminate}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? '처리 중...' : '해지하기'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return null;
}
