import axios from 'axios';
import { getEnv } from '@/backend/config';

const TOSS_BASE_URL = 'https://api.tosspayments.com/v1';

export class TossPaymentsClient {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  private getAuthHeader() {
    const encoded = Buffer.from(this.secretKey + ':').toString('base64');
    return {
      Authorization: 'Basic ' + encoded,
    };
  }

  async issueBillingKey(authKey: string, customerKey: string): Promise<string> {
    const response = await axios.post(
      TOSS_BASE_URL + '/billing/authorizations/issue',
      { authKey, customerKey },
      { headers: this.getAuthHeader() }
    );
    return response.data.billingKey;
  }

  async chargeBilling(params: {
    billingKey: string;
    amount: number;
    orderName: string;
    customerEmail: string;
    customerName: string;
  }) {
    const response = await axios.post(
      TOSS_BASE_URL + '/billing/' + params.billingKey,
      {
        amount: params.amount,
        orderName: params.orderName,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
      },
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async deleteBillingKey(billingKey: string) {
    await axios.delete(
      TOSS_BASE_URL + '/billing/authorizations/' + billingKey,
      { headers: this.getAuthHeader() }
    );
  }
}

export const tossPayments = new TossPaymentsClient(getEnv().TOSS_SECRET_KEY);
