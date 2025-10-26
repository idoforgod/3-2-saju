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
import { RefreshCcw, Loader2, Calendar, DollarSign, CreditCard } from 'lucide-react';

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
      <DialogContent className="sm:max-w-md border-2 border-border shadow-purple-2xl">
        <DialogHeader className="text-center">
          {/* 아이콘 */}
          <div className="flex justify-center mb-4">
            <div className="relative inline-flex items-center justify-center w-16 h-16">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse-slow" />
              <div className="relative p-3 rounded-full gradient-purple">
                <RefreshCcw className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          <DialogTitle className="text-2xl font-bold text-foreground">
            구독을 재활성화하시겠습니까?
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-4 text-left">
            <div className="flex items-start gap-2 p-3 rounded-lg border border-border bg-card">
              <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">다음 결제일</p>
                <p className="text-sm font-semibold text-foreground">{nextPaymentDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg border border-border bg-card">
              <DollarSign className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">결제 금액</p>
                <p className="text-sm font-semibold text-foreground">9,900원</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg border border-border bg-card">
              <CreditCard className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">결제 수단</p>
                <p className="text-sm font-semibold text-foreground font-mono">{maskBillingKey(billingKey)}</p>
              </div>
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
            취소
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto gradient-purple text-white shadow-purple-lg hover:shadow-purple-xl hover:scale-105 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>처리 중...</span>
              </>
            ) : (
              <>
                <RefreshCcw className="w-4 h-4 mr-2" />
                <span>재활성화</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
