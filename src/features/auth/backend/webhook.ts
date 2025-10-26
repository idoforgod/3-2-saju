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
 */
async function handleUserCreated(user: any) {
  const supabase = createSupabaseServerClient();

  const email = user.email_addresses?.[0]?.email_address || '';
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  const name = firstName || lastName
    ? (firstName + ' ' + lastName).trim()
    : null;

  try {
    const { error: userError } = await supabase
      .from('users')
      .insert({
        clerk_user_id: user.id,
        email,
        name,
      });

    if (userError) {
      console.error('Failed to insert user:', userError);
      throw userError;
    }

    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        clerk_user_id: user.id,
        plan_type: 'free',
        quota: 3,
        status: 'active',
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
 */
async function handleUserUpdated(user: any) {
  const supabase = createSupabaseServerClient();

  const email = user.email_addresses?.[0]?.email_address || '';
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  const name = firstName || lastName
    ? (firstName + ' ' + lastName).trim()
    : null;

  try {
    const { error } = await supabase
      .from('users')
      .update({
        email,
        name,
      })
      .eq('clerk_user_id', user.id);

    if (error) {
      console.error('Failed to update user:', error);
      throw error;
    }

    console.log('User updated successfully:', user.id);
  } catch (error) {
    console.error('Error in handleUserUpdated:', error);
    throw error;
  }
}

/**
 * user.deleted 이벤트 처리
 */
async function handleUserDeleted(user: any) {
  const supabase = createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('clerk_user_id', user.id);

    if (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }

    console.log('User deleted successfully:', user.id);
  } catch (error) {
    console.error('Error in handleUserDeleted:', error);
    throw error;
  }
}
