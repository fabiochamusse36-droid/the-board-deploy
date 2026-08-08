import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = new Resend(env.RESEND_API_KEY);

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  scheduledAt?: string;
};

export async function sendEmail(input: SendEmailInput) {
  const result = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    scheduledAt: input.scheduledAt,
  });

  if (result.error) {
    throw new Error(
      result.error.message || "Falha ao enviar email pelo Resend.",
    );
  }

  return {
    id: result.data?.id ?? null,
  };
}
