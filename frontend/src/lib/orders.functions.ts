import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const createSchema = z.object({
  ticket: z.enum(["early-investors", "vip-board"]),

  name: z
    .string()
    .trim()
    .min(2)
    .max(120),

  email: z
    .string()
    .trim()
    .email()
    .max(255),

  phone: z
    .string()
    .trim()
    .min(6)
    .max(30),

  country: z
    .string()
    .trim()
    .max(80)
    .optional()
    .default(""),

  city: z
    .string()
    .trim()
    .max(80)
    .optional()
    .default(""),

  quantity: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .default(1),
});

const getSchema = z.object({
  reference: z
    .string()
    .min(4)
    .max(40),
});

type ApiEnvelope<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error?: {
        code?: string;
        message?: string;
      };
    };

type BackendReservation = {
  reference: string;

  ticketId: string;
  ticketName: string;

  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;

  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;

  country?: string | null;
  city?: string | null;

  status: string;
  paymentStatus: string;
  admissionStatus: string;

  createdAt: string | Date;
  updatedAt?: string | Date;

  payments?: unknown[];
  admissions?: unknown[];
  credentials?: unknown[];
};

function apiBaseUrl() {
  return (
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:4000"
  ).replace(/\/$/, "");
}

async function readApi<T>(
  response: Response,
): Promise<T> {
  let envelope: ApiEnvelope<T> | null = null;

  try {
    envelope =
      (await response.json()) as ApiEnvelope<T>;
  } catch {
    // handled below
  }

  if (
    !response.ok ||
    !envelope ||
    !envelope.ok
  ) {
    const message =
      envelope && !envelope.ok
        ? envelope.error?.message
        : null;

    throw new Error(
      message ||
        "Não foi possível comunicar com o backend do THE BOARD.",
    );
  }

  return envelope.data;
}

/**
 * Creates a real backend reservation.
 *
 * Prices, reference generation, reservation status
 * and payment readiness are controlled by the backend.
 *
 * The frontend only submits buyer/ticket intent.
 */
export const createOrder =
  createServerFn({
    method: "POST",
  })
    .inputValidator(
      (input: unknown) =>
        createSchema.parse(input),
    )
    .handler(async ({ data }) => {
      const response = await fetch(
        `${apiBaseUrl()}/api/reservations`,
        {
          method: "POST",

          headers: {
            accept: "application/json",
            "content-type":
              "application/json",
          },

          body: JSON.stringify({
            ticketId: data.ticket,
            quantity:
              data.quantity ?? 1,

            buyerName:
              data.name,

            buyerEmail:
              data.email,

            buyerPhone:
              data.phone,

            country:
              data.country,

            city:
              data.city,
          }),
        },
      );

      const reservation =
        await readApi<BackendReservation>(
          response,
        );

      return {
        reference:
          reservation.reference,

        reservationStatus:
          reservation.status,

        paymentStatus:
          reservation.paymentStatus,

        admissionStatus:
          reservation.admissionStatus,

        ticketType:
          reservation.ticketName,

        amountMt:
          reservation.totalAmount,
      };
    });

/**
 * Reads the real backend reservation
 * for the confirmation page.
 *
 * Important:
 * paymentStatus and admissionStatus are returned
 * as top-level properties so the UI always uses
 * the real current backend state.
 */
export const getOrder =
  createServerFn({
    method: "GET",
  })
    .inputValidator(
      (input: unknown) =>
        getSchema.parse(input),
    )
    .handler(async ({ data }) => {
      const response = await fetch(
        `${apiBaseUrl()}/api/reservations/${encodeURIComponent(
          data.reference,
        )}`,
        {
          method: "GET",

          headers: {
            accept: "application/json",
            "cache-control": "no-cache",
          },

          cache: "no-store",
        },
      );

      const reservation =
        await readApi<BackendReservation>(
          response,
        );

      return {
        reference:
          reservation.reference,

        /*
         * Modern property names used by
         * the current confirmation page.
         */
        buyerName:
          reservation.buyerName,

        buyerEmail:
          reservation.buyerEmail,

        buyerPhone:
          reservation.buyerPhone,

        ticketName:
          reservation.ticketName,

        quantity:
          reservation.quantity,

        unitPrice:
          reservation.unitPrice,

        totalAmount:
          reservation.totalAmount,

        currency:
          reservation.currency,

        status:
          reservation.status,

        paymentStatus:
          reservation.paymentStatus,

        admissionStatus:
          reservation.admissionStatus,

        createdAt:
          new Date(
            reservation.createdAt,
          ).toISOString(),

        /*
         * Legacy aliases kept temporarily
         * so older routes do not break.
         */
        buyer_name:
          reservation.buyerName,

        buyer_email:
          reservation.buyerEmail,

        buyer_phone:
          reservation.buyerPhone,

        ticket_type:
          reservation.ticketName,

        amount_mt:
          reservation.totalAmount,

        payment_method:
          "external_gateway",

        created_at:
          new Date(
            reservation.createdAt,
          ).toISOString(),

        /*
         * Keep notes for compatibility,
         * but it is no longer the source
         * of truth for payment/admission state.
         */
        notes: JSON.stringify({
          ticketId:
            reservation.ticketId,

          quantity:
            reservation.quantity,

          unitPrice:
            reservation.unitPrice,

          currency:
            reservation.currency,

          paymentStatus:
            reservation.paymentStatus,

          admissionStatus:
            reservation.admissionStatus,
        }),
      };
    });
