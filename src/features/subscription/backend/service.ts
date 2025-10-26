import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import type { SubscriptionStatusResponse } from './schema';

type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row'];

/**
 * 구독 정보 조회 서비스
 * @param supabase Supabase 클라이언트
 * @param clerkUserId Clerk 사용자 ID
 * @returns 구독 정보 또는 null
 */
export async function getSubscriptionStatus(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<SubscriptionStatusResponse | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('plan_type, quota, status, next_payment_date')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    planType: data.plan_type as 'free' | 'pro',
    quota: data.quota,
    status: data.status as 'active' | 'cancelled' | 'terminated',
    nextPaymentDate: data.next_payment_date || undefined,
  };
}
