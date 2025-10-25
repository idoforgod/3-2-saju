'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface SubscriptionData {
  planType: 'free' | 'pro';
  quota: number;
  status: 'active' | 'cancelled' | 'terminated';
  nextPaymentDate?: string;
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  quota: number;
  planType: 'free' | 'pro';
  status: 'active' | 'cancelled' | 'terminated';
  decrementQuota: () => void;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

interface ProviderProps {
  children: React.ReactNode;
  initialData: SubscriptionData | null;
}

export function SubscriptionProvider({ children, initialData }: ProviderProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(initialData);

  // 쿼터 차감 (낙관적 업데이트)
  const decrementQuota = useCallback(() => {
    setSubscription(prev => {
      if (!prev) return null;
      return {
        ...prev,
        quota: Math.max(0, prev.quota - 1),
      };
    });
  }, []);

  // 구독 정보 새로고침 (서버에서 최신 데이터 조회)
  const refreshSubscription = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription/status');
      if (!res.ok) throw new Error('Failed to fetch subscription');

      const data = await res.json();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
    }
  }, []);

  // Context 값 메모이제이션 (불필요한 리렌더링 방지)
  const value = useMemo(() => ({
    subscription,
    quota: subscription?.quota ?? 0,
    planType: subscription?.planType ?? 'free',
    status: subscription?.status ?? 'active',
    decrementQuota,
    refreshSubscription,
  }), [subscription, decrementQuota, refreshSubscription]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// useSubscription 훅
export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
