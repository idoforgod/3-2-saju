import { z } from 'zod';

// 요청 스키마
export const subscribeSchema = z.object({
  billingKey: z.string().min(1, 'BillingKey가 필요합니다'),
  customerKey: z.string().min(1, 'CustomerKey가 필요합니다'),
});

export type SubscribeRequest = z.infer<typeof subscribeSchema>;

// 응답 스키마
export const statusResponseSchema = z.object({
  clerkUserId: z.string(),
  planType: z.enum(['free', 'pro']),
  status: z.enum(['active', 'cancelled', 'terminated']),
  quota: z.number(),
  nextPaymentDate: z.string().nullable(),
  lastPaymentDate: z.string().nullable(),
  billingKey: z.string().nullable(),
  cancelledAt: z.string().nullable(),
});

export type StatusResponse = z.infer<typeof statusResponseSchema>;

export const subscribeResponseSchema = z.object({
  clerkUserId: z.string(),
  planType: z.literal('pro'),
  quota: z.number(),
  nextPaymentDate: z.string(),
  lastPaymentDate: z.string(),
});

export type SubscribeResponse = z.infer<typeof subscribeResponseSchema>;

export const cancelResponseSchema = z.object({
  status: z.literal('cancelled'),
  cancelledAt: z.string(),
  nextPaymentDate: z.string().nullable(),
});

export type CancelResponse = z.infer<typeof cancelResponseSchema>;

export const reactivateResponseSchema = z.object({
  status: z.literal('active'),
  cancelledAt: z.null(),
  nextPaymentDate: z.string().nullable(),
});

export type ReactivateResponse = z.infer<typeof reactivateResponseSchema>;
