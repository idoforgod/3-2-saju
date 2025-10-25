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

interface QuotaExhaustedModalProps {
  onClose: () => void;
  onSubscribe: () => void;
}

export function QuotaExhaustedModal({ onClose, onSubscribe }: QuotaExhaustedModalProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>사용 가능한 횟수가 없습니다</DialogTitle>
          <DialogDescription>
            무료 3회 체험이 모두 소진되었습니다.
            <br />
            Pro 구독 시 월 10회 분석과 고급 AI 모델을 이용하실 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            대시보드로 돌아가기
          </Button>
          <Button onClick={onSubscribe}>Pro 구독하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
