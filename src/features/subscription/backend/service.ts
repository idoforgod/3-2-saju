import type { SupabaseClient } from '@supabase/supabase-js';
import { tossPayments } from '@/lib/toss-payments/client';
import { SubscriptionError } from './error';
import type { StatusResponse, SubscribeResponse, CancelResponse, ReactivateResponse } from './schema';

export class SubscriptionService {
  constructor(private supabase: SupabaseClient) {}

  async getSubscriptionStatus(userId: string): Promise<StatusResponse> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (error || !data) {
      throw new SubscriptionError('SUBSCRIPTION_NOT_FOUND');
    }

    return {
      clerkUserId: data.clerk_user_id,
      planType: data.plan_type as 'free' | 'pro',
      status: data.status as 'active' | 'cancelled' | 'terminated',
      quota: data.quota,
      nextPaymentDate: data.next_payment_date,
      lastPaymentDate: data.last_payment_date,
      billingKey: data.billing_key,
      cancelledAt: data.cancelled_at,
    };
  }

  async subscribe(userId: string, billingKey: string, customerKey: string): Promise<SubscribeResponse> {
    // 1. 현재 구독 확인
    const current = await this.getSubscriptionStatus(userId);
    if (current.planType === 'pro' && current.status === 'active') {
      throw new SubscriptionError('ALREADY_SUBSCRIBED');
    }

    // 2. 첫 결제 실행
    try {
      const payment = await tossPayments.chargeBilling({
        billingKey,
        amount: 9900,
        orderName: '사주분석 Pro 구독',
        customerEmail: customerKey,
        customerName: '사용자',
      });

      if (payment.status !== 'DONE') {
        throw new Error('결제 실패');
      }
    } catch (error) {
      // 결제 실패 시 BillingKey 삭제
      try {
        await tossPayments.deleteBillingKey(billingKey);
      } catch (deleteError) {
        // BillingKey 삭제 실패는 로그만 남기고 계속 진행
        console.error('Failed to delete billing key:', deleteError);
      }
      throw new SubscriptionError('PAYMENT_FAILED');
    }

    // 3. 구독 정보 업데이트
    const nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const lastPaymentDate = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('subscriptions')
      .update({
        plan_type: 'pro',
        status: 'active',
        quota: 10,
        billing_key: billingKey,
        next_payment_date: nextPaymentDate,
        last_payment_date: lastPaymentDate,
        cancelled_at: null,
      })
      .eq('clerk_user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new SubscriptionError('UPDATE_FAILED');
    }

    return {
      clerkUserId: data.clerk_user_id,
      planType: 'pro',
      quota: data.quota,
      nextPaymentDate: data.next_payment_date!,
      lastPaymentDate: data.last_payment_date!,
    };
  }

  async cancel(userId: string): Promise<CancelResponse> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', userId)
      .eq('status', 'active')
      .eq('plan_type', 'pro')
      .select()
      .single();

    if (error || !data) {
      throw new SubscriptionError('CANCEL_FAILED');
    }

    return {
      status: 'cancelled',
      cancelledAt: data.cancelled_at!,
      nextPaymentDate: data.next_payment_date,
    };
  }

  async reactivate(userId: string): Promise<ReactivateResponse> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('subscriptions')
      .update({
        status: 'active',
        cancelled_at: null,
      })
      .eq('clerk_user_id', userId)
      .eq('status', 'cancelled')
      .gt('next_payment_date', today)
      .select()
      .single();

    if (error || !data) {
      throw new SubscriptionError('REACTIVATE_FAILED');
    }

    return {
      status: 'active',
      cancelledAt: null,
      nextPaymentDate: data.next_payment_date,
    };
  }
}
