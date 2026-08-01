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
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-background text-foreground">
        <div className="max-w-md">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Estado da reserva</p>
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
    timers.push(window.setTimeout(() => setStage("payment_processing"), 2300));
    timers.push(
      window.setTimeout(() => {
        const { data } = confirmPaymentMock(reference);
        if (data) setReservation(data);
        setStage("payment_confirmed");
      }, 5200),
    );
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [order, reservation?.paymentStatus, reference]);

  useEffect(() => {
    if (stage !== "payment_confirmed") return;
    const redirect = window.setTimeout(() => {
      navigate({ to: "/admissao", search: { reference } });
    }, 1300);
    const fallback = window.setTimeout(() => setShowFallback(true), 3200);
    return () => {
      window.clearTimeout(redirect);
      window.clearTimeout(fallback);
    };
  }, [stage, reference, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-background text-foreground">
        <div className="max-w-md">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Reserva</p>
          <h1 className="font-display text-4xl mb-4">Não foi possível carregar</h1>
          <p className="text-destructive mb-8">{error}</p>
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
        A carregar estado da reserva…
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
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Link to="/" className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-gold">
            ← Início
          </Link>
        </div>

        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Estado da reserva</p>
          <h1 className="font-display text-4xl md:text-5xl">Confirmação</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Acompanhe a validação do pagamento associado à sua reserva antes da abertura do Formulário de Admissão Executiva.
          </p>
        </div>

        <Journey stage={stage} />

        <div className="text-center mt-12 mb-10 border border-gold/40 bg-gradient-to-b from-card to-background p-8 md:p-10 shadow-gold">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-gold mb-6">
            {stage === "payment_confirmed" ? (
              <span className="text-gold font-display text-2xl" aria-hidden="true">✓</span>
            ) : (
              <span className="block w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            )}
          </div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">{content.eyebrow}</p>
          <h2 className="font-display text-3xl md:text-4xl">{content.title}</h2>
          <p aria-live="polite" className="mt-4 text-muted-foreground max-w-md mx-auto">
            {content.body}
          </p>
        </div>

        <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-6 mb-8">
          <section className="border border-gold/40 bg-background/70 p-6 md:p-8">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Referência da reserva</p>
            <p className="font-display text-3xl text-gradient-gold mt-3 tracking-widest break-all">{order.reference}</p>
            <div className="hairline-gold my-6 max-w-[80px]" />
            <ReviewRow label="Acesso" value={ticketName} />
            <ReviewRow label="Quantidade" value={String(quantity)} />
            <ReviewRow label="Total" value={`${total.toLocaleString("pt-PT")} MT`} strong />
          </section>

          <section className="border border-border/40 bg-card/35 p-6 md:p-8">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-5">Participante</p>
            {buyerName && <ReviewRow label="Nome" value={buyerName} />}
            {buyerEmail && <ReviewRow label="Email" value={buyerEmail} />}
            {buyerPhone && <ReviewRow label="Telefone" value={buyerPhone} />}
          </section>
        </div>

        <div className="border border-border/40 bg-background/60 p-5 mb-8 text-xs text-muted-foreground leading-relaxed">
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">Próxima etapa</p>
          Após a validação do pagamento, o formulário de admissão será disponibilizado automaticamente. A admissão final permanece sujeita à análise executiva do THE BOARD.
        </div>

        {stage === "payment_confirmed" && showFallback && (
          <div className="text-center mb-10">
            <Link
              to="/admissao"
              search={{ reference }}
              className="inline-block px-8 py-4 bg-gradient-gold text-primary-foreground text-[10px] tracking-widest uppercase shadow-gold hover:opacity-90 transition"
            >
              Continuar para admissão
            </Link>
          </div>
        )}

        <div className="flex justify-center text-xs tracking-widest uppercase">
          <Link to="/" className="px-5 py-3 border border-border/60 text-muted-foreground hover:text-gold hover:border-gold/40 transition text-center">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm border-b border-border/20 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right break-words ${strong ? "font-display text-gold" : ""}`}>{value}</span>
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
      return {
        eyebrow: "Reserva criada",
        title: "Reserva registada",
        body: "A sua reserva foi criada e associada a uma referência oficial do evento.",
      };
    case "payment_preparing":
      return {
        eyebrow: "Pagamento seguro",
        title: "Preparando pagamento",
        body: "A preparar a etapa segura de pagamento associada à sua reserva.",
      };
    case "payment_processing":
      return {
        eyebrow: "Validação em curso",
        title: "Aguardando confirmação",
        body: "Aguardamos a confirmação do pagamento para liberar o Formulário de Admissão Executiva.",
      };
    case "payment_confirmed":
      return {
        eyebrow: "Pagamento confirmado",
        title: "Admissão disponível",
        body: "Pagamento validado. A encaminhar para o Formulário de Admissão Executiva.",
      };
  }
}

type StepStatus = "done" | "active" | "locked" | "future";

function Journey({ stage }: { stage: Stage }) {
  const paymentDone = stage === "payment_confirmed";
  const admissionActive = stage === "payment_confirmed";

  const steps: { label: string; state: StepStatus; hint: string }[] = [
    { label: "Reserva", state: "done", hint: "concluída" },
    { label: "Pagamento", state: paymentDone ? "done" : "active", hint: paymentDone ? "concluído" : "em validação" },
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
