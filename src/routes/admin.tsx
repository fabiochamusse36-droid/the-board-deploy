import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Executivo — THE BOARD 2026" },
      { name: "description", content: "Painel de gestão executiva do THE BOARD Big Players Forum 2026." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

const cards: { k: string; label: string; hint: string }[] = [
  { k: "reservas", label: "Reservas criadas", hint: "Total de reservas provisórias registadas." },
  { k: "pendentes", label: "Pagamentos pendentes", hint: "Aguardando validação da transação." },
  { k: "confirmados", label: "Pagamentos confirmados", hint: "Transações validadas e associadas a reservas." },
  { k: "admissoes", label: "Admissões submetidas", hint: "Formulários de admissão recebidos." },
  { k: "vip", label: "VIPs em análise", hint: "Candidaturas Board Member sob revisão executiva." },
  { k: "patrocinadores", label: "Patrocinadores", hint: "Pedidos de proposta recebidos." },
  { k: "reembolsos", label: "Reembolsos", hint: "Casos abertos conforme política do evento." },
  { k: "credenciais", label: "Credenciais", hint: "Credenciais emitidas para o dia do evento." },
];

function AdminPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-lg tracking-[0.25em]">
            THE <span className="text-gold">BOARD</span>
          </Link>
          <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            Painel Executivo
          </span>
        </nav>
      </header>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Área restrita</p>
            <h1 className="font-display text-4xl md:text-5xl">Painel Executivo</h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
              Vista geral do funil de reservas, admissões e patrocínios. Os indicadores serão
              alimentados assim que a integração com o backend for concluída.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/30">
            {cards.map((c) => (
              <div key={c.k} className="bg-background p-6">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold/80">{c.label}</p>
                <p className="font-display text-4xl mt-3 text-gradient-gold">—</p>
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{c.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 border border-border/40 bg-card/40 p-6 text-xs text-muted-foreground leading-relaxed">
            Área futura para gestão interna da organização. Será integrada ao backend, gateway,
            pagamentos, admissões e credenciais.
          </div>
        </div>
      </section>
    </div>
  );
}
