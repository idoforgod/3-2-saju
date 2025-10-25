/**
 * 토스페이먼츠 BillingKey 발급 파라미터
 */
export interface IssueBillingKeyParams {
  authKey: string;
  customerKey: string;
}

/**
 * 정기 결제 요청 파라미터
 */
export interface ChargeBillingParams {
  billingKey: string;
  amount: number;
  orderName: string;
  customerEmail: string;
  customerName: string;
}

/**
 * 토스페이먼츠 API 응답 타입
 */
export interface TossPaymentResponse {
  billingKey?: string;
  status?: string;
  [key: string]: any;
}
