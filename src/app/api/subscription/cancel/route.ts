import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  // 1. 현재 구독 상태 확인
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('status, plan_type')
    .eq('clerk_user_id', userId)
    .single();

  if (fetchError || !subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  if (subscription.plan_type !== 'pro' || subscription.status !== 'active') {
    return NextResponse.json(
      { error: 'Only active Pro subscriptions can be cancelled' },
      { status: 400 }
    );
  }

  // 2. 구독 상태 변경
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('clerk_user_id', userId);

  if (updateError) {
    console.error('Cancel subscription error:', updateError);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
