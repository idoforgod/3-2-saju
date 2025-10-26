'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/remote/api-client';
import { toast } from 'sonner';
import type { SubscribeRequest, SubscribeResponse } from '../lib/dto';

export function useSubscribe() {
  const router = useRouter();
  const [isSubscribing, setIsSubscribing] = useState(false);

  async function subscribe(billingKey: string, customerKey: string) {
    setIsSubscribing(true);

    try {
      const response = await apiClient.post<{ success: boolean; message: string; data: SubscribeResponse }>(
        '/api/subscription/subscribe',
        { billingKey, customerKey } as SubscribeRequest
      );

      if (response.data.success) {
        toast.success('Pro 구독이 시작되었습니다! 이제 월 10회 분석을 이용하실 수 있습니다.');
        router.push('/dashboard');
      }
    } catch (error: any) {
      const message = error?.response?.data?.error || '결제에 실패했습니다. 다시 시도해주세요.';
      toast.error(message);
      throw error;
    } finally {
      setIsSubscribing(false);
    }
  }

  return { subscribe, isSubscribing };
}
