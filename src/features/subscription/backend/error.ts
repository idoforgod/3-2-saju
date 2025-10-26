/**
 * 구독 관련 에러 코드
 */
export const SubscriptionErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type SubscriptionErrorCodeType = typeof SubscriptionErrorCode[keyof typeof SubscriptionErrorCode];

/**
 * 에러 메시지 맵
 */
export const SubscriptionErrorMessages: Record<SubscriptionErrorCodeType, string> = {
  UNAUTHORIZED: 'Unauthorized',
  SUBSCRIPTION_NOT_FOUND: 'Subscription not found',
  INTERNAL_ERROR: 'Internal server error',
};
