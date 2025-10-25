import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppEnv } from '@/backend/hono/context';

const analysisRouter = new Hono<AppEnv>();

// DELETE /api/analysis/:id
analysisRouter.delete(
  '/api/analysis/:id',
  zValidator('param', z.object({ id: z.string().uuid() })),
  async (c) => {
    const { id } = c.req.valid('param');
    
    // Clerk 인증 확인 (Middleware에서 설정한 clerkUserId 사용)
    const clerkUserId = c.get('clerkUserId');
    
    if (!clerkUserId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const supabase = c.get('supabase');
    const logger = c.get('logger');

    try {
      // 권한 확인 및 삭제
      const { error, count } = await supabase
        .from('analyses')
        .delete({ count: 'exact' })
        .eq('id', id)
        .eq('clerk_user_id', clerkUserId);

      if (error) {
        logger.error('Delete error:', error);
        return c.json({ success: false, error: 'Failed to delete analysis' }, 500);
      }

      if (count === 0) {
        return c.json({ success: false, error: 'Analysis not found or access denied' }, 404);
      }

      return c.json({ success: true, message: 'Analysis deleted successfully' });
    } catch (error) {
      logger.error('Unexpected error:', error);
      return c.json({ success: false, error: 'Internal server error' }, 500);
    }
  }
);

export function registerAnalysisRoutes(app: Hono<AppEnv>) {
  app.route('/', analysisRouter);
}

export default analysisRouter;
