export interface BillingKeyParams {
  authKey: string;
  customerKey: string;
}

export interface ChargeBillingParams {
  billingKey: string;
  amount: number;
  orderName: string;
  customerEmail: string;
  customerName: string;
}
