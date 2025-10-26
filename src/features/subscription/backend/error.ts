export const SUBSCRIPTION_ERROR_CODES = {
  SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
  ALREADY_SUBSCRIBED: 'ALREADY_SUBSCRIBED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  UPDATE_FAILED: 'UPDATE_FAILED',
  CANCEL_FAILED: 'CANCEL_FAILED',
  REACTIVATE_FAILED: 'REACTIVATE_FAILED',
  NOT_ACTIVE_SUBSCRIPTION: 'NOT_ACTIVE_SUBSCRIPTION',
  NOT_CANCELLED_SUBSCRIPTION: 'NOT_CANCELLED_SUBSCRIPTION',
  REACTIVATE_EXPIRED: 'REACTIVATE_EXPIRED',
} as const;

export type SubscriptionErrorCode =
  (typeof SUBSCRIPTION_ERROR_CODES)[keyof typeof SUBSCRIPTION_ERROR_CODES];

export class SubscriptionError extends Error {
  constructor(
    public code: SubscriptionErrorCode,
    message?: string
  ) {
    super(message || code);
    this.name = 'SubscriptionError';
  }
}

export const SUBSCRIPTION_ERROR_MESSAGES: Record<SubscriptionErrorCode, string> = {
  SUBSCRIPTION_NOT_FOUND: '구독 정보를 찾을 수 없습니다',
  ALREADY_SUBSCRIBED: '이미 Pro 구독 중입니다',
  PAYMENT_FAILED: '결제에 실패했습니다. 다시 시도해주세요',
  UPDATE_FAILED: '구독 정보 업데이트에 실패했습니다',
  CANCEL_FAILED: '구독 취소에 실패했습니다',
  REACTIVATE_FAILED: '구독 재활성화에 실패했습니다',
  NOT_ACTIVE_SUBSCRIPTION: '활성 구독이 아닙니다',
  NOT_CANCELLED_SUBSCRIPTION: '취소된 구독이 아닙니다',
  REACTIVATE_EXPIRED: '구독 기간이 만료되어 재활성화할 수 없습니다',
};
