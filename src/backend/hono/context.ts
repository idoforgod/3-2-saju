import type { Context } from 'hono';
import type { SupabaseClient } from '@supabase/supabase-js';

export type AppLogger = Pick<Console, 'info' | 'error' | 'warn' | 'debug'>;

export type AppConfig = {
  supabase: {
    url: string;
    serviceRoleKey: string;
  };
};

export type AppVariables = {
  supabase: SupabaseClient;
  logger: AppLogger;
  config: AppConfig;
  clerkUserId?: string; // Clerk JWT 검증 후 설정되는 User ID (선택적)
};

export type AppEnv = {
  Variables: AppVariables;
};

export type AppContext = Context<AppEnv>;

export const contextKeys = {
  supabase: 'supabase',
  logger: 'logger',
  config: 'config',
  clerkUserId: 'clerkUserId',
} as const satisfies Record<keyof AppVariables, keyof AppVariables>;

export const getSupabase = (c: AppContext) =>
  c.get(contextKeys.supabase) as SupabaseClient;

export const getLogger = (c: AppContext) =>
  c.get(contextKeys.logger) as AppLogger;

export const getConfig = (c: AppContext) =>
  c.get(contextKeys.config) as AppConfig;

export const getClerkUserId = (c: AppContext) =>
  c.get(contextKeys.clerkUserId) as string | undefined;
