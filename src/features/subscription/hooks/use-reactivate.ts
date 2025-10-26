'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/remote/api-client';
import { toast } from 'sonner';
import type { ReactivateResponse } from '../lib/dto';

export function useReactivate() {
  const [isReactivating, setIsReactivating] = useState(false);

  async function reactivate() {
    setIsReactivating(true);

    try {
      const response = await apiClient.post<{ success: boolean; message: string; data: ReactivateResponse }>(
        '/api/subscription/reactivate'
      );

      if (response.data.success) {
        toast.success(response.data.message);
        return response.data.data;
      }
    } catch (error: any) {
      const message = error?.response?.data?.error || '구독 재활성화 중 오류가 발생했습니다.';
      toast.error(message);
      throw error;
    } finally {
      setIsReactivating(false);
    }
  }

  return { reactivate, isReactivating };
}
