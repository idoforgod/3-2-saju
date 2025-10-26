import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/backend';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

/**
 * Clerk Webhook 이벤트 처리
 */
export async function handleClerkWebhook(
  payload: string,
  headers: Record<string, string>
) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('CLERK_WEBHOOK_SECRET is not configured');
  }

  const wh = new Webhook(webhookSecret);

  try {
    const evt = wh.verify(payload, headers) as WebhookEvent;

    switch (evt.type) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      default:
        console.log('Unhandled webhook event:', evt.type);
    }

    return { success: true, event: evt.type };
  } catch (error) {
    console.error('Webhook verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

/**
 * user.created 이벤트 처리
 * users 테이블은 제거되었으므로 subscriptions 테이블만 생성
 */
async function handleUserCreated(user: any) {
  const supabase = await createSupabaseServerClient();

  const email = user.email_addresses?.[0]?.email_address || '';
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  const name = firstName || lastName
    ? (firstName + ' ' + lastName).trim()
    : null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: subscriptionError } = await (supabase as any)
      .from('subscriptions')
      .insert({
        clerk_user_id: user.id,
        plan_type: 'free',
        quota: 3,
        status: 'active',
        user_email: email,
        user_name: name,
      });

    if (subscriptionError) {
      console.error('Failed to insert subscription:', subscriptionError);
      throw subscriptionError;
    }

    console.log('User created successfully:', user.id);
  } catch (error) {
    console.error('Error in handleUserCreated:', error);
    throw error;
  }
}

/**
 * user.updated 이벤트 처리
 * users 테이블이 없으므로 subscriptions 테이블의 user_email, user_name만 업데이트
 */
async function handleUserUpdated(user: any) {
  const supabase = await createSupabaseServerClient();

  const email = user.email_addresses?.[0]?.email_address || '';
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  const name = firstName || lastName
    ? (firstName + ' ' + lastName).trim()
    : null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('subscriptions')
      .update({
        user_email: email,
        user_name: name,
      })
      .eq('clerk_user_id', user.id);

    if (error) {
      console.error('Failed to update subscription user info:', error);
      throw error;
    }

    console.log('User info updated successfully:', user.id);
  } catch (error) {
    console.error('Error in handleUserUpdated:', error);
    throw error;
  }
}

/**
 * user.deleted 이벤트 처리
 * CASCADE DELETE로 analyses도 함께 삭제됨
 */
async function handleUserDeleted(user: any) {
  const supabase = await createSupabaseServerClient();

  try {
    // subscriptions 삭제 (analyses는 CASCADE DELETE로 자동 삭제)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('subscriptions')
      .delete()
      .eq('clerk_user_id', user.id);

    if (error) {
      console.error('Failed to delete subscription:', error);
      throw error;
    }

    console.log('User and related data deleted successfully:', user.id);
  } catch (error) {
    console.error('Error in handleUserDeleted:', error);
    throw error;
  }
}
