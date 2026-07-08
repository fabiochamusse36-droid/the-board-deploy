import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
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
    maxQuantity: 5,
  },
  "vip-board": {
    id: "vip-board" as const,
    name: "VIP Board Member",
    tag: "VIP · Reserva Premium",
    price: 7500,
    category: "VIP sujeita a validação executiva",
    description: "Lounge exclusivo, jantar executivo e mesa restrita.",
    maxQuantity: 2,
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
    payment_phone: "",
    same_as_whatsapp: true,
    consent: false,
  });

  const total = useMemo(() => ticket.price * form.quantity, [ticket.price, form.quantity]);
  const requiresPhone = form.payment_method === "mpesa" || form.payment_method === "emola";

  // Clamp quantity if ticket max changes
  useEffect(() => {
    setForm((f) => ({ ...f, quantity: Math.min(f.quantity, ticket.maxQuantity) }));
  }, [ticket.maxQuantity]);

  // Auto-sync payment phone with WhatsApp when checkbox is active
  useEffect(() => {
    if (form.same_as_whatsapp && requiresPhone) {
      setForm((f) => (f.payment_phone === f.phone ? f : { ...f, payment_phone: f.phone }));
    }
  }, [form.phone, form.same_as_whatsapp, requiresPhone]);

  function decQty() {
    setForm((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }));
  }
  function incQty() {
    setForm((f) => ({ ...f, quantity: Math.min(ticket.maxQuantity, f.quantity + 1) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.consent) {
      setError("Confirme a declaração de reserva provisória para continuar.");
      return;
    }
    if (requiresPhone && form.payment_phone.trim().length < 6) {
      setError("Indique o número para pagamento.");
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
      // Persist client-side reservation state.
      // NOTE (internal): In production, this step will call THE BOARD backend, which
      // will create a payment session with Gateway RW and return a checkoutUrl.
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
        paymentPhone: requiresPhone ? form.payment_phone.trim() : null,
        paymentStatus: "payment_processing",
        admissionStatus: "admission_form_locked",
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
            Registe os seus dados para gerar uma referência de reserva e prosseguir para o
            ambiente seguro de pagamento.
          </p>
        </div>

        {/* STEP 1 — Escolha confirmada (access summary + quantity + total) */}
        <div className="border border-gold/40 bg-gradient-to-b from-card to-background p-6 md:p-8 mb-8">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4 text-center">01 — Escolha confirmada</p>
          <div className="text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold/80">{ticket.tag}</p>
            <h2 className="font-display text-2xl md:text-3xl mt-2">{ticket.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{ticket.description}</p>
            <p className="mt-2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{ticket.category}</p>
            <p className="font-display text-4xl text-gradient-gold mt-5">
              {ticket.price.toLocaleString("pt-PT")} <span className="text-base text-muted-foreground">MT</span>
            </p>
            <p className="mt-2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Preço unitário</p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={decQty}
              disabled={form.quantity <= 1}
              aria-label="Diminuir quantidade"
              className="w-11 h-11 border border-border/60 text-gold text-lg flex items-center justify-center hover:border-gold/60 hover:bg-gold/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              −
            </button>
            <div aria-live="polite" className="min-w-[3rem] text-center font-display text-2xl tabular-nums">
              {form.quantity}
            </div>
            <button
              type="button"
              onClick={incQty}
              disabled={form.quantity >= ticket.maxQuantity}
              aria-label="Aumentar quantidade"
              className="w-11 h-11 border border-border/60 text-gold text-lg flex items-center justify-center hover:border-gold/60 hover:bg-gold/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            Máx. {ticket.maxQuantity} por reserva
          </p>

          <div className="mt-6 pt-4 border-t border-border/40 flex justify-between items-baseline">
            <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Total</span>
            <span className="font-display text-3xl text-gradient-gold">
              {total.toLocaleString("pt-PT")} <span className="text-sm text-muted-foreground">MT</span>
            </span>
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

        <form onSubmit={onSubmit} className="space-y-8 border border-border/40 bg-card/40 p-6 md:p-10">
          {/* STEP 2 — Dados do Participante */}
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">02 — Dados do participante</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nome completo">
                <input required minLength={2} maxLength={120} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Email">
                <input type="email" required maxLength={255} value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
              </Field>
              <Field label="WhatsApp de contacto">
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
            </div>
          </div>

          {/* STEP 3 — Preparação do Pagamento */}
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">03 — Canal de pagamento preferido</p>
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

            {requiresPhone && (
              <div className="mt-5 space-y-3">
                <Field label="Número para pagamento">
                  <input
                    type="tel"
                    required
                    minLength={6}
                    maxLength={30}
                    placeholder="+258 84 000 0000"
                    value={form.payment_phone}
                    disabled={form.same_as_whatsapp}
                    onChange={(e) => setForm({ ...form, payment_phone: e.target.value })}
                    className={`${inputCls} disabled:opacity-70`}
                  />
                </Field>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.same_as_whatsapp}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        same_as_whatsapp: e.target.checked,
                        payment_phone: e.target.checked ? form.phone : form.payment_phone,
                      })
                    }
                    className="mt-1 accent-[color:var(--color-gold,#c9a449)]"
                  />
                  <span className="text-xs text-muted-foreground">
                    Usar o mesmo número do WhatsApp
                  </span>
                </label>
              </div>
            )}

            {form.payment_method === "bank" && (
              <p className="mt-5 text-[11px] text-muted-foreground leading-relaxed">
                Os dados de pagamento serão apresentados no ambiente de pagamento seguro.
              </p>
            )}
            {form.payment_method === "manual" && (
              <p className="mt-5 text-[11px] text-muted-foreground leading-relaxed">
                A equipa executiva poderá entrar em contacto para coordenar a validação da reserva.
              </p>
            )}
          </div>

          {/* STEP 4 — Política */}
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">04 — Política</p>
            <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-gold/40 pl-4">
              A admissão final está sujeita à validação executiva. Caso o perfil não seja elegível para
              a categoria solicitada, o valor será reembolsado conforme a política do evento.
            </p>
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
            {loading ? "Criando reserva…" : "Criar Reserva e Continuar"}
          </button>
          <p className="text-xs text-muted-foreground text-center">
            Após criar a reserva, será encaminhado para o ambiente seguro de pagamento.
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
