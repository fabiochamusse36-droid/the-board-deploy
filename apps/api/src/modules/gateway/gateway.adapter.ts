export type GatewayCustomer = {
  name: string;
  email: string;
  phone: string;
};

export type CreatePaymentSessionInput = {
  merchantReference: string;
  amount: number;
  currency: "MZN";
  description: string;
  customer: GatewayCustomer;
  metadata: Record<string, string | number | boolean>;
  returnUrl: string;
  callbackUrl: string;
};

export type PaymentSession = {
  paymentSessionId: string;
  checkoutUrl: string;
  status: "payment_session_created" | "payment_pending";
  expiresAt: string;
};

export interface GatewayAdapter {
  createPaymentSession(input: CreatePaymentSessionInput): Promise<PaymentSession>;
  getPaymentStatus(paymentSessionId: string): Promise<{
    paymentSessionId: string;
    merchantReference: string;
    status: "pending" | "processing" | "confirmed" | "failed" | "cancelled" | "expired";
    amount: number;
    currency: "MZN";
    paidAt: string | null;
  }>;
}
