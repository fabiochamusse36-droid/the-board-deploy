import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { z } from "zod";
import { createOrder } from "@/lib/orders.functions";
import { saveReservation, type PaymentMethod } from "@/lib/reservations.mock";

const TICKETS = {
  "early-investors": {
    id: "early-investors" as const,
    name: "Investidores Iniciais",
    tag: "Lote 1 · Reserva Presencial",
    price: 2500,
    category: "Participante presencial",
    description: "Acesso geral antecipado ao Big Players Forum.",
  },
  "vip-board": {
    id: "vip-board" as const,
    name: "VIP Board Member",
    tag: "VIP · Reserva Premium",
    price: 7500,
    category: "VIP sujeita a validação executiva",
    description: "Lounge exclusivo, jantar executivo e mesa restrita.",
  },
} as const;

type TicketId = keyof typeof TICKETS;

const searchSchema = z.object({
  ticket: z.enum(["early-investors", "vip-board"]).optional(),
});

export const Route = createFileRoute("/comprar")({
  validateSearch: (s: Record<string, unknown>) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Criar Reserva — THE BOARD 2026" },
      { name: "description", content: "Reserve o seu acesso ao The Board Big Players Forum 2026." },
    ],
  }),
  component: Comprar,
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Erro</p>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        <button onClick={reset} className="px-6 py-3 border border-gold text-gold text-xs tracking-widest uppercase">Tentar de novo</button>
      </div>
    </div>
  ),
  notFoundComponent: () => <div className="p-10">Página não encontrada</div>,
});

function Comprar() {
  const navigate = useNavigate();
  const submit = useServerFn(createOrder);
  const { ticket: ticketParam } = Route.useSearch();
  const ticketId: TicketId = ticketParam ?? "early-investors";
  const ticket = TICKETS[ticketId];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "Moçambique",
    city: "",
    quantity: 1,
    payment_method: "mpesa" as PaymentMethod,
    consent: false,
  });

  const total = useMemo(() => ticket.price * form.quantity, [ticket.price, form.quantity]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.consent) {
      setError("Confirme a declaração de reserva provisória para continuar.");
      return;
    }
    setLoading(true);
    try {
      const res = await submit({
        data: {
          ticket: ticket.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          country: form.country,
          city: form.city,
          quantity: form.quantity,
          payment_method: form.payment_method,
        },
      });
      // Persist mock client-side reservation state for the demo funnel.
      saveReservation({
        reference: res.reference,
        ticketId: ticket.id,
        ticketName: ticket.name,
        amount: ticket.price * form.quantity,
        quantity: form.quantity,
        buyerName: form.name,
        buyerEmail: form.email,
        buyerPhone: form.phone,
        country: form.country,
        city: form.city,
        paymentMethod: form.payment_method,
      });
      navigate({ to: "/confirmacao/$reference", params: { reference: res.reference } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar reserva");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-gold">← Voltar</Link>

        <div className="mt-10 mb-10 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Criar Reserva</p>
          <h1 className="font-display text-4xl md:text-5xl">Criar Reserva</h1>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Registe os seus dados para gerar uma referência de pagamento e reservar prioridade de vaga.
          </p>
        </div>

        <div className="border border-gold/40 bg-gradient-to-b from-card to-background p-6 md:p-8 mb-8 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold/80">{ticket.tag}</p>
          <h2 className="font-display text-2xl md:text-3xl mt-2">{ticket.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{ticket.description}</p>
          <p className="mt-2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{ticket.category}</p>
          <p className="font-display text-4xl text-gradient-gold mt-5">
            {ticket.price.toLocaleString("pt-PT")} <span className="text-base text-muted-foreground">MT</span>
          </p>
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

        <div className="border border-gold/30 bg-card/40 p-5 mb-6 text-xs text-muted-foreground leading-relaxed">
          A reserva garante prioridade de vaga, mas a admissão final será confirmada após análise do
          Formulário de Admissão Executiva. Caso o perfil não seja elegível para a categoria solicitada,
          o valor será reembolsado conforme a política do evento.
        </div>

        <form onSubmit={onSubmit} className="space-y-6 border border-border/40 bg-card/40 p-8 md:p-10">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome completo">
              <input required minLength={2} maxLength={120} value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Email">
              <input type="email" required maxLength={255} value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
            </Field>
            <Field label="WhatsApp (com indicativo)">
              <input type="tel" required minLength={6} maxLength={30} placeholder="+258 84 000 0000"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
            </Field>
            <Field label="País">
              <input required maxLength={80} value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Cidade">
              <input required maxLength={80} value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Quantidade">
              <input type="number" min={1} max={10} value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })}
                className={inputCls} />
            </Field>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Método de pagamento</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["mpesa", "emola", "bank", "manual"] as const).map((m) => (
                <button key={m} type="button"
                  onClick={() => setForm({ ...form, payment_method: m })}
                  className={`py-3 text-[10px] tracking-widest uppercase border transition ${
                    form.payment_method === m
                      ? "border-gold text-gold bg-gold/10"
                      : "border-border/60 text-muted-foreground hover:border-gold/40"
                  }`}>
                  {m === "mpesa" ? "M-Pesa" : m === "emola" ? "e-Mola" : m === "bank" ? "Transferência" : "Manual"}
                </button>
              ))}
            </div>
            {(form.payment_method === "mpesa" || form.payment_method === "emola") && (
              <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
                O número informado será usado para associar a validação do pagamento.
              </p>
            )}
          </div>

          <div className="flex justify-between items-baseline border-t border-border/40 pt-5">
            <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Total</span>
            <span className="font-display text-3xl text-gradient-gold">
              {total.toLocaleString("pt-PT")} <span className="text-sm text-muted-foreground">MT</span>
            </span>
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              className="mt-1 accent-[color:var(--color-gold,#c9a449)]" />
            <span className="text-xs text-muted-foreground leading-relaxed">
              Confirmo que desejo criar uma reserva provisória e estou ciente de que a admissão final
              está sujeita à validação da Direção Executiva.
            </span>
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-gradient-gold text-primary-foreground tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition disabled:opacity-50">
            {loading ? "A processar…" : "Criar Reserva e Continuar"}
          </button>
          <p className="text-xs text-muted-foreground text-center">
            Receberá a referência de pagamento na próxima página. A credencial é emitida após validação
            do perfil pela Direção Executiva.
          </p>
        </form>
      </div>
    </div>
  );
}

const inputCls = "w-full mt-2 bg-background border border-border/60 px-4 py-3 text-sm focus:border-gold outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
