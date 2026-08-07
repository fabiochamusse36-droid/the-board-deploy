import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { createOrder } from "@/lib/orders.functions";
import {
  clearReservationDraft,
  formatMoney,
  getReservationDraft,
  type ReservationDraft,
} from "@/lib/reservation-draft";

export const Route = createFileRoute("/reserva/resumo")({
  head: () => ({
    meta: [
      { title: "Confirmar Reserva — THE BOARD 2026" },
      {
        name: "description",
        content: "Reveja os dados finais e confirme a sua reserva.",
      },
    ],
  }),
  component: ReservaResumo,
});

function ReservaResumo() {
  const navigate = useNavigate();
  const submit = useServerFn(createOrder);

  const [draft, setDraft] = useState<ReservationDraft | null>(null);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(getReservationDraft());
  }, []);

  async function confirmReservation(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!draft) return;

    if (
      !draft.buyerName ||
      !draft.buyerEmail ||
      !draft.buyerPhone ||
      !draft.country ||
      !draft.city
    ) {
      setError("Volte aos dados do participante e complete a reserva.");
      return;
    }

    if (!consent) {
      setError("Confirme a política de admissão para continuar.");
      return;
    }

    setLoading(true);

    try {
      const reservation = await submit({
        data: {
          ticket: draft.ticketId,
          name: draft.buyerName,
          email: draft.buyerEmail,
          phone: draft.buyerPhone,
          country: draft.country,
          city: draft.city,
          quantity: draft.quantity,
        },
      });

      /*
       * A partir deste ponto a reserva oficial já existe no backend.
       *
       * Não gravamos qualquer cópia da reserva em localStorage.
       * PostgreSQL/backend é a única fonte de verdade.
       */

      clearReservationDraft();

      navigate({
        to: "/confirmacao/$reference",
        params: {
          reference: reservation.reference,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar a reserva.",
      );

      setLoading(false);
    }
  }

  if (!draft) {
    return <RecoveryState />;
  }

  const hasParticipant = Boolean(
    draft.buyerName &&
      draft.buyerEmail &&
      draft.buyerPhone &&
      draft.country &&
      draft.city,
  );

  return (
    <div className="min-h-screen bg-background text-foreground py-20 md:py-24 px-5 md:px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/reserva/dados"
          className="text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-gold"
        >
          ← Voltar
        </Link>

        <div className="mt-10 mb-10 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
            Criar Reserva
          </p>

          <h1 className="font-display text-4xl md:text-6xl leading-tight">
            Confirmar Reserva
          </h1>

          <p className="mt-4 text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Reveja o acesso, os dados do participante e a política. Depois
            disto, será criada a referência oficial da reserva.
          </p>
        </div>

        <ReservationProgress active="resumo" />

        <form
          onSubmit={confirmReservation}
          className="mt-10 space-y-6"
        >
          <section className="border border-gold/40 bg-gradient-to-b from-card to-background p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">
                  Acesso
                </p>

                <h2 className="font-display text-2xl">
                  {draft.ticketName}
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  {draft.ticketCategory}
                </p>
              </div>

              <Link
                to="/comprar"
                search={{ ticket: draft.ticketId }}
                className="text-[10px] tracking-widest uppercase text-muted-foreground hover:text-gold shrink-0"
              >
                Alterar
              </Link>
            </div>

            <ReviewRow
              label="Preço unitário"
              value={formatMoney(draft.unitPrice)}
            />

            <ReviewRow
              label="Quantidade"
              value={String(draft.quantity)}
            />

            <div className="mt-5 pt-5 border-t border-border/40 flex justify-between items-baseline">
              <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                Total
              </span>

              <span className="font-display text-3xl md:text-4xl text-gradient-gold">
                {formatMoney(draft.totalAmount)}
              </span>
            </div>
          </section>

          <section className="border border-border/40 bg-card/40 p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-5">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold">
                Participante
              </p>

              <Link
                to="/reserva/dados"
                className="text-[10px] tracking-widest uppercase text-muted-foreground hover:text-gold"
              >
                Editar dados
              </Link>
            </div>

            {hasParticipant ? (
              <>
                <ReviewRow
                  label="Nome"
                  value={draft.buyerName ?? ""}
                />

                <ReviewRow
                  label="Email"
                  value={draft.buyerEmail ?? ""}
                />

                <ReviewRow
                  label="WhatsApp"
                  value={draft.buyerPhone ?? ""}
                />

                <ReviewRow
                  label="País"
                  value={draft.country ?? ""}
                />

                <ReviewRow
                  label="Cidade"
                  value={draft.city ?? ""}
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete os dados do participante antes de confirmar a
                reserva.
              </p>
            )}
          </section>

          <section className="border border-gold/30 bg-gold/5 p-6 md:p-8">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
              Próxima etapa
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Ao confirmar, o THE BOARD cria a referência oficial da reserva
              no servidor. A etapa financeira será processada pelo backend e
              pelo gateway de pagamento configurado.
            </p>
          </section>

          <section className="border border-border/40 bg-background/60 p-6 md:p-8">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
              Política
            </p>

            <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-gold/40 pl-4 mb-5">
              A admissão final está sujeita à validação executiva. Caso o
              perfil não seja elegível para a categoria solicitada, o valor
              será reembolsado conforme a política do evento.
            </p>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 accent-[color:var(--color-gold,#c9a449)]"
              />

              <span className="text-xs text-muted-foreground leading-relaxed">
                Confirmo os dados da reserva e estou ciente de que a admissão
                final está sujeita à validação da Direção Executiva.
              </span>
            </label>
          </section>

          {error ? (
            <p className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              to="/reserva/dados"
              className="py-4 border border-border/60 text-muted-foreground tracking-widest text-xs uppercase text-center hover:text-gold hover:border-gold/40 transition"
            >
              Voltar
            </Link>

            <button
              type="submit"
              disabled={
                loading ||
                !consent ||
                !hasParticipant
              }
              className="py-4 bg-gradient-gold text-primary-foreground tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Criando reserva…"
                : "Confirmar Reserva e Continuar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm border-b border-border/20 last:border-b-0">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span className="text-right break-words">
        {value}
      </span>
    </div>
  );
}

function RecoveryState() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
          Reserva não iniciada
        </p>

        <h1 className="font-display text-4xl mb-4">
          Selecione um acesso
        </h1>

        <p className="text-muted-foreground mb-8">
          Selecione um acesso antes de continuar.
        </p>

        <Link
          to="/"
          hash="bilhetes"
          className="inline-block px-6 py-3 border border-gold text-gold text-xs tracking-widest uppercase hover:bg-gold/10 transition"
        >
          Escolher acesso
        </Link>
      </div>
    </div>
  );
}

function ReservationProgress({
  active,
}: {
  active:
    | "escolha"
    | "dados"
    | "resumo"
    | "pagamento";
}) {
  const steps = [
    {
      id: "escolha",
      label: "Escolha",
    },
    {
      id: "dados",
      label: "Dados",
    },
    {
      id: "resumo",
      label: "Resumo",
    },
    {
      id: "pagamento",
      label: "Pagamento",
    },
  ] as const;

  const activeIndex = steps.findIndex(
    (step) => step.id === active,
  );

  return (
    <ol className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
      {steps.map((step, index) => {
        const done = index < activeIndex;
        const current = index === activeIndex;

        return (
          <li
            key={step.id}
            className="flex flex-col items-center"
          >
            <span
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-display ${
                done || current
                  ? "border-gold text-gold bg-gold/10"
                  : "border-border/60 text-muted-foreground"
              }`}
            >
              {done ? "✓" : index + 1}
            </span>

            <span
              className={`mt-2 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase ${
                done || current
                  ? "text-gold"
                  : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
