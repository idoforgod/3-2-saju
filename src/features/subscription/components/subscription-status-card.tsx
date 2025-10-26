'use client';

import type { StatusResponse } from '../lib/dto';
import { FreePlanCard } from './free-plan-card';
import { ProActivePlanCard } from './pro-active-plan-card';
import { ProCancelledPlanCard } from './pro-cancelled-plan-card';

interface SubscriptionStatusCardProps {
  subscription: StatusResponse;
  onSubscribe: () => void;
  onCancel: () => void;
  onReactivate: () => void;
}

export function SubscriptionStatusCard({
  subscription,
  onSubscribe,
  onCancel,
  onReactivate,
}: SubscriptionStatusCardProps) {
  if (subscription.planType === 'free') {
    return <FreePlanCard subscription={subscription} onSubscribe={onSubscribe} />;
  }

  if (subscription.status === 'cancelled') {
    return <ProCancelledPlanCard subscription={subscription} onReactivate={onReactivate} />;
  }

  if (subscription.status === 'active') {
    return <ProActivePlanCard subscription={subscription} onCancel={onCancel} />;
  }

  // terminated ¡‹î 4Ã\ ò¨
  return <FreePlanCard subscription={subscription} onSubscribe={onSubscribe} />;
}
