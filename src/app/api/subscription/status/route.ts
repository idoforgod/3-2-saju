import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('plan_type, quota, status, next_payment_date, last_payment_date, cancelled_at')
    .eq('clerk_user_id', userId)
    .single();

  if (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  return NextResponse.json({
    planType: subscription.plan_type,
    quota: subscription.quota,
    status: subscription.status,
    nextPaymentDate: subscription.next_payment_date,
    lastPaymentDate: subscription.last_payment_date,
    cancelledAt: subscription.cancelled_at,
  });
}
