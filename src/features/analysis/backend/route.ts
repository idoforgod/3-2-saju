import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppEnv } from '@/backend/hono/context';
import { withClerkAuth } from '@/backend/middleware/clerk';
import { getClerkUserId, getSupabase } from '@/backend/hono/context';
import { sajuInputSchema } from './schema';
import { AnalysisErrorCode, AnalysisErrorMessages } from './error';
import { analyzeWithGemini, getModelName } from '@/lib/gemini/client';
import { generateSajuPrompt } from '@/lib/gemini/prompts';

const analysisRouter = new Hono<AppEnv>();

// POST /api/analysis/create
analysisRouter.post(
  '/api/analysis/create',
  withClerkAuth(),
  zValidator('json', sajuInputSchema),
  async (c) => {
    const clerkUserId = getClerkUserId(c);

    if (!clerkUserId) {
      return c.json(
        {
          success: false,
          error: {
            code: AnalysisErrorCode.UNAUTHORIZED,
            message: AnalysisErrorMessages.UNAUTHORIZED,
          },
        },
        401
      );
    }

    const supabase = getSupabase(c);
    const logger = c.get('logger');
    const input = c.req.valid('json');

    try {
      // 1. 쿼터 확인
      const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .select('quota, plan_type')
        .eq('clerk_user_id', clerkUserId)
        .eq('status', 'active')
        .single();

      if (subError || !sub) {
        logger.error('Subscription fetch error:', subError);
        return c.json(
          {
            success: false,
            error: {
              code: AnalysisErrorCode.NOT_FOUND,
              message: '구독 정보를 찾을 수 없습니다.',
            },
          },
          404
        );
      }

      if (sub.quota <= 0) {
        return c.json(
          {
            success: false,
            error: {
              code: AnalysisErrorCode.QUOTA_EXCEEDED,
              message: AnalysisErrorMessages.QUOTA_EXCEEDED,
            },
          },
          400
        );
      }

      // 2. Gemini API 호출
      const prompt = generateSajuPrompt({
        name: input.name,
        birthDate: input.birthDate,
        birthTime: input.birthTime,
        gender: input.gender,
      });

      const isPro = sub.plan_type === 'pro';
      const markdown = await analyzeWithGemini(prompt, isPro);

      // 3. 분석 결과 저장
      const { data: analysis, error: insertError } = await supabase
        .from('analyses')
        .insert({
          clerk_user_id: clerkUserId,
          name: input.name,
          birth_date: input.birthDate,
          birth_time: input.birthTime || null,
          gender: input.gender,
          result_markdown: markdown,
          model_used: getModelName(isPro),
        })
        .select('id, created_at')
        .single();

      if (insertError || !analysis) {
        logger.error('Analysis insert error:', insertError);
        return c.json(
          {
            success: false,
            error: {
              code: AnalysisErrorCode.INTERNAL_ERROR,
              message: AnalysisErrorMessages.INTERNAL_ERROR,
            },
          },
          500
        );
      }

      // 4. 쿼터 차감
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ quota: sub.quota - 1 })
        .eq('clerk_user_id', clerkUserId);

      if (updateError) {
        logger.error('Quota update error:', updateError);
        // 쿼터 차감 실패 시 분석 결과 삭제 (롤백)
        await supabase.from('analyses').delete().eq('id', analysis.id);

        return c.json(
          {
            success: false,
            error: {
              code: AnalysisErrorCode.INTERNAL_ERROR,
              message: AnalysisErrorMessages.INTERNAL_ERROR,
            },
          },
          500
        );
      }

      return c.json({
        success: true,
        data: {
          analysisId: analysis.id,
          createdAt: analysis.created_at,
        },
      });
    } catch (error) {
      logger.error('Analysis creation failed:', error);
      return c.json(
        {
          success: false,
          error: {
            code: AnalysisErrorCode.API_ERROR,
            message: AnalysisErrorMessages.API_ERROR,
          },
        },
        500
      );
    }
  }
);

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
