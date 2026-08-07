import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getOrder } from "@/lib/orders.functions";

type Order = Awaited<ReturnType<typeof getOrder>>;

export const Route = createFileRoute("/confirmacao/$reference")({
  head: () => ({
    meta: [
      {
        title: "Estado da Reserva — THE BOARD 2026",
      },
      {
        name: "description",
        content:
          "Acompanhe o estado da sua reserva no THE BOARD Big Players Forum 2026.",
      },
    ],
  }),

  component: Confirmacao,

  errorComponent: ({ error, reset }) => {
    const router = useRouter();

    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-background text-foreground">
        <div className="max-w-md">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
            Estado da reserva
          </p>

          <p className="text-muted-foreground mb-6">
            {error.message}
          </p>

          <button
            onClick={() => {
              reset();
              router.invalidate();
            }}
            className="px-6 py-3 border border-gold text-gold text-xs tracking-widest uppercase"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  },

  notFoundComponent: () => (
    <div className="p-10">
      Reserva não encontrada
    </div>
  ),
});

type Stage =
  | "reservation_created"
  | "payment_pending"
  | "payment_processing"
  | "payment_confirmed"
  | "payment_failed"
  | "payment_cancelled";

function Confirmacao() {
  const { reference } = Route.useParams();
  const navigate = useNavigate();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [showFallback, setShowFallback] =
    useState(false);

  async function loadOrder() {
    try {
      const currentOrder = await getOrder({
        data: { reference },
      });

      setOrder(currentOrder);
      setError(null);

      return currentOrder;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível consultar a reserva.",
      );

      return null;
    } finally {
      setLoading(false);
    }
  }

  /*
   * Primeira leitura da reserva real.
   */
  useEffect(() => {
    let active = true;

    getOrder({
      data: { reference },
    })
      .then((currentOrder) => {
        if (!active) return;

        setOrder(currentOrder);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível consultar a reserva.",
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [reference]);

  /*
   * Polling real.
   *
   * Enquanto o pagamento não estiver confirmado,
   * consultamos novamente o backend a cada 5 segundos.
   *
   * Não existe qualquer confirmação local/mock.
   */
  useEffect(() => {
    if (!order) return;

    const paymentStatus =
      readPaymentStatus(order);

    if (
      paymentStatus === "payment_confirmed" ||
      paymentStatus === "payment_failed" ||
      paymentStatus === "payment_cancelled"
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      void loadOrder();
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [order, reference]);

  const stage = getStage(order);

  /*
   * Só avançamos para admissão quando o BACKEND
   * confirmar efetivamente o pagamento.
   */
  useEffect(() => {
    if (stage !== "payment_confirmed") {
      setShowFallback(false);
      return;
    }

    const redirect = window.setTimeout(() => {
      navigate({
        to: "/admissao",
        search: { reference },
      });
    }, 1800);

    const fallback = window.setTimeout(() => {
      setShowFallback(true);
    }, 3500);

    return () => {
      window.clearTimeout(redirect);
      window.clearTimeout(fallback);
    };
  }, [stage, reference, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-xs tracking-widest uppercase">
        A carregar estado da reserva…
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-background text-foreground">
        <div className="max-w-md">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
            Reserva
          </p>

          <h1 className="font-display text-4xl mb-4">
            Não foi possível carregar
          </h1>

          <p className="text-destructive mb-8">
            {error ??
              "Reserva não encontrada."}
          </p>

          <button
            type="button"
            onClick={() => void loadOrder()}
            className="inline-block mr-3 px-6 py-3 border border-gold text-gold text-xs tracking-widest uppercase"
          >
            Tentar novamente
          </button>

          <Link
            to="/"
            className="inline-block px-6 py-3 border border-border/60 text-muted-foreground text-xs tracking-widest uppercase"
          >
            Início
          </Link>
        </div>
      </div>
    );
  }

  const quantity =
    readQuantity(order) ?? 1;

  const ticketName =
    readTicketName(order);

  const total =
    readAmount(order);

  const buyerName =
    readBuyerName(order);

  const buyerEmail =
    readBuyerEmail(order);

  const buyerPhone =
    readBuyerPhone(order);

  const content =
    stageCopy(stage);

  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Link
            to="/"
            className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-gold"
          >
            ← Início
          </Link>
        </div>

        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
            Estado da reserva
          </p>

          <h1 className="font-display text-4xl md:text-5xl">
            Confirmação
          </h1>

          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Acompanhe o estado real do pagamento associado
            à sua reserva.
          </p>
        </div>

        <Journey stage={stage} />

        <div className="text-center mt-12 mb-10 border border-gold/40 bg-gradient-to-b from-card to-background p-8 md:p-10 shadow-gold">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-gold mb-6">
            {stage === "payment_confirmed" ? (
              <span
                className="text-gold font-display text-2xl"
                aria-hidden="true"
              >
                ✓
              </span>
            ) : stage === "payment_failed" ||
              stage === "payment_cancelled" ? (
              <span
                className="text-destructive font-display text-2xl"
                aria-hidden="true"
              >
                !
              </span>
            ) : (
              <span
                className="block w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />
            )}
          </div>

          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
            {content.eyebrow}
          </p>

          <h2 className="font-display text-3xl md:text-4xl">
            {content.title}
          </h2>

          <p
            aria-live="polite"
            className="mt-4 text-muted-foreground max-w-md mx-auto"
          >
            {content.body}
          </p>
        </div>

        <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-6 mb-8">
          <section className="border border-gold/40 bg-background/70 p-6 md:p-8">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              Referência da reserva
            </p>

            <p className="font-display text-3xl text-gradient-gold mt-3 tracking-widest break-all">
              {readReference(order, reference)}
            </p>

            <div className="hairline-gold my-6 max-w-[80px]" />

            <ReviewRow
              label="Acesso"
              value={ticketName}
            />

            <ReviewRow
              label="Quantidade"
              value={String(quantity)}
            />

            <ReviewRow
              label="Total"
              value={`${total.toLocaleString(
                "pt-PT",
              )} MT`}
              strong
            />

            <ReviewRow
              label="Pagamento"
              value={paymentStatusLabel(
                readPaymentStatus(order),
              )}
              strong={
                stage ===
                "payment_confirmed"
              }
            />
          </section>

          <section className="border border-border/40 bg-card/35 p-6 md:p-8">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
              Participante
            </p>

            {buyerName ? (
              <ReviewRow
                label="Nome"
                value={buyerName}
              />
            ) : null}

            {buyerEmail ? (
              <ReviewRow
                label="Email"
                value={buyerEmail}
              />
            ) : null}

            {buyerPhone ? (
              <ReviewRow
                label="Telefone"
                value={buyerPhone}
              />
            ) : null}
          </section>
        </div>

        <div className="border border-border/40 bg-background/60 p-5 mb-8 text-xs text-muted-foreground leading-relaxed">
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
            Próxima etapa
          </p>

          {stage === "payment_confirmed"
            ? "O pagamento foi confirmado pelo backend. O Formulário de Admissão Executiva está disponível."
            : "O sistema continuará a consultar o estado real da reserva. A admissão só será liberada depois da confirmação do pagamento pelo backend."}
        </div>

        {stage ===
          "payment_confirmed" &&
        showFallback ? (
          <div className="text-center mb-10">
            <Link
              to="/admissao"
              search={{ reference }}
              className="inline-block px-8 py-4 bg-gradient-gold text-primary-foreground text-[10px] tracking-widest uppercase shadow-gold hover:opacity-90 transition"
            >
              Continuar para admissão
            </Link>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3 justify-center text-xs tracking-widest uppercase">
          {stage !==
          "payment_confirmed" ? (
            <button
              type="button"
              onClick={() =>
                void loadOrder()
              }
              className="px-5 py-3 border border-gold text-gold hover:bg-gold/10 transition text-center"
            >
              Atualizar estado
            </button>
          ) : null}

          <Link
            to="/"
            className="px-5 py-3 border border-border/60 text-muted-foreground hover:text-gold hover:border-gold/40 transition text-center"
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm border-b border-border/20 last:border-b-0">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span
        className={`text-right break-words ${
          strong
            ? "font-display text-gold"
            : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function asRecord(
  value: unknown,
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object"
  ) {
    return value as Record<
      string,
      unknown
    >;
  }

  return {};
}

function stringValue(
  record: Record<string, unknown>,
  ...keys: string[]
) {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value;
    }
  }

  return "";
}

function numberValue(
  record: Record<string, unknown>,
  ...keys: string[]
) {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }
  }

  return 0;
}

function readReference(
  order: Order,
  fallback: string,
) {
  const data = asRecord(order);

  return (
    stringValue(
      data,
      "reference",
    ) || fallback
  );
}

function readTicketName(order: Order) {
  const data = asRecord(order);

  return (
    stringValue(
      data,
      "ticketName",
      "ticket_name",
      "ticket_type",
    ) || "Acesso THE BOARD"
  );
}

function readAmount(order: Order) {
  const data = asRecord(order);

  return numberValue(
    data,
    "totalAmount",
    "total_amount",
    "amount",
    "amount_mt",
  );
}

function readBuyerName(order: Order) {
  const data = asRecord(order);

  return stringValue(
    data,
    "buyerName",
    "buyer_name",
  );
}

function readBuyerEmail(order: Order) {
  const data = asRecord(order);

  return stringValue(
    data,
    "buyerEmail",
    "buyer_email",
  );
}

function readBuyerPhone(order: Order) {
  const data = asRecord(order);

  return stringValue(
    data,
    "buyerPhone",
    "buyer_phone",
  );
}

function readQuantity(
  order: Order,
): number | null {
  const data = asRecord(order);

  const direct = numberValue(
    data,
    "quantity",
  );

  if (direct > 0) {
    return direct;
  }

  const notes = data.notes;

  if (typeof notes !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(
      notes,
    ) as Record<string, unknown>;

    const value = parsed.quantity;

    return typeof value === "number"
      ? value
      : null;
  } catch {
    return null;
  }
}

function readPaymentStatus(
  order: Order,
) {
  const data = asRecord(order);

  return (
    stringValue(
      data,
      "paymentStatus",
      "payment_status",
    ) || "payment_pending"
  );
}

function getStage(
  order: Order | null,
): Stage {
  if (!order) {
    return "reservation_created";
  }

  const status =
    readPaymentStatus(order);

  switch (status) {
    case "payment_confirmed":
      return "payment_confirmed";

    case "payment_processing":
      return "payment_processing";

    case "payment_failed":
      return "payment_failed";

    case "payment_cancelled":
    case "payment_expired":
      return "payment_cancelled";

    case "payment_started":
    case "payment_session_created":
    case "payment_pending":
      return "payment_pending";

    default:
      return "reservation_created";
  }
}

function paymentStatusLabel(
  status: string,
) {
  const labels: Record<
    string,
    string
  > = {
    payment_started:
      "Pagamento iniciado",
    payment_session_created:
      "Sessão criada",
    payment_pending:
      "Pagamento pendente",
    payment_processing:
      "Em processamento",
    payment_confirmed:
      "Pagamento confirmado",
    payment_failed:
      "Pagamento falhado",
    payment_cancelled:
      "Pagamento cancelado",
    payment_expired:
      "Pagamento expirado",
  };

  return labels[status] ?? status;
}

function stageCopy(
  stage: Stage,
): {
  eyebrow: string;
  title: string;
  body: string;
} {
  switch (stage) {
    case "reservation_created":
      return {
        eyebrow:
          "Reserva criada",
        title:
          "Reserva registada",
        body:
          "A sua reserva existe no sistema. Aguardamos o início ou confirmação do processo financeiro.",
      };

    case "payment_pending":
      return {
        eyebrow:
          "Pagamento",
        title:
          "Aguardando confirmação",
        body:
          "O pagamento ainda não foi confirmado pelo backend.",
      };

    case "payment_processing":
      return {
        eyebrow:
          "Validação em curso",
        title:
          "Pagamento em processamento",
        body:
          "O backend recebeu o processo de pagamento e aguarda a confirmação definitiva.",
      };

    case "payment_confirmed":
      return {
        eyebrow:
          "Pagamento confirmado",
        title:
          "Admissão disponível",
        body:
          "Pagamento confirmado pelo sistema. A encaminhar para o Formulário de Admissão Executiva.",
      };

    case "payment_failed":
      return {
        eyebrow:
          "Pagamento",
        title:
          "Pagamento não concluído",
        body:
          "O pagamento não foi confirmado. Pode tentar novamente quando o fluxo de pagamento estiver disponível.",
      };

    case "payment_cancelled":
      return {
        eyebrow:
          "Pagamento",
        title:
          "Pagamento cancelado",
        body:
          "O processo de pagamento foi cancelado ou expirou.",
      };
  }
}

type StepStatus =
  | "done"
  | "active"
  | "locked"
  | "future";

function Journey({
  stage,
}: {
  stage: Stage;
}) {
  const paymentDone =
    stage ===
    "payment_confirmed";

  const paymentProblem =
    stage === "payment_failed" ||
    stage ===
      "payment_cancelled";

  const steps: {
    label: string;
    state: StepStatus;
    hint: string;
  }[] = [
    {
      label: "Reserva",
      state: "done",
      hint: "concluída",
    },
    {
      label: "Pagamento",
      state: paymentDone
        ? "done"
        : "active",
      hint: paymentDone
        ? "concluído"
        : paymentProblem
          ? "requer atenção"
          : "aguardando",
    },
    {
      label: "Admissão",
      state: paymentDone
        ? "active"
        : "locked",
      hint: paymentDone
        ? "disponível"
        : "bloqueada",
    },
    {
      label: "Credencial",
      state: "future",
      hint: "futura",
    },
  ];

  return (
    <ol className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
      {steps.map(
        (step, index) => (
          <li
            key={step.label}
            className="flex flex-col items-center"
          >
            <span
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-display ${
                step.state === "done"
                  ? "border-gold text-gold bg-gold/10"
                  : step.state ===
                      "active"
                    ? "border-gold text-gold"
                    : "border-border/60 text-muted-foreground"
              }`}
              aria-hidden="true"
            >
              {step.state === "done"
                ? "✓"
                : index + 1}
            </span>

            <span
              className={`mt-2 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase ${
                step.state ===
                  "locked" ||
                step.state ===
                  "future"
                  ? "text-muted-foreground"
                  : "text-gold"
              }`}
            >
              {step.label}
            </span>

            <span className="mt-1 text-[9px] tracking-[0.15em] uppercase text-muted-foreground/70 hidden sm:block">
              {step.hint}
            </span>
          </li>
        ),
      )}
    </ol>
  );
}
