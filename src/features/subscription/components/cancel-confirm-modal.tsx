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
import { AlertTriangle, Loader2, Check, Info } from 'lucide-react';

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
      <DialogContent className="sm:max-w-md border-2 border-border shadow-purple-2xl">
        <DialogHeader className="text-center">
          {/* 아이콘 */}
          <div className="flex justify-center mb-4">
            <div className="relative inline-flex items-center justify-center w-16 h-16">
              <div className="absolute inset-0 bg-warning/10 rounded-full blur-xl animate-pulse-slow" />
              <div className="relative p-3 rounded-full bg-warning/10">
                <AlertTriangle className="w-10 h-10 text-warning" />
              </div>
            </div>
          </div>

          <DialogTitle className="text-2xl font-bold text-foreground">
            구독을 취소하시겠습니까?
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-4 text-left">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                다음 결제일(<span className="font-semibold text-foreground">{nextPaymentDate}</span>)까지 Pro 혜택이 유지됩니다.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                결제일 전까지는 언제든 취소를 철회할 수 있습니다.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                결제일 이후에는 자동으로 해지되며, 재구독 시 BillingKey가 재발급됩니다.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto border-2 hover:bg-muted"
          >
            돌아가기
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            variant="destructive"
            className="w-full sm:w-auto shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>처리 중...</span>
              </>
            ) : (
              '구독 취소'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
