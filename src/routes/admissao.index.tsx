import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";


const searchSchema = z.object({
  reference: z.string().trim().min(4).max(40).optional(),
});

export const Route = createFileRoute("/admissao/")({
  validateSearch: (s: Record<string, unknown>) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Admissão — THE BOARD Big Players Forum 2026" },
      {
        name: "description",
        content:
          "Formulário de Admissão Executiva — validação de perfil para o THE BOARD, Maputo 2026.",
      },
      { property: "og:title", content: "Admissão — THE BOARD 2026" },
      {
        property: "og:description",
        content:
          "Trader Profile Assessment — admissão à mesa do Big Players Forum, Maputo 2026.",
      },
    ],
  }),
  component: AdmissaoPage,
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center bg-background text-foreground">
      <div>
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Erro</p>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-3 border border-gold text-gold text-xs tracking-widest uppercase"
        >
          Tentar de novo
        </button>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Página não encontrada</div>
  ),
});

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  experience: string;
  style: string;
  risk: string;
  seat: string;
  notes: string;
  declaration: boolean;
};

const experienceOptions = [
  "Menos de 2 anos",
  "2–5 anos",
  "5–10 anos",
  "Mais de 10 anos",
];
const styleOptions = [
  "Day Trading",
  "Swing Trading",
  "Position / Long-term",
  "Algorítmico / Quant",
  "Multi-estratégia",
];
const riskOptions = [
  "Conservador (< 1% por operação)",
  "Moderado (1–3% por operação)",
  "Agressivo (> 3% por operação)",
  "Gestão institucional / mandato",
];
const seatOptions = [
  "Early Investor",
  "Standard",
  "Premium",
  "VIP / Board Member",
  "Institucional / Family Office",
];

function AdmissaoPage() {
  const navigate = useNavigate();
  const { reference } = Route.useSearch();
  const [reservation, setReservation] = useState<MockReservation | null>(null);
  const [gateChecked, setGateChecked] = useState(false);

  useEffect(() => {
    if (!reference) {
      setGateChecked(true);
      return;
    }
    const { data } = getReservation(reference);
    setReservation(data);
    setGateChecked(true);
  }, [reference]);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    company: "",
    experience: "",
    style: "",
    risk: "",
    seat: "",
    notes: "",
    declaration: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Nome obrigatório";
    if (!form.email.trim()) next.email = "E-mail obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "E-mail inválido";
    if (!form.experience) next.experience = "Selecione a sua experiência";
    if (!form.style) next.style = "Selecione um estilo operacional";
    if (!form.risk) next.risk = "Selecione a sua gestão de risco";
    if (!form.seat) next.seat = "Selecione a categoria de assento";
    if (!form.declaration) next.declaration = "Confirme a declaração final";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Simulated submission — replace with real backend when available.
      await new Promise((r) => setTimeout(r, 900));
      navigate({ to: "/admissao/obrigado" });
    } finally {
      setLoading(false);
    }
  }

  if (!gateChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-xs tracking-widest uppercase">
        A validar acesso…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-lg tracking-[0.25em] text-foreground">
            THE <span className="text-gold">BOARD</span>
          </Link>
          <Link
            to="/"
            className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-gold transition"
          >
            ← Voltar
          </Link>
        </nav>
      </header>

      <section className="relative pt-32 pb-24">
        <div className="absolute inset-0 bg-gradient-dark opacity-80 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 border border-gold/60 text-gold text-[10px] tracking-[0.35em] uppercase">
              Trader Profile Assessment
            </span>
            <h1 className="font-display text-4xl md:text-6xl mt-8 leading-tight">
              THE BOARD — <span className="text-gradient-gold">BIG PLAYERS FORUM</span>
            </h1>
            <p className="mt-6 text-sm md:text-base text-muted-foreground tracking-wide">
              Maputo 2026 • Questionário de Qualificação e Admissão de Operadores de Mercado
            </p>
            <div className="mx-auto mt-8 max-w-xs hairline-gold" />
          </div>

          {reference ? (
            <div className="border border-gold/40 bg-gold/5 p-5 md:p-6 mb-8 text-center">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Referência da reserva</p>
              <p className="font-display text-xl tracking-widest break-all">{reference}</p>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                Esta candidatura está associada à sua reserva provisória. A submissão do formulário é
                necessária para validação final da admissão.
              </p>
            </div>
          ) : (
            <div className="border border-border/60 bg-card/40 p-5 md:p-6 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Para garantir prioridade de vaga, recomendamos criar uma reserva antes de submeter o
                formulário.
              </p>
              <Link
                to="/comprar"
                className="shrink-0 px-5 py-3 border border-gold text-gold text-[10px] tracking-widest uppercase hover:bg-gold/10 transition"
              >
                Criar Reserva
              </Link>
            </div>
          )}


          <div className="border border-gold/30 bg-card/40 backdrop-blur-sm p-6 md:p-8 mb-10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
              Política de Privacidade & Data Protection
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Os dados operacionais fornecidos abaixo destinam-se exclusivamente à validação de
              perfil pela comissão de curadoria do evento. O THE BOARD não partilha dados de
              perfil, performance ou estratégia com terceiros sem autorização.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="bg-gradient-to-b from-card/60 to-background/80 border border-border/60 p-6 md:p-10 space-y-8"
          >
            <Section title="01 — Identificação">
              <Field label="Nome completo *" error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={inputCls}
                  autoComplete="name"
                />
              </Field>
              <div className="grid md:grid-cols-2 gap-6">
                <Field label="E-mail *" error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={inputCls}
                    autoComplete="email"
                  />
                </Field>
                <Field label="Telefone">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={inputCls}
                    autoComplete="tel"
                  />
                </Field>
              </div>
              <Field label="Empresa / Instituição (opcional)">
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </Section>

            <Section title="02 — Perfil operacional">
              <Field label="Experiência em mercados *" error={errors.experience}>
                <Select
                  value={form.experience}
                  onChange={(v) => update("experience", v)}
                  options={experienceOptions}
                />
              </Field>
              <Field label="Estilo operacional *" error={errors.style}>
                <Select
                  value={form.style}
                  onChange={(v) => update("style", v)}
                  options={styleOptions}
                />
              </Field>
              <Field label="Gestão de risco *" error={errors.risk}>
                <Select
                  value={form.risk}
                  onChange={(v) => update("risk", v)}
                  options={riskOptions}
                />
              </Field>
            </Section>

            <Section title="03 — Mesa pretendida">
              <Field label="Categoria de assento *" error={errors.seat}>
                <Select
                  value={form.seat}
                  onChange={(v) => update("seat", v)}
                  options={seatOptions}
                />
              </Field>
              <Field label="Observações estratégicas (opcional)">
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </Section>

            <div className="border-t border-border/60 pt-6">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.declaration}
                  onChange={(e) => update("declaration", e.target.checked)}
                  className="mt-1 accent-[color:var(--color-gold,#c9a449)]"
                />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  Declaro que as informações prestadas são verdadeiras e autorizo a comissão de
                  curadoria do THE BOARD a avaliar o meu perfil para efeitos de admissão. *
                </span>
              </label>
              {errors.declaration && (
                <p className="mt-2 text-xs text-destructive">{errors.declaration}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-8 py-4 bg-gradient-gold text-primary-foreground font-medium tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "A submeter…" : "Submeter Candidatura à Mesa"}
              </button>
              <Link
                to="/"
                className="px-8 py-4 border border-gold/40 text-gold text-center text-xs tracking-widest uppercase hover:bg-gold/10 transition"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

const inputCls =
  "w-full bg-background/60 border border-border/60 focus:border-gold focus:outline-none px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <p className="text-[10px] tracking-[0.4em] uppercase text-gold">{title}</p>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
        {label}
      </label>
      {children}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} appearance-none cursor-pointer`}
    >
      <option value="">— Selecionar —</option>
      {options.map((o) => (
        <option key={o} value={o} className="bg-background text-foreground">
          {o}
        </option>
      ))}
    </select>
  );
}

function AdmissionGate({
  variant,
  reference,
}: {
  variant: "no-reference" | "unpaid";
  reference?: string;
}) {
  const isUnpaid = variant === "unpaid";
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-24">
      <div className="max-w-lg w-full text-center border border-gold/40 bg-gradient-to-b from-card/60 to-background p-10 md:p-12 shadow-gold">
        <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
          {isUnpaid ? "Pagamento em validação" : "Reserva necessária"}
        </p>
        <h1 className="font-display text-3xl md:text-4xl leading-tight">
          {isUnpaid ? "Pagamento em validação" : "Reserva necessária para continuar"}
        </h1>
        <div className="hairline-gold mx-auto my-6 max-w-[80px]" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          {isUnpaid
            ? "A sua reserva foi localizada, mas o Formulário de Admissão será liberado apenas após confirmação do pagamento."
            : "O Formulário de Admissão Executiva é liberado apenas após criação de reserva e confirmação de pagamento."}
        </p>
        {isUnpaid && reference ? (
          <p className="mt-4 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            Referência: <span className="text-foreground font-display">{reference}</span>
          </p>
        ) : null}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {isUnpaid && reference ? (
            <Link
              to="/confirmacao/$reference"
              params={{ reference }}
              className="px-8 py-4 bg-gradient-gold text-primary-foreground text-xs tracking-widest uppercase shadow-gold hover:opacity-90 transition"
            >
              Ver estado da reserva
            </Link>
          ) : (
            <Link
              to="/comprar"
              search={{ ticket: "early-investors" as const }}
              className="px-8 py-4 bg-gradient-gold text-primary-foreground text-xs tracking-widest uppercase shadow-gold hover:opacity-90 transition"
            >
              Criar Reserva
            </Link>
          )}
          <Link
            to="/"
            className="px-8 py-4 border border-gold/40 text-gold text-xs tracking-widest uppercase hover:bg-gold/10 transition"
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
