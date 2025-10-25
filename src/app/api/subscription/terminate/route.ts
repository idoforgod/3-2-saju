import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { tossPayments } from '@/lib/toss-payments/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  // 1. 현재 구독 정보 조회
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('billing_key, status')
    .eq('clerk_user_id', userId)
    .single();

  if (fetchError || !subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  if (subscription.status !== 'cancelled') {
    return NextResponse.json(
      { error: 'Only cancelled subscriptions can be terminated' },
      { status: 400 }
    );
  }

  if (!subscription.billing_key) {
    return NextResponse.json({ error: 'No billing key found' }, { status: 400 });
  }

  try {
    // 2. 토스페이먼츠 BillingKey 삭제
    await tossPayments.deleteBillingKey(subscription.billing_key);

    // 3. Supabase 업데이트
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'terminated',
        billing_key: null,
        quota: 0,
        next_payment_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', userId);

    if (updateError) {
      throw new Error('Failed to update subscription');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Terminate error:', error);

    // BillingKey 삭제 실패 시에도 DB는 업데이트 (수동 처리 필요)
    await supabase
      .from('subscriptions')
      .update({
        status: 'terminated',
        billing_key: null,
        quota: 0,
        next_payment_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', userId);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Termination failed' },
      { status: 500 }
    );
  }
}
