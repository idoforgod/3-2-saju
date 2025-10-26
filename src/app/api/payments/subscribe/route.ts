import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { tossPayments } from '@/lib/toss-payments/client';
import { createClient } from '@/lib/supabase/server';
import { parseTossError } from '@/lib/toss-payments/errors';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { authKey, customerKey } = await req.json();

  if (!authKey || !customerKey || customerKey !== userId) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  let billingKey: string | undefined;

  try {
    // 1. Clerk에서 사용자 정보 조회
    const user = await (await clerkClient()).users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress || `${userId}@clerk.user`;
    const userName = user.firstName || user.username || 'User';

    // 2. BillingKey 발급
    billingKey = await tossPayments.issueBillingKey(authKey, customerKey);

    // 3. 첫 결제 실행 (9,900원)
    const payment = await tossPayments.chargeBilling({
      billingKey,
      amount: 9900,
      orderName: '사주분석 Pro 구독',
      customerEmail: userEmail,
      customerName: userName,
    });

    if (payment.status !== 'DONE') {
      throw new Error('Payment failed');
    }

    // 4. Supabase 구독 정보 업데이트
    const supabase = await createClient();
    const today = new Date();
    const nextPaymentDate = new Date(today);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        plan_type: 'pro',
        status: 'active',
        billing_key: billingKey,
        quota: 10,
        next_payment_date: nextPaymentDate.toISOString().split('T')[0],
        last_payment_date: today.toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', userId);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      // 결제는 성공했지만 DB 업데이트 실패 → 수동 처리 필요
      throw new Error('Failed to update subscription');
    }

    return NextResponse.json({ success: true, billingKey });
  } catch (error) {
    console.error('Payment error:', error);

    // 에러 발생 시 BillingKey 삭제 시도
    if (billingKey) {
      try {
        await tossPayments.deleteBillingKey(billingKey);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    const errorMessage = parseTossError(error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
