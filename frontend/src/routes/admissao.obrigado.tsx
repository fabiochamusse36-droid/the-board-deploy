import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admissao/obrigado")({
  head: () => ({
    meta: [
      { title: "Candidatura recebida — THE BOARD 2026" },
      {
        name: "description",
        content:
          "A sua candidatura à mesa do THE BOARD foi recebida. A Direção Executiva entrará em contacto.",
      },
      { property: "og:title", content: "Candidatura recebida — THE BOARD 2026" },
      {
        property: "og:description",
        content: "Obrigado por candidatar-se ao Big Players Forum, Maputo 2026.",
      },
    ],
  }),
  component: ObrigadoPage,
});

const phases = [
  {
    k: "Fase 1",
    t: "Validação de pagamento",
    d: "A equipa confirma a referência de pagamento associada à sua reserva.",
  },
  {
    k: "Fase 2",
    t: "Análise de perfil",
    d: "A comissão avalia o perfil, categoria pretendida e enquadramento com a experiência do evento.",
  },
  {
    k: "Fase 3",
    t: "Credencial ou reembolso",
    d: "Caso aprovado, a credencial oficial será emitida. Caso o perfil não seja elegível, o valor será reembolsado conforme a política do evento.",
  },
];

function ObrigadoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-lg tracking-[0.25em] text-foreground">
            THE <span className="text-gold">BOARD</span>
          </Link>
          <Link
            to="/"
            className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-gold transition"
          >
            ← Início
          </Link>
        </nav>
      </header>

      <section className="relative min-h-screen flex items-center pt-24 pb-20">
        <div className="absolute inset-0 bg-gradient-dark opacity-80 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block px-4 py-1.5 border border-gold/60 text-gold text-[10px] tracking-[0.35em] uppercase">
            Candidatura Registada
          </span>
          <h1 className="font-display text-4xl md:text-6xl mt-8 leading-tight">
            Candidatura recebida com <span className="text-gradient-gold">sucesso</span>.
          </h1>

          <div className="mx-auto mt-10 max-w-xs hairline-gold" />

          <p className="mt-10 text-base md:text-lg text-muted-foreground leading-relaxed">
            Os seus dados foram enviados para análise da Direção Executiva do THE BOARD. A sua
            reserva permanece sujeita à validação final do perfil.
          </p>



          <div className="mt-12 grid sm:grid-cols-3 gap-4 text-left">
            {phases.map((p) => (
              <div key={p.k} className="border-l border-gold/40 pl-4 py-2">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold/80">{p.k}</p>
                <p className="mt-1 font-display text-lg text-foreground">{p.t}</p>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-8 py-4 bg-gradient-gold text-primary-foreground font-medium tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition"
            >
              Voltar ao início
            </Link>
            <Link
              to="/"
              hash="agenda"
              className="px-8 py-4 border border-gold/60 text-gold font-medium tracking-widest text-xs uppercase hover:bg-gold/10 transition"
            >
              Ver agenda
            </Link>
            <a
              href="mailto:reservas@theboard-forum.com?subject=Contacto admissão"
              className="px-8 py-4 border border-border/60 text-muted-foreground font-medium tracking-widest text-xs uppercase hover:text-gold hover:border-gold/40 transition"
            >
              Contactar organização
            </a>
          </div>

          <p className="mt-16 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            Direção Executiva · Maputo, Junho de 2026
          </p>
        </div>
      </section>
    </div>
  );
}
