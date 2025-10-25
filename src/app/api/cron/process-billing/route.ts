import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { tossPayments } from '@/lib/toss-payments/client';
import type { Database } from '@/lib/supabase/types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

/**
 * 정기 결제 Cron API
 * POST /api/cron/process-billing
 *
 * Supabase Cron에서 매일 02:00 KST에 호출됨
 * 오늘이 결제일인 구독을 조회하여 자동 결제 처리
 */
export async function POST(req: NextRequest) {
  // 1. Cron 인증 토큰 검증
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== process.env.CRON_SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // 2. 오늘이 결제일인 구독 조회
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .eq('next_payment_date', today);

  if (error) {
    console.error('Failed to fetch subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({
      message: 'No billing to process today',
      count: 0,
    });
  }

  const results = {
    success: 0,
    failed: 0,
    details: [] as Array<{ clerk_user_id: string; status: string; error?: string }>,
  };

  // 3. 각 구독별 결제 처리
  for (const sub of (subscriptions as Subscription[])) {
    try {
      // billing_key null 체크
      if (!sub.billing_key) {
        console.error(`Missing billing_key for user: ${sub.clerk_user_id}`);
        continue;
      }

      // 토스페이먼츠 정기 결제 요청
      const payment = await tossPayments.chargeBilling({
        billingKey: sub.billing_key,
        amount: 9900, // Pro 구독 금액
        orderName: '사주분석 Pro 구독',
        customerEmail: sub.clerk_user_id, // 임시로 clerk_user_id 사용 (실제로는 이메일 필요)
        customerName: sub.clerk_user_id,
      });

      if (payment.status === 'DONE') {
        // 결제 성공: 쿼터 리셋 및 다음 결제일 업데이트
        const nextPaymentDate = new Date(today);
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 30); // +30일

        const updateData: Database['public']['Tables']['subscriptions']['Update'] = {
          quota: 10,
          next_payment_date: nextPaymentDate.toISOString().split('T')[0],
          last_payment_date: today,
        };

        await supabase
          .from('subscriptions')
          // @ts-expect-error - Supabase SSR 타입 추론 이슈
          .update(updateData)
          .eq('id', sub.id);

        results.success++;
        results.details.push({
          clerk_user_id: sub.clerk_user_id,
          status: 'success',
        });
      }
    } catch (error: any) {
      // 결제 실패: 구독 해지 처리
      const terminateData: Database['public']['Tables']['subscriptions']['Update'] = {
        status: 'terminated',
        billing_key: null,
        quota: 0,
        next_payment_date: null,
      };

      await supabase
        .from('subscriptions')
        // @ts-expect-error - Supabase SSR 타입 추론 이슈
        .update(terminateData)
        .eq('id', sub.id);

      // BillingKey 삭제
      try {
        await tossPayments.deleteBillingKey(sub.billing_key);
      } catch (deleteError) {
        console.error('Failed to delete BillingKey:', deleteError);
      }

      results.failed++;
      results.details.push({
        clerk_user_id: sub.clerk_user_id,
        status: 'failed',
        error: error.message,
      });
    }
  }

  return NextResponse.json({
    message: 'Billing processing completed',
    results,
  });
}
