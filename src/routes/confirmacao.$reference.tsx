import { createFileRoute, Link, useRouter, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getOrder } from "@/lib/orders.functions";
import { confirmPaymentMock, getReservation, type MockReservation } from "@/lib/reservations.mock";

type Order = Awaited<ReturnType<typeof getOrder>>;

export const Route = createFileRoute("/confirmacao/$reference")({
  head: () => ({
    meta: [
      { title: "Estado da Reserva — THE BOARD 2026" },
      {
        name: "description",
        content: "Acompanhe o estado da sua reserva no THE BOARD Big Players Forum 2026.",
      },
    ],
  }),
  component: Confirmacao,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Erro</p>
          <p className="text-muted-foreground mb-6">{error.message}</p>
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
  notFoundComponent: () => <div className="p-10">Reserva não encontrada</div>,
});

// Internal state machine. This represents the temporary return/status flow until the real backend confirms payments.
type Stage = "reservation_created" | "payment_preparing" | "payment_processing" | "payment_confirmed";

function Confirmacao() {
  const { reference } = Route.useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<MockReservation | null>(null);
  const [stage, setStage] = useState<Stage>("reservation_created");
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    let active = true;
    getOrder({ data: { reference } })
      .then((o) => active && setOrder(o))
      .catch((e) => active && setError(e instanceof Error ? e.message : "Erro"));
    const { data } = getReservation(reference);
    if (active) setReservation(data);
    return () => {
      active = false;
    };
  }, [reference]);

  useEffect(() => {
    if (!order) return;
    if (reservation?.paymentStatus === "payment_confirmed") {
      setStage("payment_confirmed");
      return;
    }
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setStage("payment_preparing"), 900));
    timers.push(window.setTimeout(() => setStage("payment_processing"), 2100));
    timers.push(
      window.setTimeout(() => {
        const { data } = confirmPaymentMock(reference);
        if (data) setReservation(data);
        setStage("payment_confirmed");
      }, 4600),
    );
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [order, reservation?.paymentStatus, reference]);

  useEffect(() => {
    if (stage !== "payment_confirmed") return;
    const redirect = window.setTimeout(() => {
      navigate({ to: "/admissao", search: { reference } });
    }, 1100);
    const fallback = window.setTimeout(() => setShowFallback(true), 2500);
    return () => {
      window.clearTimeout(redirect);
      window.clearTimeout(fallback);
    };
  }, [stage, reference, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-destructive mb-6">{error}</p>
          <Link to="/" className="px-6 py-3 border border-gold text-gold text-xs tracking-widest uppercase">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-xs tracking-widest uppercase">
        A carregar…
      </div>
    );
  }

  const quantity = reservation?.quantity ?? readQuantityFromNotes(order.notes) ?? 1;
  const ticketName = reservation?.ticketName ?? order.ticket_type;
  const total = reservation?.amount ?? order.amount_mt;
  const buyerName = reservation?.buyerName ?? order.buyer_name;
  const buyerEmail = reservation?.buyerEmail ?? order.buyer_email;
  const buyerPhone = reservation?.buyerPhone ?? order.buyer_phone;
  const content = stageCopy(stage);

  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <Link to="/" className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-gold">
            ← Início
          </Link>
        </div>

        <Journey stage={stage} />

        <div className="text-center mt-12 mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-gold mb-6">
            {stage === "payment_confirmed" ? (
              <span className="text-gold font-display text-2xl" aria-hidden="true">✓</span>
            ) : (
              <span className="block w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            )}
          </div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">{content.eyebrow}</p>
          <h1 className="font-display text-3xl md:text-4xl">{content.title}</h1>
          <p aria-live="polite" className="mt-4 text-muted-foreground max-w-md mx-auto">
            {content.body}
          </p>
        </div>

        <div className="border border-gold/60 bg-gradient-to-b from-card to-background p-8 md:p-10 mb-8 text-center shadow-gold">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Referência da reserva</p>
          <p className="font-display text-3xl md:text-4xl text-gradient-gold mt-3 tracking-widest break-all">{order.reference}</p>
          <div className="hairline-gold mx-auto my-6 max-w-[80px]" />
          <dl className="grid grid-cols-2 gap-y-3 text-sm text-left max-w-sm mx-auto">
            <dt className="text-muted-foreground">Acesso</dt>
            <dd className="text-right">{ticketName}</dd>
            <dt className="text-muted-foreground">Quantidade</dt>
            <dd className="text-right">{quantity}</dd>
            <dt className="text-muted-foreground">Total</dt>
            <dd className="text-right font-display">{total.toLocaleString("pt-PT")} MT</dd>
          </dl>
        </div>

        {stage === "payment_confirmed" && showFallback && (
          <div className="text-center mb-10">
            <Link
              to="/admissao"
              search={{ reference }}
              className="inline-block px-6 py-3 border border-gold text-gold text-[10px] tracking-widest uppercase hover:bg-gold/10 transition"
            >
              Continuar para admissão
            </Link>
          </div>
        )}

        {(buyerName || buyerEmail || buyerPhone) && (
          <div className="text-sm space-y-2 mb-10 px-2">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Dados da reserva</p>
            {buyerName && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Nome</span>
                <span className="text-right">{buyerName}</span>
              </div>
            )}
            {buyerEmail && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Email</span>
                <span className="text-right break-all">{buyerEmail}</span>
              </div>
            )}
            {buyerPhone && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Telefone</span>
                <span className="text-right">{buyerPhone}</span>
              </div>
            )}
          </div>
        )}

        <div className="border border-border/40 bg-background/60 p-5 mb-10 text-xs text-muted-foreground leading-relaxed">
          A admissão final está sujeita à validação executiva. Caso o perfil não seja elegível para a categoria solicitada, o valor será reembolsado conforme a política do evento.
        </div>

        <div className="flex justify-center text-xs tracking-widest uppercase">
          <Link to="/" className="px-5 py-3 border border-border/60 text-muted-foreground hover:text-gold hover:border-gold/40 transition text-center">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function readQuantityFromNotes(notes: unknown): number | null {
  if (typeof notes !== "string") return null;
  try {
    const parsed = JSON.parse(notes);
    if (typeof parsed?.quantity === "number") return parsed.quantity;
    return null;
  } catch {
    return null;
  }
}

function stageCopy(stage: Stage): { eyebrow: string; title: string; body: string } {
  switch (stage) {
    case "reservation_created":
      return { eyebrow: "Reserva criada", title: "Reserva criada", body: "A sua reserva foi registada com sucesso." };
    case "payment_preparing":
      return { eyebrow: "Preparando pagamento", title: "Preparando pagamento", body: "A preparar a continuação segura do pagamento." };
    case "payment_processing":
      return { eyebrow: "Aguardando confirmação", title: "Aguardando confirmação", body: "Aguardamos a confirmação do pagamento associado a esta reserva." };
    case "payment_confirmed":
      return { eyebrow: "Pagamento confirmado", title: "Pagamento confirmado", body: "Pagamento validado. A encaminhar para o Formulário de Admissão Executiva." };
  }
}

type StepStatus = "done" | "active" | "locked" | "future";

function Journey({ stage }: { stage: Stage }) {
  const paymentDone = stage === "payment_confirmed";
  const admissionActive = stage === "payment_confirmed";

  const steps: { label: string; state: StepStatus; hint: string }[] = [
    { label: "Reserva", state: "done", hint: "concluída" },
    { label: "Pagamento", state: paymentDone ? "done" : "active", hint: paymentDone ? "concluído" : "em curso" },
    { label: "Admissão", state: admissionActive ? "active" : "locked", hint: admissionActive ? "disponível" : "bloqueada" },
    { label: "Credencial", state: "future", hint: "futura" },
  ];

  return (
    <ol className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
      {steps.map((s, i) => (
        <li key={s.label} className="flex flex-col items-center">
          <span
            className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-display ${
              s.state === "done" ? "border-gold text-gold bg-gold/10" : s.state === "active" ? "border-gold text-gold" : "border-border/60 text-muted-foreground"
            }`}
            aria-hidden="true"
          >
            {s.state === "done" ? "✓" : i + 1}
          </span>
          <span className={`mt-2 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase ${s.state === "locked" || s.state === "future" ? "text-muted-foreground" : "text-gold"}`}>
            {s.label}
          </span>
          <span className="mt-1 text-[9px] tracking-[0.15em] uppercase text-muted-foreground/70 hidden sm:block">{s.hint}</span>
        </li>
      ))}
    </ol>
  );
}
