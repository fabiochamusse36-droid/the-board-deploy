import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  formatMoney,
  getReservationDraft,
  saveReservationDraft,
  type ReservationDraft,
} from "@/lib/reservation-draft";

export const Route = createFileRoute("/reserva/dados")({
  head: () => ({
    meta: [
      { title: "Dados do Participante — THE BOARD 2026" },
      { name: "description", content: "Informe os dados do participante para completar a reserva." },
    ],
  }),
  component: ReservaDados,
});

function ReservaDados() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<ReservationDraft | null>(null);
  const [form, setForm] = useState({
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    country: "Moçambique",
    city: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const current = getReservationDraft();
    setDraft(current);
    if (current) {
      setForm({
        buyerName: current.buyerName ?? "",
        buyerEmail: current.buyerEmail ?? "",
        buyerPhone: current.buyerPhone ?? "",
        country: current.country ?? "Moçambique",
        city: current.city ?? "",
      });
    }
  }, []);

  function continueToSummary(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!draft) return;
    if (!form.buyerName.trim() || !form.buyerEmail.trim() || !form.buyerPhone.trim() || !form.country.trim() || !form.city.trim()) {
      setError("Preencha todos os dados do participante para continuar.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.buyerEmail.trim())) {
      setError("Indique um email válido.");
      return;
    }
    saveReservationDraft({
      ...draft,
      buyerName: form.buyerName.trim(),
      buyerEmail: form.buyerEmail.trim(),
      buyerPhone: form.buyerPhone.trim(),
      country: form.country.trim(),
      city: form.city.trim(),
    });
    navigate({ to: "/reserva/resumo" });
  }

  if (!draft) return <RecoveryState />;

  return (
    <div className="min-h-screen bg-background text-foreground py-20 md:py-24 px-5 md:px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/comprar" search={{ ticket: draft.ticketId }} className="text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-gold">
          ← Voltar
        </Link>

        <div className="mt-10 mb-10 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Criar Reserva</p>
          <h1 className="font-display text-4xl md:text-6xl leading-tight">Dados do Participante</h1>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Identifique o participante associado à reserva. Estes dados serão usados para contacto, validação e admissão executiva.
          </p>
        </div>

        <ReservationProgress active="dados" />

        <div className="mt-10 mb-8 border border-gold/30 bg-gold/5 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-1">Reserva em curso</p>
            <p className="font-display text-xl md:text-2xl">{draft.ticketName}</p>
            <p className="mt-1 text-xs text-muted-foreground">{draft.ticketCategory}</p>
          </div>
          <div className="text-sm text-muted-foreground sm:text-right">
            <p>Quantidade: <span className="text-foreground">{draft.quantity}</span></p>
            <p>Total: <span className="font-display text-gold">{formatMoney(draft.totalAmount)}</span></p>
          </div>
        </div>

        <form onSubmit={continueToSummary} className="border border-border/40 bg-card/40 p-6 md:p-10 space-y-7">
          <div className="border-l border-gold/40 pl-4 text-xs text-muted-foreground leading-relaxed">
            O participante informado aqui será o titular da reserva e receberá as comunicações oficiais do THE BOARD.
          </div>

          <Field label="Nome completo">
            <input required minLength={2} maxLength={120} value={form.buyerName} onChange={(e) => setForm({ ...form, buyerName: e.target.value })} className={inputCls} autoComplete="name" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email">
              <input type="email" required maxLength={255} value={form.buyerEmail} onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })} className={inputCls} autoComplete="email" />
            </Field>
            <Field label="WhatsApp de contacto">
              <input type="tel" required minLength={6} maxLength={30} placeholder="+258 84 000 0000" value={form.buyerPhone} onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })} className={inputCls} autoComplete="tel" />
            </Field>
            <Field label="País">
              <input required maxLength={80} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputCls} autoComplete="country-name" />
            </Field>
            <Field label="Cidade">
              <input required maxLength={80} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} autoComplete="address-level2" />
            </Field>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="grid sm:grid-cols-2 gap-3 pt-4">
            <Link
              to="/comprar"
              search={{ ticket: draft.ticketId }}
              className="py-4 border border-border/60 text-muted-foreground tracking-widest text-xs uppercase text-center hover:text-gold hover:border-gold/40 transition"
            >
              Voltar
            </Link>
            <button type="submit" className="py-4 bg-gradient-gold text-primary-foreground tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition">
              Continuar para resumo
            </button>
          </div>
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

function RecoveryState() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Reserva não iniciada</p>
        <h1 className="font-display text-4xl mb-4">Selecione um acesso</h1>
        <p className="text-muted-foreground mb-8">Selecione um acesso antes de continuar.</p>
        <Link to="/" hash="bilhetes" className="inline-block px-6 py-3 border border-gold text-gold text-xs tracking-widest uppercase hover:bg-gold/10 transition">
          Escolher acesso
        </Link>
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
            <span className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-display ${done || current ? "border-gold text-gold bg-gold/10" : "border-border/60 text-muted-foreground"}`}>
              {done ? "✓" : i + 1}
            </span>
            <span className={`mt-2 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase ${done || current ? "text-gold" : "text-muted-foreground"}`}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
