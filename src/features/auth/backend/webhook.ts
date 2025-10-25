import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/backend';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import type { Database } from '@/lib/supabase/types';

/**
 * Clerk Webhook 이벤트 처리
 * @param payload - Webhook 요청 바디 (원본 문자열)
 * @param headers - Webhook 요청 헤더
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
        console.log(`Unhandled webhook event type: ${evt.type}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Webhook verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

/**
 * user.created 이벤트 처리
 * subscriptions 테이블에 초기 구독 정보 INSERT (users 테이블은 Database v2.0에서 제거됨)
 */
async function handleUserCreated(user: any) {
  const supabase = await createSupabaseServerClient();

  const insertData: Database['public']['Tables']['subscriptions']['Insert'] = {
    clerk_user_id: user.id,
    plan_type: 'free',
    quota: 3,
    status: 'active',
  };

  const { error } = await supabase
    .from('subscriptions')
    // @ts-expect-error - Supabase SSR 타입 추론 이슈
    .insert(insertData);

  if (error) {
    console.error('Failed to create subscription for user:', error);
    throw error;
  }

  console.log(`Subscription created for user: ${user.id}`);
}

/**
 * user.updated 이벤트 처리
 * Database v2.0에서는 users 테이블이 없으므로 필요 시에만 구현
 */
async function handleUserUpdated(user: any) {
  console.log(`User updated: ${user.id}`);
  // 필요 시 추가 로직 구현
}

/**
 * user.deleted 이벤트 처리
 * subscriptions와 analyses 테이블에서 clerk_user_id 기준으로 데이터 삭제
 */
async function handleUserDeleted(user: any) {
  const supabase = await createSupabaseServerClient();

  // subscriptions 삭제
  const { error: subError } = await supabase
    .from('subscriptions')
    .delete()
    .eq('clerk_user_id', user.id);

  if (subError) {
    console.error('Failed to delete subscription:', subError);
  }

  // analyses 삭제
  const { error: analysisError } = await supabase
    .from('analyses')
    .delete()
    .eq('clerk_user_id', user.id);

  if (analysisError) {
    console.error('Failed to delete analyses:', analysisError);
  }

  console.log(`User data deleted for: ${user.id}`);
}
