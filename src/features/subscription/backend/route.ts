import { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { getSupabase, getClerkUserId } from '@/backend/hono/context';
import { withClerkAuth } from '@/backend/middleware/clerk';
import { SubscriptionErrorCode, SubscriptionErrorMessages } from './error';
import { getSubscriptionStatus } from './service';

const subscriptionRouter = new Hono<AppEnv>();

/**
 * GET /api/subscription/status
 * 현재 사용자의 구독 정보 조회
 */
subscriptionRouter.get('/api/subscription/status', withClerkAuth(), async (c) => {
  const clerkUserId = getClerkUserId(c);

  if (!clerkUserId) {
    return c.json(
      { error: SubscriptionErrorMessages.UNAUTHORIZED },
      401
    );
  }

  const supabase = getSupabase(c);

  try {
    const subscription = await getSubscriptionStatus(supabase, clerkUserId);

    if (!subscription) {
      return c.json(
        { error: SubscriptionErrorMessages.SUBSCRIPTION_NOT_FOUND },
        404
      );
    }

    return c.json(subscription, 200);
  } catch (error) {
    const logger = c.get('logger');
    logger.error('Failed to fetch subscription status:', error);

    return c.json(
      { error: SubscriptionErrorMessages.INTERNAL_ERROR },
      500
    );
  }
});

/**
 * 구독 라우터를 Hono 앱에 등록
 */
export function registerSubscriptionRoutes(app: Hono<AppEnv>) {
  app.route('/', subscriptionRouter);
}

export default subscriptionRouter;
