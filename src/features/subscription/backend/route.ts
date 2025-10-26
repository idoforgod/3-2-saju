import { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { withClerkAuth } from '@/backend/middleware/clerk';
import { SubscriptionService } from './service';
import { subscribeSchema, statusResponseSchema } from './schema';
import { SubscriptionError, SUBSCRIPTION_ERROR_MESSAGES } from './error';

export const subscriptionRoutes = new Hono<AppEnv>()
  .use('*', withClerkAuth())

  // 구독 정보 조회
  .get('/status', async (c) => {
    const userId = c.get('clerkUserId');
    if (!userId) {
      return c.json({ success: false, error: '로그인이 필요합니다' }, 401);
    }

    const service = new SubscriptionService(c.get('supabase'));

    try {
      const subscription = await service.getSubscriptionStatus(userId);
      return c.json({
        success: true,
        data: statusResponseSchema.parse(subscription),
      });
    } catch (error) {
      if (error instanceof SubscriptionError) {
        return c.json(
          { success: false, error: SUBSCRIPTION_ERROR_MESSAGES[error.code] },
          404
        );
      }
      c.get('logger').error('Failed to fetch subscription status:', error);
      return c.json({ success: false, error: '서버 오류가 발생했습니다' }, 500);
    }
  })

  // Pro 구독 시작
  .post('/subscribe', async (c) => {
    const userId = c.get('clerkUserId');
    if (!userId) {
      return c.json({ success: false, error: '로그인이 필요합니다' }, 401);
    }

    try {
      const body = await c.req.json();
      const { billingKey, customerKey } = subscribeSchema.parse(body);

      const service = new SubscriptionService(c.get('supabase'));
      const result = await service.subscribe(userId, billingKey, customerKey);

      return c.json({
        success: true,
        message: 'Pro 구독이 시작되었습니다',
        data: result,
      });
    } catch (error) {
      if (error instanceof SubscriptionError) {
        return c.json(
          { success: false, error: SUBSCRIPTION_ERROR_MESSAGES[error.code] },
          400
        );
      }
      c.get('logger').error('Failed to subscribe:', error);
      return c.json({ success: false, error: '서버 오류가 발생했습니다' }, 500);
    }
  })

  // 구독 취소
  .post('/cancel', async (c) => {
    const userId = c.get('clerkUserId');
    if (!userId) {
      return c.json({ success: false, error: '로그인이 필요합니다' }, 401);
    }

    try {
      const service = new SubscriptionService(c.get('supabase'));
      const result = await service.cancel(userId);

      return c.json({
        success: true,
        message: `구독이 취소되었습니다. ${result.nextPaymentDate}까지 Pro 혜택이 유지됩니다.`,
        data: result,
      });
    } catch (error) {
      if (error instanceof SubscriptionError) {
        return c.json(
          { success: false, error: SUBSCRIPTION_ERROR_MESSAGES[error.code] },
          400
        );
      }
      c.get('logger').error('Failed to cancel subscription:', error);
      return c.json({ success: false, error: '서버 오류가 발생했습니다' }, 500);
    }
  })

  // 구독 재활성화
  .post('/reactivate', async (c) => {
    const userId = c.get('clerkUserId');
    if (!userId) {
      return c.json({ success: false, error: '로그인이 필요합니다' }, 401);
    }

    try {
      const service = new SubscriptionService(c.get('supabase'));
      const result = await service.reactivate(userId);

      return c.json({
        success: true,
        message: '구독이 재활성화되었습니다.',
        data: result,
      });
    } catch (error) {
      if (error instanceof SubscriptionError) {
        return c.json(
          { success: false, error: SUBSCRIPTION_ERROR_MESSAGES[error.code] },
          400
        );
      }
      c.get('logger').error('Failed to reactivate subscription:', error);
      return c.json({ success: false, error: '서버 오류가 발생했습니다' }, 500);
    }
  });
