import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { z } from "zod";
import {
  getTickets,
  type BackendTicket,
} from "@/lib/tickets-api";
import {
  buildDraft,
  formatMoney,
  saveReservationDraft,
  type TicketId,
  type TicketSnapshot,
} from "@/lib/reservation-draft";

const searchSchema = z.object({
  ticket: z
    .enum(["early-investors", "vip-board"])
    .optional(),
});

export const Route = createFileRoute("/comprar")({
  validateSearch: (
    search: Record<string, unknown>,
  ) => searchSchema.parse(search),

  head: () => ({
    meta: [
      {
        title:
          "Escolha Confirmada — THE BOARD 2026",
      },
      {
        name: "description",
        content:
          "Confirme o acesso e a quantidade da sua reserva.",
      },
    ],
  }),

  component: Comprar,
});

/*
 * Conteúdo editorial do frontend.
 *
 * O preço, nome oficial e disponibilidade vêm
 * sempre do backend.
 *
 * Estes valores servem apenas para apresentação
 * e UX e não são usados como fonte financeira.
 */
const ticketPresentation: Record<
  TicketId,
  {
    tag: string;
    category: string;
    description: string;
    maxQuantity: number;
  }
> = {
  "early-investors": {
    tag: "Lote 1 · Reserva Presencial",
    category: "Participante presencial",
    description:
      "Acesso geral antecipado ao Big Players Forum.",
    maxQuantity: 5,
  },

  "vip-board": {
    tag: "VIP · Reserva Premium",
    category:
      "VIP sujeita a validação executiva",
    description:
      "Lounge exclusivo, jantar executivo e mesa restrita.",
    maxQuantity: 2,
  },
};

function Comprar() {
  const navigate = useNavigate();

  const { ticket: ticketParam } =
    Route.useSearch();

  const ticketId: TicketId =
    ticketParam ?? "early-investors";

  const [tickets, setTickets] = useState<
    BackendTicket[]
  >([]);

  const [quantity, setQuantity] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTickets() {
      setLoading(true);
      setError(null);

      try {
        const result = await getTickets();

        if (!active) return;

        setTickets(result);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os acessos.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadTickets();

    return () => {
      active = false;
    };
  }, []);

  const backendTicket = useMemo(
    () =>
      tickets.find(
        (ticket) =>
          ticket.id === ticketId,
      ) ?? null,
    [tickets, ticketId],
  );

  const presentation =
    ticketPresentation[ticketId];

  const total = useMemo(() => {
    if (!backendTicket) return 0;

    return (
      backendTicket.price * quantity
    );
  }, [backendTicket, quantity]);

  useEffect(() => {
    setQuantity(1);
  }, [ticketId]);

  function decQty() {
    setQuantity((current) =>
      Math.max(1, current - 1),
    );
  }

  function incQty() {
    setQuantity((current) =>
      Math.min(
        presentation.maxQuantity,
        current + 1,
      ),
    );
  }

  function continueToData() {
    if (!backendTicket) {
      setError(
        "O acesso selecionado não foi encontrado.",
      );
      return;
    }

    if (!backendTicket.available) {
      setError(
        "Este acesso ainda não está disponível.",
      );
      return;
    }

    const snapshot: TicketSnapshot = {
      id: ticketId,
      name: backendTicket.name,
      category:
        presentation.category,
      description:
        presentation.description,
      price: backendTicket.price,
      currency:
        backendTicket.currency,
      maxQuantity:
        presentation.maxQuantity,
    };

    saveReservationDraft(
      buildDraft(snapshot, quantity),
    );

    navigate({
      to: "/reserva/dados",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
          A carregar acessos…
        </p>
      </div>
    );
  }

  if (error && tickets.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
            Acessos
          </p>

          <h1 className="font-display text-4xl">
            Não foi possível carregar
          </h1>

          <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
            {error}
          </p>

          <Link
            to="/"
            className="inline-block mt-8 px-6 py-3 border border-gold text-gold text-xs tracking-widest uppercase"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  if (!backendTicket) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
            Acesso
          </p>

          <h1 className="font-display text-4xl">
            Acesso indisponível
          </h1>

          <p className="mt-5 text-sm text-muted-foreground">
            O acesso selecionado não existe no catálogo atual.
          </p>

          <Link
            to="/"
            hash="bilhetes"
            className="inline-block mt-8 px-6 py-3 border border-gold text-gold text-xs tracking-widest uppercase"
          >
            Ver acessos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-20 md:py-24 px-5 md:px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-gold"
        >
          ← Voltar
        </Link>

        <div className="mt-10 mb-10 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
            Criar Reserva
          </p>

          <h1 className="font-display text-4xl md:text-6xl leading-tight">
            Escolha Confirmada
          </h1>

          <p className="mt-4 text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Confirme o acesso e a quantidade.
            Os dados do participante serão
            solicitados na próxima etapa.
          </p>
        </div>

        <ReservationProgress active="escolha" />

        <div className="mt-10 grid lg:grid-cols-[1fr_0.72fr] gap-6 items-stretch">
          <section className="border border-gold/40 bg-gradient-to-b from-card to-background p-6 md:p-8">
            <div className="text-center">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold/80">
                {presentation.tag}
              </p>

              <h2 className="font-display text-2xl md:text-4xl mt-3">
                {backendTicket.name}
              </h2>

              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {presentation.description}
              </p>

              <p className="mt-3 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                {presentation.category}
              </p>

              <p className="font-display text-4xl text-gradient-gold mt-6">
                {formatMoney(
                  backendTicket.price,
                  backendTicket.currency,
                )}
              </p>

              <p className="mt-2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                Preço unitário
              </p>

              {!backendTicket.available ? (
                <div className="mt-5 border border-gold/40 bg-gold/5 px-4 py-3 text-xs text-gold">
                  Este acesso ainda não está disponível.
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={decQty}
                disabled={
                  quantity <= 1 ||
                  !backendTicket.available
                }
                aria-label="Diminuir quantidade"
                className="w-12 h-12 border border-border/60 text-gold text-lg flex items-center justify-center hover:border-gold/60 hover:bg-gold/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                −
              </button>

              <div
                aria-live="polite"
                className="min-w-[3.5rem] text-center font-display text-3xl tabular-nums"
              >
                {quantity}
              </div>

              <button
                type="button"
                onClick={incQty}
                disabled={
                  quantity >=
                    presentation.maxQuantity ||
                  !backendTicket.available
                }
                aria-label="Aumentar quantidade"
                className="w-12 h-12 border border-border/60 text-gold text-lg flex items-center justify-center hover:border-gold/60 hover:bg-gold/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              Máx.{" "}
              {presentation.maxQuantity} por
              reserva
            </p>

            <div className="mt-8 pt-5 border-t border-border/40 flex justify-between items-baseline">
              <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                Total
              </span>

              <span className="font-display text-3xl md:text-4xl text-gradient-gold">
                {formatMoney(
                  total,
                  backendTicket.currency,
                )}
              </span>
            </div>
          </section>

          <aside className="border border-border/40 bg-card/30 p-6 md:p-8 flex flex-col justify-between gap-8">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
                Próximas etapas
              </p>

              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <span className="text-foreground">
                    1.
                  </span>{" "}
                  Informar dados do participante.
                </p>

                <p>
                  <span className="text-foreground">
                    2.
                  </span>{" "}
                  Rever a reserva e aceitar a
                  política de admissão.
                </p>

                <p>
                  <span className="text-foreground">
                    3.
                  </span>{" "}
                  Continuar para pagamento seguro
                  externo.
                </p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed border-l border-gold/40 pl-4">
              Nome, preço e disponibilidade do acesso
              são carregados diretamente do backend
              do THE BOARD.
            </div>
          </aside>
        </div>

        <div className="my-8 flex gap-3 text-[10px] tracking-widest uppercase justify-center">
          {(["early-investors", "vip-board"] as TicketId[]).map(
            (id) => {
              const available =
                tickets.find(
                  (ticket) =>
                    ticket.id === id,
                );

              return (
                <Link
                  key={id}
                  to="/comprar"
                  search={{
                    ticket: id,
                  }}
                  className={`px-3 py-2 border transition ${
                    id === ticketId
                      ? "border-gold text-gold bg-gold/10"
                      : "border-border/60 text-muted-foreground hover:border-gold/40"
                  } ${
                    available &&
                    !available.available
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  {available?.name ??
                    id}
                </Link>
              );
            },
          )}
        </div>

        {error ? (
          <p className="mb-5 text-sm text-destructive text-center">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={continueToData}
          disabled={
            !backendTicket.available
          }
          className="w-full py-4 bg-gradient-gold text-primary-foreground tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar para dados do participante
        </button>
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

  const activeIndex =
    steps.findIndex(
      (step) =>
        step.id === active,
    );

  return (
    <ol className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
      {steps.map(
        (step, index) => {
          const done =
            index < activeIndex;

          const current =
            index === activeIndex;

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
                {done
                  ? "✓"
                  : index + 1}
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
        },
      )}
    </ol>
  );
}
