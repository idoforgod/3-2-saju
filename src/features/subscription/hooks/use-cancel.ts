'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/remote/api-client';
import { toast } from 'sonner';
import type { CancelResponse } from '../lib/dto';

export function useCancel() {
  const [isCancelling, setIsCancelling] = useState(false);

  async function cancel() {
    setIsCancelling(true);

    try {
      const response = await apiClient.post<{ success: boolean; message: string; data: CancelResponse }>(
        '/api/subscription/cancel'
      );

      if (response.data.success) {
        toast.success(response.data.message);
        return response.data.data;
      }
    } catch (error: any) {
      const message = error?.response?.data?.error || '구독 취소 중 오류가 발생했습니다.';
      toast.error(message);
      throw error;
    } finally {
      setIsCancelling(false);
    }
  }

  return { cancel, isCancelling };
}
