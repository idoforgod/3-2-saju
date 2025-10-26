'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Zap, ArrowLeft } from 'lucide-react';

interface QuotaExhaustedModalProps {
  onClose: () => void;
  onSubscribe: () => void;
}

export function QuotaExhaustedModal({ onClose, onSubscribe }: QuotaExhaustedModalProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-border shadow-purple-2xl">
        <DialogHeader className="text-center">
          {/* 아이콘 */}
          <div className="flex justify-center mb-4">
            <div className="relative inline-flex items-center justify-center w-16 h-16">
              <div className="absolute inset-0 bg-warning/10 rounded-full blur-xl animate-pulse-slow" />
              <div className="relative p-3 rounded-full bg-warning/10">
                <AlertCircle className="w-10 h-10 text-warning" />
              </div>
            </div>
          </div>

          <DialogTitle className="text-2xl font-bold text-foreground">
            사용 가능한 횟수가 없습니다
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground pt-2">
            무료 3회 체험이 모두 소진되었습니다.
            <br />
            <span className="inline-flex items-center gap-1 mt-2 font-semibold text-primary">
              <Zap className="w-4 h-4 fill-primary" />
              Pro 구독
            </span>
            {' '}시 월 10회 분석과 고급 AI 모델을 이용하실 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-2 hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            대시보드로 돌아가기
          </Button>
          <Button
            onClick={onSubscribe}
            className="w-full sm:w-auto gradient-purple text-white shadow-purple-lg hover:shadow-purple-xl hover:scale-105 transition-all duration-200"
          >
            <Zap className="w-4 h-4 mr-2 fill-white" />
            Pro 구독하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
