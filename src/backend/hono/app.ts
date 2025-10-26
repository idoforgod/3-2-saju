import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerAnalysisRoutes } from '@/features/analysis/backend/route';
import { registerSubscriptionRoutes } from '@/features/subscription/backend/route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  // development 환경에서는 HMR을 위해 매번 재생성
  if (singletonApp && process.env.NODE_ENV === 'production') {
    return singletonApp;
  }

  const app = new Hono<AppEnv>();

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());

  registerExampleRoutes(app);
  registerAnalysisRoutes(app);
  registerSubscriptionRoutes(app);

  if (process.env.NODE_ENV === 'production') {
    singletonApp = app;
  }

  return app;
};
