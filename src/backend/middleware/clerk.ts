import { createClerkClient } from '@clerk/backend';
import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../hono/context';

/**
 * Clerk JWT 검증 미들웨어
 * Authorization 헤더에서 Bearer 토큰을 추출하여 Clerk 세션을 검증합니다.
 * 검증 성공 시 c.set('clerkUserId', userId)로 User ID를 주입합니다.
 */
export const withClerkAuth = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const authHeader = c.req.header('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return c.json({ error: 'Unauthorized: No token provided' }, 401);
    }

    try {
      // Clerk 세션 토큰 검증
      const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      // verifyToken 대신 sessions.verifyToken 사용
      const verifiedToken = await clerk.sessions.verifySession(
        token,
        process.env.CLERK_SECRET_KEY
      );

      if (!verifiedToken || !verifiedToken.userId) {
        return c.json({ error: 'Unauthorized: Invalid token' }, 401);
      }

      // Context에 Clerk User ID 주입
      c.set('clerkUserId', verifiedToken.userId);

      await next();
    } catch (error) {
      const logger = c.get('logger');
      logger.error('Clerk JWT verification failed:', error);
      return c.json({ error: 'Unauthorized: Token verification failed' }, 401);
    }
  };
};
