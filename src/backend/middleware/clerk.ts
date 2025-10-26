import { clerkClient } from '@clerk/backend';
import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../hono/context';

/**
 * Clerk JWT 검증 미들웨어
 * Authorization Bearer 토큰을 검증하고 clerk_user_id를 context에 주입합니다.
 */
export const withClerkAuth = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const authHeader = c.req.header('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      c.get('logger').warn('Clerk auth failed: No token provided');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
      const { sessionId } = await clerkClient().sessions.verifyToken(token);
      const session = await clerkClient().sessions.getSession(sessionId);

      c.set('clerkUserId', session.userId);
      c.get('logger').info(`Clerk auth success: ${session.userId}`);

      await next();
    } catch (error) {
      c.get('logger').error('Clerk token verification failed:', error);
      return c.json({ error: 'Invalid token' }, 401);
    }
  };
};
