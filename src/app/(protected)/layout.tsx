import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { SubscriptionProvider } from '@/app/providers/subscription-provider';
import type { Database } from '@/lib/supabase/types';

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const supabase = await createSupabaseServerClient();

  // 구독 정보 조회
  type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row'];
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type, quota, status, next_payment_date')
    .eq('clerk_user_id', userId)
    .single() as { data: Pick<SubscriptionRow, 'plan_type' | 'quota' | 'status' | 'next_payment_date'> | null };

  const initialData = subscription ? {
    planType: subscription.plan_type,
    quota: subscription.quota,
    status: subscription.status,
    nextPaymentDate: subscription.next_payment_date || undefined,
  } : null;

  return (
    <SubscriptionProvider initialData={initialData}>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </SubscriptionProvider>
  );
}
