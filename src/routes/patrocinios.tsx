import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { createSponsorInquiry } from "@/lib/sponsors.functions";
import { useSponsorTiers } from "@/hooks/useEventContent";

export const Route = createFileRoute("/patrocinios")({
  head: () => ({
    meta: [
      { title: "Candidatura a Patrocínio — THE BOARD 2026" },
      { name: "description", content: "Solicite o dossier de patrocínio do The Board Forum 2026 — Master, Gold, Silver." },
      { property: "og:title", content: "Patrocínios — THE BOARD 2026" },
      { property: "og:description", content: "Três níveis de cotas institucionais. Visibilidade premium na África Austral." },
    ],
  }),
  component: SponsorsPage,
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

type TierId = "master" | "gold" | "silver" | "custom";

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
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await submit({ data: form });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar candidatura");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-gold mb-6">
            <span className="text-gold font-display text-2xl">✓</span>
          </div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Candidatura recebida</p>
          <h1 className="font-display text-3xl md:text-4xl">Obrigado pelo seu interesse</h1>
          <p className="mt-4 text-muted-foreground">
            A nossa direção comercial entrará em contacto em até 48h úteis com o dossier completo
            e proposta personalizada.
          </p>
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
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-gold">← Voltar</Link>

        <div className="mt-10 mb-12 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Cotas institucionais</p>
          <h1 className="font-display text-4xl md:text-5xl">Candidatura a Patrocínio</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Selecione o nível e envie os seus dados. Receberá o dossier completo e proposta personalizada.
          </p>
        </div>

        {tiersError && (
          <p className="text-center text-sm text-destructive mb-8">{tiersError}</p>
        )}

        <form onSubmit={onSubmit} className="space-y-6 border border-border/40 bg-card/40 p-6 md:p-10">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Nível de patrocínio</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[...tiers.map(t => ({ id: t.id as TierId, label: t.tier })), { id: "custom" as TierId, label: "Personalizado" }].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setForm({ ...form, tier: opt.id })}
                  className={`py-3 text-xs tracking-widest uppercase border transition ${
                    form.tier === opt.id
                      ? "border-gold text-gold bg-gold/10"
                      : "border-border/60 text-muted-foreground hover:border-gold/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Empresa</label>
              <input
                required minLength={2} maxLength={160}
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full mt-2 bg-background border border-border/60 px-4 py-3 focus:border-gold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Pessoa de contacto</label>
              <input
                required minLength={2} maxLength={120}
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                className="w-full mt-2 bg-background border border-border/60 px-4 py-3 focus:border-gold outline-none"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Email</label>
              <input
                type="email" required maxLength={255}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full mt-2 bg-background border border-border/60 px-4 py-3 focus:border-gold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Telefone (opcional)</label>
              <input
                type="tel" maxLength={40}
                placeholder="+258 84 000 0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full mt-2 bg-background border border-border/60 px-4 py-3 focus:border-gold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Mensagem (opcional)</label>
            <textarea
              maxLength={2000} rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full mt-2 bg-background border border-border/60 px-4 py-3 focus:border-gold outline-none resize-y"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-gold text-primary-foreground tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "A enviar…" : "Enviar candidatura"}
          </button>
          <p className="text-xs text-muted-foreground text-center">
            Confidencial. Os dados são utilizados exclusivamente pela direção comercial do evento.
          </p>
        </form>
      </div>
    </div>
  );
}
