'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { apiClient } from '@/lib/remote/api-client';
import type { StatusResponse } from '../lib/dto';

export function useSubscriptionStatus() {
  const { userId } = useAuth();
  const [subscription, setSubscription] = useState<StatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      if (!userId) {
        setError('로그인이 필요합니다');
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get<{ success: boolean; data: StatusResponse }>(
          '/api/subscription/status'
        );
        if (response.data.success) {
          setSubscription(response.data.data);
        }
      } catch (err: any) {
        setError(err?.response?.data?.error || '구독 정보를 불러오는데 실패했습니다');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscription();
  }, [userId]);

  return { subscription, isLoading, error };
}
