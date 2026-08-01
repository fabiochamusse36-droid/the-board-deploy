import { env } from "../../config/env.js";
import { reference } from "../../shared/http.js";
import type { CreatePaymentSessionInput, GatewayAdapter, PaymentSession } from "./gateway.adapter.js";

export class MockGatewayAdapter implements GatewayAdapter {
  async createPaymentSession(input: CreatePaymentSessionInput): Promise<PaymentSession> {
    const paymentSessionId = reference("PAY");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    return {
      paymentSessionId,
      checkoutUrl: `${env.WEB_APP_URL}/confirmacao/${input.merchantReference}?paymentSessionId=${paymentSessionId}`,
      status: "payment_session_created",
      expiresAt,
    };
  }

  async getPaymentStatus(paymentSessionId: string) {
    return {
      paymentSessionId,
      merchantReference: "THB-PENDING",
      status: "pending" as const,
      amount: 0,
      currency: "MZN" as const,
      paidAt: null,
    };
  }
}
