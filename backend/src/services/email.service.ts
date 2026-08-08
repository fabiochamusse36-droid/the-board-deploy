import { Resend } from "resend";
import { env } from "../config/env.js";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  scheduledAt?: string;
};

export async function sendEmail(input: SendEmailInput) {
  if (!env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY não está configurada no ambiente.",
    );
  }

  const resend = new Resend(env.RESEND_API_KEY);

  const result = await resend.emails.send({
    from: env.MAIL_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    scheduledAt: input.scheduledAt,
  });

  if (result.error) {
    throw new Error(
      result.error.message ||
        "Falha ao enviar email pelo Resend.",
    );
  }

  return {
    id: result.data?.id ?? null,
  };
}
