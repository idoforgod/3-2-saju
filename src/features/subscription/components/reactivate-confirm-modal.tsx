'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReactivateConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  nextPaymentDate: string | null;
  billingKey: string | null;
}

export function ReactivateConfirmModal({
  open,
  onClose,
  onConfirm,
  isLoading,
  nextPaymentDate,
  billingKey,
}: ReactivateConfirmModalProps) {
  const maskBillingKey = (key: string | null) => {
    if (!key) return '';
    const lastFour = key.slice(-4);
    return '**** **** **** ' + lastFour;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>구독을 재활성화하시겠습니까?</DialogTitle>
          <DialogDescription className="space-y-2 pt-4">
            <p>다음 결제일({nextPaymentDate})에 정기 결제가 재개됩니다.</p>
            <p>결제 금액: 9,900원</p>
            <p>결제 수단: {maskBillingKey(billingKey)}</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? '처리 중...' : '확인'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
