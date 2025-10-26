import { z } from 'zod';

/**
 * 구독 정보 조회 응답 스키마
 * GET /api/subscription/status
 */
export const subscriptionStatusResponseSchema = z.object({
  planType: z.enum(['free', 'pro']),
  quota: z.number().int().min(0),
  status: z.enum(['active', 'cancelled', 'terminated']),
  nextPaymentDate: z.string().optional(),
});

export type SubscriptionStatusResponse = z.infer<typeof subscriptionStatusResponseSchema>;

/**
 * 에러 응답 스키마
 */
export const subscriptionErrorResponseSchema = z.object({
  error: z.string(),
});

export type SubscriptionErrorResponse = z.infer<typeof subscriptionErrorResponseSchema>;
