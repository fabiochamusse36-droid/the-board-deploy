import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import {
  buildDraft,
  formatMoney,
  saveReservationDraft,
  TICKETS,
  type TicketId,
} from "@/lib/reservation-draft";

const searchSchema = z.object({
  ticket: z.enum(["early-investors", "vip-board"]).optional(),
});

export const Route = createFileRoute("/comprar")({
  validateSearch: (s: Record<string, unknown>) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Escolha Confirmada — THE BOARD 2026" },
      { name: "description", content: "Confirme o acesso e a quantidade da sua reserva." },
    ],
  }),
  component: Comprar,
});

function Comprar() {
  const navigate = useNavigate();
  const { ticket: ticketParam } = Route.useSearch();
  const ticketId: TicketId = ticketParam ?? "early-investors";
  const ticket = TICKETS[ticketId];
  const [quantity, setQuantity] = useState(1);
  const total = useMemo(() => ticket.price * quantity, [ticket.price, quantity]);

  function decQty() {
    setQuantity((q) => Math.max(1, q - 1));
  }

  function incQty() {
    setQuantity((q) => Math.min(ticket.maxQuantity, q + 1));
  }

  function continueToData() {
    saveReservationDraft(buildDraft(ticket.id, quantity));
    navigate({ to: "/reserva/dados" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-gold">
          ← Voltar
        </Link>

        <div className="mt-10 mb-10 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Criar Reserva</p>
          <h1 className="font-display text-4xl md:text-5xl">Escolha Confirmada</h1>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Confirme o acesso e a quantidade antes de avançar para os dados do participante.
          </p>
        </div>

        <ReservationProgress active="escolha" />

        <div className="border border-gold/40 bg-gradient-to-b from-card to-background p-6 md:p-8 mt-10 mb-8">
          <div className="text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold/80">{ticket.tag}</p>
            <h2 className="font-display text-2xl md:text-3xl mt-2">{ticket.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{ticket.description}</p>
            <p className="mt-2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{ticket.category}</p>
            <p className="font-display text-4xl text-gradient-gold mt-5">
              {formatMoney(ticket.price).replace(" MT", "")} <span className="text-base text-muted-foreground">MT</span>
            </p>
            <p className="mt-2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Preço unitário</p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={decQty}
              disabled={quantity <= 1}
              aria-label="Diminuir quantidade"
              className="w-11 h-11 border border-border/60 text-gold text-lg flex items-center justify-center hover:border-gold/60 hover:bg-gold/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              −
            </button>
            <div aria-live="polite" className="min-w-[3rem] text-center font-display text-2xl tabular-nums">
              {quantity}
            </div>
            <button
              type="button"
              onClick={incQty}
              disabled={quantity >= ticket.maxQuantity}
              aria-label="Aumentar quantidade"
              className="w-11 h-11 border border-border/60 text-gold text-lg flex items-center justify-center hover:border-gold/60 hover:bg-gold/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            Máx. {ticket.maxQuantity} por reserva
          </p>

          <div className="mt-8 pt-5 border-t border-border/40 flex justify-between items-baseline">
            <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Total</span>
            <span className="font-display text-3xl text-gradient-gold">{formatMoney(total)}</span>
          </div>
        </div>

        <div className="mb-8 flex gap-3 text-[10px] tracking-widest uppercase justify-center">
          {(Object.keys(TICKETS) as TicketId[]).map((id) => (
            <Link
              key={id}
              to="/comprar"
              search={{ ticket: id }}
              className={`px-3 py-2 border transition ${
                id === ticketId ? "border-gold text-gold bg-gold/10" : "border-border/60 text-muted-foreground hover:border-gold/40"
              }`}
            >
              {TICKETS[id].tag.split("·")[0].trim()}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={continueToData}
          className="w-full py-4 bg-gradient-gold text-primary-foreground tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

function ReservationProgress({ active }: { active: "escolha" | "dados" | "resumo" | "pagamento" }) {
  const steps = [
    { id: "escolha", label: "Escolha" },
    { id: "dados", label: "Dados" },
    { id: "resumo", label: "Resumo" },
    { id: "pagamento", label: "Pagamento" },
  ] as const;
  const activeIndex = steps.findIndex((s) => s.id === active);

  return (
    <ol className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
      {steps.map((s, i) => {
        const done = i < activeIndex;
        const current = i === activeIndex;
        return (
          <li key={s.id} className="flex flex-col items-center">
            <span
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-display ${
                done || current ? "border-gold text-gold bg-gold/10" : "border-border/60 text-muted-foreground"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span className={`mt-2 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase ${done || current ? "text-gold" : "text-muted-foreground"}`}>
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
