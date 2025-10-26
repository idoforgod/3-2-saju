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

interface CancelConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  nextPaymentDate: string | null;
}

export function CancelConfirmModal({
  open,
  onClose,
  onConfirm,
  isLoading,
  nextPaymentDate,
}: CancelConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>구독을 취소하시겠습니까?</DialogTitle>
          <DialogDescription className="space-y-2 pt-4">
            <p>다음 결제일({nextPaymentDate})까지 Pro 혜택이 유지됩니다.</p>
            <p>결제일 전까지는 언제든 취소를 철회할 수 있습니다.</p>
            <p>결제일 이후에는 자동으로 해지되며, 재구독 시 BillingKey가 재발급됩니다.</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} variant="destructive">
            {isLoading ? '처리 중...' : '확인'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
