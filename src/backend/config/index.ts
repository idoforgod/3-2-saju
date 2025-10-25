import { z } from 'zod';
import type { AppConfig } from '@/backend/hono/context';

const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),

  // Gemini
  GEMINI_API_KEY: z.string().min(1),

  // Toss Payments
  TOSS_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_TOSS_CLIENT_KEY: z.string().min(1),

  // Cron
  CRON_SECRET_TOKEN: z.string().min(1),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

let cachedConfig: AppConfig | null = null;

export const getAppConfig = (): AppConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const parsed = envSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    TOSS_SECRET_KEY: process.env.TOSS_SECRET_KEY,
    NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
    CRON_SECRET_TOKEN: process.env.CRON_SECRET_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    const messages = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'config'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid backend configuration: ${messages}`);
  }

  cachedConfig = {
    supabase: {
      url: parsed.data.SUPABASE_URL,
      serviceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
    },
  } satisfies AppConfig;

  return cachedConfig;
};
