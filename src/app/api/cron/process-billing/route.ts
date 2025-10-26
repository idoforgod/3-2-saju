import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { tossPayments } from '@/lib/toss-payments';
import { getEnv } from '@/backend/config';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const expectedToken = 'Bearer ' + getEnv().CRON_SECRET_TOKEN;

  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();

  const today = new Date().toISOString().split('T')[0];

  type SubscriptionRow = {
    clerk_user_id: string;
    billing_key: string;
    user_email: string | null;
    user_name: string | null;
    plan_type: 'free' | 'pro';
  };

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('clerk_user_id, billing_key, user_email, user_name, plan_type')
    .eq('status', 'active')
    .eq('next_payment_date', today)
    .returns<SubscriptionRow[]>();

  if (error || !subscriptions) {
    console.error('Failed to fetch subscriptions:', error);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }

  const results = { success: 0, failed: 0 };

  for (const sub of subscriptions) {
    try {
      await tossPayments.chargeBilling({
        billingKey: sub.billing_key,
        amount: 9900,
        orderName: '사주분석 Pro 구독',
        customerEmail: sub.user_email || 'unknown@example.com',
        customerName: sub.user_name || '사용자',
      });

      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('subscriptions')
        .update({
          quota: 10,
          next_payment_date: nextMonth.toISOString().split('T')[0],
          last_payment_date: today,
        })
        .eq('clerk_user_id', sub.clerk_user_id);

      results.success++;
    } catch (error) {
      console.error('Payment failed for user:', sub.clerk_user_id, error);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('subscriptions')
        .update({
          status: 'terminated',
          billing_key: null,
          quota: 0,
          next_payment_date: null,
        })
        .eq('clerk_user_id', sub.clerk_user_id);

      try {
        await tossPayments.deleteBillingKey(sub.billing_key);
      } catch (deleteError) {
        console.error('Failed to delete billing key:', deleteError);
      }

      results.failed++;
    }
  }

  return NextResponse.json({
    message: 'Billing processed',
    results,
    total: subscriptions.length,
  });
}
