import axios from 'axios';
import type {
  IssueBillingKeyParams,
  ChargeBillingParams,
  TossPaymentResponse,
} from './types';

const TOSS_BASE_URL = 'https://api.tosspayments.com/v1';

/**
 * 토스페이먼츠 API 클라이언트
 * BillingKey 발급, 정기 결제, BillingKey 삭제 기능 제공
 */
export class TossPaymentsClient {
  private secretKey: string;

  constructor(secretKey?: string) {
    this.secretKey = secretKey || process.env.TOSS_SECRET_KEY || '';

    if (!this.secretKey) {
      throw new Error('TOSS_SECRET_KEY is not configured');
    }
  }

  /**
   * Basic Auth 헤더 생성
   * @returns Authorization 헤더 객체
   */
  private getAuthHeader() {
    const encoded = Buffer.from(this.secretKey + ':').toString('base64');
    return {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * BillingKey 발급
   * @param params - authKey, customerKey
   * @returns BillingKey 문자열
   */
  async issueBillingKey(
    params: IssueBillingKeyParams
  ): Promise<string> {
    try {
      const response = await axios.post<TossPaymentResponse>(
        `${TOSS_BASE_URL}/billing/authorizations/issue`,
        {
          authKey: params.authKey,
          customerKey: params.customerKey,
        },
        {
          headers: this.getAuthHeader(),
        }
      );

      if (!response.data.billingKey) {
        throw new Error('BillingKey not returned from Toss Payments API');
      }

      return response.data.billingKey;
    } catch (error: any) {
      console.error('Failed to issue BillingKey:', error);
      throw new Error(
        error.response?.data?.message || '결제 수단 등록에 실패했습니다.'
      );
    }
  }

  /**
   * BillingKey를 사용하여 정기 결제 요청
   * @param params - billingKey, amount, orderName, customerEmail, customerName
   * @returns 결제 응답 데이터
   */
  async chargeBilling(
    params: ChargeBillingParams
  ): Promise<TossPaymentResponse> {
    try {
      const response = await axios.post<TossPaymentResponse>(
        `${TOSS_BASE_URL}/billing/${params.billingKey}`,
        {
          amount: params.amount,
          orderName: params.orderName,
          customerEmail: params.customerEmail,
          customerName: params.customerName,
        },
        {
          headers: this.getAuthHeader(),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Failed to charge billing:', error);
      throw new Error(
        error.response?.data?.message || '결제에 실패했습니다.'
      );
    }
  }

  /**
   * BillingKey 삭제 (구독 해지 시 사용)
   * @param billingKey - 삭제할 BillingKey
   */
  async deleteBillingKey(billingKey: string): Promise<void> {
    try {
      await axios.delete(
        `${TOSS_BASE_URL}/billing/authorizations/${billingKey}`,
        {
          headers: this.getAuthHeader(),
        }
      );
    } catch (error: any) {
      console.error('Failed to delete BillingKey:', error);
      throw new Error(
        error.response?.data?.message || '결제 수단 삭제에 실패했습니다.'
      );
    }
  }
}

/**
 * 싱글톤 토스페이먼츠 클라이언트 인스턴스
 */
export const tossPayments = new TossPaymentsClient();
