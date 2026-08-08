import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  tier: z.enum(["master", "gold", "silver", "custom"]),

  company: z
    .string()
    .trim()
    .min(2, "Informe a empresa.")
    .max(160),

  contact_name: z
    .string()
    .trim()
    .min(2, "Informe a pessoa de contacto.")
    .max(120),

  email: z
    .string()
    .trim()
    .email("Informe um email válido.")
    .max(255),

  phone: z
    .string()
    .trim()
    .min(6, "Informe um telefone válido.")
    .max(30),

  message: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal("")),
});

type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  error?: {
    code?: string;
    message?: string;
  };
};

type ApiEnvelope<T> =
  | ApiSuccess<T>
  | ApiFailure;

type BackendSponsorInquiry = {
  reference: string;
  status: string;
  dossierStatus: string;
  createdAt: string;
};

function apiBaseUrl() {
  return (
    import.meta.env.VITE_API_BASE_URL ??
    "http://localhost:4000"
  ).replace(/\/$/, "");
}

async function readApi<T>(
  response: Response,
): Promise<T> {
  let payload: ApiEnvelope<T> | null = null;

  try {
    payload =
      (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new Error(
      "Resposta inválida do servidor.",
    );
  }

  if (!response.ok || !payload.ok) {
    const message =
      payload && !payload.ok
        ? payload.error?.message
        : null;

    throw new Error(
      message ||
        "Não foi possível enviar o pedido de parceria.",
    );
  }

  return payload.data;
}

export const createSponsorInquiry =
  createServerFn({
    method: "POST",
  })
    .inputValidator(
      (input: unknown) =>
        schema.parse(input),
    )
    .handler(async ({ data }) => {
      const response = await fetch(
        `${apiBaseUrl()}/api/sponsors/inquiries`,
        {
          method: "POST",

          headers: {
            accept: "application/json",
            "content-type":
              "application/json",
          },

          body: JSON.stringify({
            tier: data.tier,
            company: data.company,
            contactName:
              data.contact_name,
            email: data.email,
            phone: data.phone,
            message:
              data.message || undefined,
          }),
        },
      );

      const inquiry =
        await readApi<BackendSponsorInquiry>(
          response,
        );

      return {
        ok: true as const,

        inquiryReference:
          inquiry.reference,

        status:
          inquiry.status,

        dossierStatus:
          inquiry.dossierStatus,

        createdAt:
          inquiry.createdAt,

        tier:
          data.tier,
      };
    });
