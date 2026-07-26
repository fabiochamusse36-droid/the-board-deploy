import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { createSponsorInquiry } from "@/lib/sponsors.functions";
import { useSponsorTiers } from "@/hooks/useEventContent";

export const Route = createFileRoute("/patrocinios")({
  head: () => ({
    meta: [
      { title: "Parcerias Institucionais — THE BOARD 2026" },
      { name: "description", content: "Pedido institucional para análise de parceria e acesso controlado ao dossier de patrocínio do THE BOARD Big Players Forum 2026." },
      { property: "og:title", content: "Parcerias Institucionais — THE BOARD 2026" },
      { property: "og:description", content: "Cotas Master, Gold, Silver e propostas personalizadas para instituições e marcas estratégicas." },
    ],
  }),
  component: SponsorsPage,
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center bg-background text-foreground">
      <div>
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Erro</p>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        <button onClick={reset} className="px-6 py-3 border border-gold text-gold text-xs tracking-widest uppercase">Tentar de novo</button>
      </div>
    </div>
  ),
  notFoundComponent: () => <div className="p-10">Página não encontrada</div>,
});

type TierId = "master" | "gold" | "silver" | "custom";

const tierDescriptions: Record<TierId, string> = {
  master: "Presença máxima para marcas que querem liderar a sala, o palco e a narrativa institucional do evento.",
  gold: "Exposição premium para instituições com interesse comercial e reputacional junto da audiência executiva.",
  silver: "Entrada estratégica para marcas que procuram presença qualificada e relacionamento direcionado.",
  custom: "Estrutura sob medida para bancos, corretoras, fintechs, media partners, grupos empresariais e instituições públicas.",
};

function SponsorsPage() {
  const navigate = useNavigate();
  const { tiers, error: tiersError } = useSponsorTiers();
  const submit = useServerFn(createSponsorInquiry);
  const initialTier = (typeof window !== "undefined"
    ? (new URLSearchParams(window.location.search).get("tier") as TierId | null)
    : null) ?? "master";

  const [form, setForm] = useState({
    tier: initialTier as TierId,
    company: "",
    contact_name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reference?: string } | null>(null);

  const options = useMemo(
    () => [...tiers.map((t) => ({ id: t.id as TierId, label: t.tier })), { id: "custom" as TierId, label: "Personalizado" }],
    [tiers],
  );
  const selectedTier = tiers.find((t) => t.id === form.tier);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await submit({ data: form });
      setDone({ reference: res.inquiryReference });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar pedido de parceria");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-gold mb-6">
            <span className="text-gold font-display text-2xl">✓</span>
          </div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Pedido institucional recebido</p>
          <h1 className="font-display text-3xl md:text-5xl">Parceria em análise</h1>
          {done.reference && <p className="mt-5 text-xs tracking-[0.25em] uppercase text-muted-foreground">Referência: <span className="text-gold">{done.reference}</span></p>}
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Recebemos o pedido institucional da sua empresa. A Direção Comercial do THE BOARD irá analisar o enquadramento da marca, o nível de interesse indicado e a disponibilidade de cotas.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            O dossier institucional completo não é disponibilizado automaticamente. Caso exista alinhamento com a curadoria do evento, a equipa entrará em contacto com o dossier adequado e a proposta comercial correspondente.
          </p>
          <div className="mt-8 border border-gold/25 bg-gold/5 p-4 text-left">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Próxima etapa</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Em produção, será enviado um email de confirmação via Resend informando que o pedido foi recebido e está sob análise comercial.
            </p>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate({ to: "/" })}
              className="px-6 py-3 border border-gold text-gold text-xs tracking-widest uppercase hover:bg-gold/10 transition"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-gold">← Voltar</Link>

        <div className="mt-10 mb-12 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Parcerias institucionais</p>
          <h1 className="font-display text-4xl md:text-6xl leading-tight">Análise de Patrocínio</h1>
          <p className="mt-5 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Para bancos, corretoras, fintechs, gestoras, grupos empresariais e marcas que pretendem estar posicionadas diante de uma sala de decisão. O dossier completo é enviado apenas após enquadramento institucional.
          </p>
        </div>

        {tiersError && <p className="text-center text-sm text-destructive mb-8">{tiersError}</p>}

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 lg:gap-8 items-start">
          <aside className="space-y-5">
            <div className="border border-gold/40 bg-gradient-to-b from-card to-background p-6 md:p-8 shadow-gold">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-5">Processo comercial</p>
              <ol className="space-y-5 text-sm text-muted-foreground">
                <ProcessStep n="01" title="Enquadramento" body="A marca indica o nível de interesse e o perfil institucional." />
                <ProcessStep n="02" title="Análise" body="A Direção Comercial avalia aderência, categoria, disponibilidade e prioridade de cota." />
                <ProcessStep n="03" title="Dossier" body="Caso exista alinhamento, a equipa envia o dossier institucional e a proposta adequada." />
              </ol>
            </div>

            <div className="border border-border/50 bg-card/30 p-6">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-4">Cotas disponíveis</p>
              <div className="space-y-3">
                {tiers.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setForm({ ...form, tier: tier.id as TierId })}
                    className={`w-full text-left border p-4 transition ${form.tier === tier.id ? "border-gold bg-gold/10" : "border-border/50 hover:border-gold/40"}`}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-display text-lg">{tier.tier}</span>
                      <span className="text-gold text-sm">{tier.priceLabel} {tier.priceCurrency}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{tier.slots}</p>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <form onSubmit={onSubmit} className="space-y-6 border border-border/40 bg-card/40 p-6 md:p-10">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Nível de interesse</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setForm({ ...form, tier: opt.id })}
                    className={`py-3 text-xs tracking-widest uppercase border transition ${
                      form.tier === opt.id ? "border-gold text-gold bg-gold/10" : "border-border/60 text-muted-foreground hover:border-gold/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="mt-5 border border-gold/20 bg-gold/5 p-4 text-sm text-muted-foreground leading-relaxed">
                <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-2">{selectedTier?.tier ?? "Personalizado"}</p>
                <p>{tierDescriptions[form.tier]}</p>
                {selectedTier && (
                  <ul className="mt-4 space-y-2 text-xs">
                    {selectedTier.perks.slice(0, 4).map((perk) => <li key={perk}>• {perk}</li>)}
                  </ul>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Empresa">
                <input required minLength={2} maxLength={160} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Pessoa de contacto">
                <input required minLength={2} maxLength={120} value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className={inputCls} />
              </Field>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Email institucional">
                <input type="email" required maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Telefone / WhatsApp">
                <input type="tel" maxLength={40} placeholder="+258 84 000 0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
              </Field>
            </div>

            <Field label="Objetivo da parceria">
              <textarea
                maxLength={2000}
                rows={5}
                placeholder="Ex.: visibilidade institucional, captação de clientes premium, lançamento de produto, presença executiva, relacionamento com investidores..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={`${inputCls} resize-y`}
              />
            </Field>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-gold text-primary-foreground tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "A enviar pedido…" : "Solicitar análise institucional"}
            </button>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Confidencial. Este pedido não representa compra automática de cota nem liberação automática do dossier; a parceria é analisada e confirmada pela Direção Comercial do evento.
            </p>
          </form>
        </div>
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

function ProcessStep({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="grid grid-cols-[2.5rem_1fr] gap-4">
      <span className="text-gold text-[10px] tracking-[0.25em] uppercase">{n}</span>
      <span>
        <span className="block text-foreground text-xs tracking-[0.25em] uppercase mb-1">{title}</span>
        <span className="block leading-relaxed">{body}</span>
      </span>
    </li>
  );
}