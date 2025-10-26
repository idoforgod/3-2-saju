'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { apiClient } from '@/lib/remote/api-client';
import type { SubscriptionStatusResponse } from '../backend/schema';

interface SubscriptionContextValue {
  planType: 'free' | 'pro';
  quota: number;
  status: 'active' | 'cancelled' | 'terminated';
  maxQuota: number;
  isLoading: boolean;
  refetchQuota: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();

  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      const response = await apiClient.get<SubscriptionStatusResponse>('/api/subscription/status');
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분
    retry: 1,
  });

  const value: SubscriptionContextValue = {
    planType: data?.planType ?? 'free',
    quota: data?.quota ?? 0,
    status: data?.status ?? 'active',
    maxQuota: data?.planType === 'pro' ? 10 : 3,
    isLoading,
    refetchQuota: async () => {
      await refetch();
    },
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
