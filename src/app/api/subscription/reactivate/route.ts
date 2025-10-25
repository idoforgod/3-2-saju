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
    .select('status, next_payment_date')
    .eq('clerk_user_id', userId)
    .single();

  if (fetchError || !subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  if (subscription.status !== 'cancelled') {
    return NextResponse.json(
      { error: 'Only cancelled subscriptions can be reactivated' },
      { status: 400 }
    );
  }

  // 2. 결제일 전까지만 재활성화 가능
  const today = new Date().toISOString().split('T')[0];
  if (!subscription.next_payment_date || subscription.next_payment_date <= today) {
    return NextResponse.json(
      { error: 'Cannot reactivate after payment date' },
      { status: 400 }
    );
  }

  // 3. 구독 상태 복원
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      cancelled_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('clerk_user_id', userId);

  if (updateError) {
    console.error('Reactivate subscription error:', updateError);
    return NextResponse.json({ error: 'Failed to reactivate subscription' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
