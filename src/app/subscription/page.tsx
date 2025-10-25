import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import FreeSubscriptionView from './_components/free-subscription-view';
import ProActiveView from './_components/pro-active-view';
import ProCancelledView from './_components/pro-cancelled-view';
import TerminatedView from './_components/terminated-view';

export default async function SubscriptionPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('plan_type, quota, status, next_payment_date, last_payment_date, cancelled_at')
    .eq('clerk_user_id', userId)
    .single();

  if (error || !subscription) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">구독 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // Free 플랜
  if (subscription.plan_type === 'free') {
    return <FreeSubscriptionView quota={subscription.quota} />;
  }

  // Pro 플랜 - 활성
  if (subscription.plan_type === 'pro' && subscription.status === 'active') {
    return (
      <ProActiveView
        quota={subscription.quota}
        nextPaymentDate={subscription.next_payment_date || ''}
        lastPaymentDate={subscription.last_payment_date || ''}
      />
    );
  }

  // Pro 플랜 - 취소 예정
  if (subscription.plan_type === 'pro' && subscription.status === 'cancelled') {
    return (
      <ProCancelledView
        quota={subscription.quota}
        nextPaymentDate={subscription.next_payment_date || ''}
        cancelledAt={subscription.cancelled_at || ''}
      />
    );
  }

  // 구독 해지됨
  if (subscription.status === 'terminated') {
    return <TerminatedView />;
  }

  // 기타 상태 (fallback)
  return <FreeSubscriptionView quota={subscription.quota} />;
}
