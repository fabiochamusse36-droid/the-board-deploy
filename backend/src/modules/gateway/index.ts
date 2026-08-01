import { env } from "../../config/env.js";
import type { GatewayAdapter } from "./gateway.adapter.js";
import { MockGatewayAdapter } from "./mock-gateway.adapter.js";

export function createGatewayAdapter(): GatewayAdapter {
  switch (env.GATEWAY_PROVIDER) {
    case "mock":
      return new MockGatewayAdapter();
    case "paysuite":
    case "gateway_rw":
      // Contract already isolated. Replace with provider implementation when credentials/API are approved.
      return new MockGatewayAdapter();
    default:
      return new MockGatewayAdapter();
  }
}
