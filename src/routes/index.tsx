import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import { useTickets, useSchedule, useSponsorTiers, useKpis } from "@/hooks/useEventContent";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "THE BOARD — Big Players Forum | Maputo 2026" },
      {
        name: "description",
        content:
          "Fórum executivo de finanças, investimentos e networking. 08 de Agosto de 2026, Hotel ONOMO Maputo. Acesso exclusivo a 200 participantes.",
      },
      { property: "og:title", content: "THE BOARD — Big Players Forum 2026" },
      {
        property: "og:description",
        content:
          "Edição Especial Moçambique & Angola. Onde os grandes players da África Austral se encontram.",
      },
      { property: "og:image", content: heroBg },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const audience = [
  { t: "Investidores & Traders", d: "HNWIs e especialistas em Forex, Índices, Commodities e renda variável." },
  { t: "Empresários & C-Levels", d: "Fundadores e tomadores de decisão a converter lucros em ativos produtivos." },
  { t: "Instituições Financeiras", d: "Bancos, corretoras, fintechs, seguradoras e fundos de Private Equity." },
  { t: "Líderes em Ascensão", d: "Herdeiros e jovens empresários focados em finanças globais e escala." },
];

const experiences = [
  { t: "Board Member Lounge", d: "Refúgio corporativo de acesso estrito, ideal para fecho de contratos com catering de alta gastronomia." },
  { t: "Livro de Atas Executivo", d: "Publicação impressa de alto padrão enviada aos escritórios dos parceiros institucionais." },
  { t: "Painel LED Financeiro Live", d: "Flutuação em tempo real de índices, câmbio (MZN, AOA, USD, EUR) e commodities no palco principal." },
  { t: "Networking Premium Brunch", d: "Intervalo gastronómico em parceria com The Box, em ambiente descontraído e sofisticado." },
  { t: "Photowall & Press Corner", d: "Cobertura mediática regional, entrevistas e registo fotográfico profissional." },
  { t: "Marketplace Exclusivo", d: "Apenas 6 expositores: corretoras, banca, imobiliário de luxo e marcas premium." },
];

const corridorPoints = [
  { label: "Maputo", value: "Capital Room" },
  { label: "Luanda", value: "Institutional Flow" },
  { label: "Mercado", value: "Deal-making" },
];

const navLinks = [
  { href: "#forum", label: "Fórum" },
  { href: "#capital-corridor", label: "Capital" },
  { href: "#agenda", label: "Agenda" },
  { href: "#bilhetes", label: "Bilhetes" },
  { href: "#patrocinios", label: "Patrocínios" },
];

function Landing() {
  const { tickets, error: ticketsError, isEmpty: ticketsEmpty } = useTickets();
  const { schedule, error: scheduleError, isEmpty: scheduleEmpty } = useSchedule();
  const { tiers, error: tiersError, isEmpty: tiersEmpty } = useSponsorTiers();
  const { kpis } = useKpis();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const close = () => setMobileOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden rw-motion-shell">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/75 border-b border-border/40">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="font-display text-lg tracking-[0.25em] text-foreground">
            THE <span className="text-gold">BOARD</span>
          </a>
          <div className="hidden md:flex items-center gap-7 text-xs tracking-widest uppercase text-muted-foreground">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-gold transition">{l.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/comprar"
              search={{ ticket: "early-investors" as const }}
              className="hidden sm:inline-flex text-xs tracking-widest uppercase px-5 py-2.5 border border-gold text-gold hover:bg-gold hover:text-primary-foreground transition"
            >
              Garantir Lugar
            </Link>
            <button
              type="button"
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 border border-gold/40 text-gold"
            >
              <span className={`block w-4 h-px bg-current transition-transform ${mobileOpen ? "translate-y-[3px] rotate-45" : ""}`} />
              <span className={`block w-4 h-px bg-current transition-transform ${mobileOpen ? "-translate-y-[3px] -rotate-45" : ""}`} />
            </button>
          </div>
        </nav>
        {mobileOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md">
            <div className="px-6 py-6 flex flex-col gap-5 text-sm tracking-widest uppercase">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-gold transition">
                  {l.label}
                </a>
              ))}
              <Link to="/comprar" search={{ ticket: "early-investors" as const }} onClick={() => setMobileOpen(false)} className="mt-2 text-center py-3 bg-gradient-gold text-primary-foreground text-xs uppercase tracking-widest shadow-gold">
                Garantir Lugar
              </Link>
              <Link to="/patrocinios" onClick={() => setMobileOpen(false)} className="text-center py-3 border border-gold/60 text-gold text-xs uppercase tracking-widest">
                Tornar-se Parceiro
              </Link>
            </div>
          </div>
        )}
      </header>

      <section id="top" className="relative min-h-screen flex items-center overflow-hidden hero-section">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-34" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/38 via-background/30 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,oklch(0.08_0.005_60_/_0.18)_44%,oklch(0.08_0.005_60)_86%)]" />
        <div className="capital-grid" />
        <MarketSignal />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20 text-center hero-content-layer">
          <div className="reveal-premium hero-edition-badge mx-auto mb-8">
            <span>Edição Especial</span>
            <strong>Moçambique &amp; Angola</strong>
          </div>
          <h1 className="reveal-premium reveal-delay-1 font-display text-6xl md:text-8xl lg:text-9xl leading-[0.95] text-foreground drop-shadow-2xl">
            THE BOARD
          </h1>
          <p className="reveal-premium reveal-delay-2 mt-6 text-sm md:text-base tracking-[0.4em] text-gold uppercase">
            Big Players Forum
          </p>
          <div className="mx-auto mt-10 max-w-md hairline-gold reveal-premium reveal-delay-2" />
          <p className="reveal-premium reveal-delay-3 mt-10 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">
            A plataforma premium de convergência entre os ecossistemas financeiros da África Austral.
            Onde investidores soberanos, traders profissionais e líderes corporativos originam transações reais.
          </p>
          <div className="reveal-premium reveal-delay-3 mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            {[
              { k: "Data", v: "08 Ago 2026" },
              { k: "Local", v: "Hotel ONOMO" },
              { k: "Cidade", v: "Maputo, MZ" },
              { k: "Acesso", v: "200 lugares" },
            ].map((i) => (
              <div key={i.k} className="hero-fact-card">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold/70">{i.k}</p>
                <p className="mt-1 font-display text-xl text-foreground">{i.v}</p>
              </div>
            ))}
          </div>
          <div className="reveal-premium reveal-delay-3 mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#bilhetes" className="px-8 py-4 bg-gradient-gold text-primary-foreground font-medium tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition">
              Garantir Lugar
            </a>
            <Link to="/patrocinios" className="px-8 py-4 border border-gold/60 text-gold font-medium tracking-widest text-xs uppercase hover:bg-gold/10 transition">
              Tornar-se Parceiro
            </Link>
          </div>
        </div>
      </section>

      <CapitalCorridor kpis={kpis} />

      <section id="forum" className="py-28 relative scroll-mt-24 rw-section">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-4 reveal-premium">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">01 — A Sala</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">
              Mais do que uma <em className="text-gold not-italic">conferência</em>.
              Uma sala de decisões.
            </h2>
          </div>
          <div className="md:col-span-8 space-y-6 text-muted-foreground leading-relaxed reveal-premium reveal-delay-1">
            <p>
              O <span className="text-foreground font-medium">THE BOARD — Big Players Forum</span> reúne investidores privados,
              traders de nível profissional, family offices, instituições financeiras de vanguarda e líderes
              corporativos que ditam o ritmo económico da África Austral.
            </p>
            <p>
              Um ambiente restrito focado na tomada de decisões soberanas, originação de transações reais
              (deal-making) e transferência de conhecimento altamente especializado entre Moçambique e Angola.
            </p>
            <div className="border-l-2 border-gold pl-6 mt-8 premium-card">
              <p className="text-foreground italic font-display text-xl leading-snug">
                "100% da audiência possui perfil decisor ou investidor — a camada mais líquida da economia activa de ambos os países."
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-card/30 border-y border-border/40 rw-section">
        <div className="max-w-6xl mx-auto px-6">
          <SectionTitle eyebrow="02 — Os Players" title="Quem ocupa a sala" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/30 reveal-premium reveal-delay-1">
            {audience.map((a, i) => (
              <div key={i} className="bg-background p-8 hover:bg-card transition group premium-card">
                <div className="font-display text-3xl text-gold mb-4">0{i + 1}</div>
                <h3 className="font-display text-xl mb-3">{a.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="agenda" className="py-28 scroll-mt-24 rw-section">
        <div className="max-w-5xl mx-auto px-6">
          <SectionTitle eyebrow="03 — A Sessão" title="O dia em que o mercado se encontra" description="08 de Agosto de 2026 · Hotel ONOMO Maputo" />
          {scheduleError ? (
            <p className="text-center text-sm text-destructive">{scheduleError}</p>
          ) : scheduleEmpty ? (
            <p className="text-center text-sm text-muted-foreground">Agenda em preparação.</p>
          ) : (
            <div className="relative reveal-premium reveal-delay-1">
              <div className="absolute left-[72px] md:left-[120px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
              <ul className="space-y-10">
                {schedule.map((s, i) => (
                  <li key={i} className="grid grid-cols-[72px_1fr] md:grid-cols-[120px_1fr] gap-6 md:gap-8 items-start premium-card">
                    <div className="relative">
                      <p className="font-display text-xl md:text-3xl text-gold">{s.time}</p>
                      <span className="absolute -right-2 top-3 w-3 h-3 rounded-full bg-gold ring-4 ring-background" />
                    </div>
                    <div className="pl-4 md:pl-6">
                      <h3 className="font-display text-lg md:text-2xl text-foreground">{s.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section id="bilhetes" className="py-28 bg-card/30 border-y border-border/40 scroll-mt-24 rw-section">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle eyebrow="04 — O Acesso" title="Garanta o seu acesso" description="Capacidade rigorosamente limitada. Preços em meticais (MT)." />
          {ticketsError ? (
            <p className="text-center text-sm text-destructive">{ticketsError}</p>
          ) : ticketsEmpty ? (
            <p className="text-center text-sm text-muted-foreground">Bilhetes em preparação.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 reveal-premium reveal-delay-1">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className={`relative p-8 flex flex-col border premium-card ticket-card ${
                    t.featured
                      ? "border-gold bg-gradient-to-b from-card to-background shadow-gold"
                      : t.available
                      ? "border-gold/60 bg-background"
                      : "border-border/40 bg-background hover:border-gold/40 transition"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4 ticket-card__header">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-gold/80">{t.tag}</p>
                    {t.featured && <span className="ticket-status ticket-status--solid">Recomendado</span>}
                    {t.available && !t.featured && <span className="ticket-status ticket-status--outline">À venda</span>}
                  </div>
                  <h3 className="font-display text-2xl">{t.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 min-h-[40px]">{t.description}</p>
                  <div className="mt-6 mb-6">
                    <p className="font-display text-4xl text-foreground">{t.priceLabel} <span className="text-base text-muted-foreground">{t.priceCurrency}</span></p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-6 mt-auto">{t.seats}</p>
                  {t.available && (t.id === "early-investors" || t.id === "vip-board") ? (
                    <Link
                      to="/comprar"
                      search={{ ticket: t.id as "early-investors" | "vip-board" }}
                      className={`text-center py-3 text-xs tracking-widest uppercase transition ${t.featured ? "bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold" : "border border-gold text-gold hover:bg-gold/10"}`}
                    >
                      {t.id === "vip-board" ? "Reservar VIP" : "Comprar"}
                    </Link>
                  ) : (
                    <span className="text-center py-3 text-xs tracking-widest uppercase border border-border/60 text-muted-foreground cursor-not-allowed">Em breve</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-28 rw-section">
        <div className="max-w-6xl mx-auto px-6">
          <SectionTitle eyebrow="05 — A Experiência" title="Premium agregada" />
          <div className="grid md:grid-cols-2 gap-px bg-border/30 reveal-premium reveal-delay-1">
            {experiences.map((e) => (
              <div key={e.t} className="bg-background p-8 group premium-card">
                <div className="flex items-start gap-4">
                  <span className="text-gold font-display text-2xl">◆</span>
                  <div>
                    <h3 className="font-display text-xl">{e.t}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{e.d}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="patrocinios" className="py-28 bg-card/30 border-y border-border/40 scroll-mt-24 rw-section">
        <div className="max-w-6xl mx-auto px-6">
          <SectionTitle eyebrow="06 — As Parcerias" title="Cotas institucionais" description="Três níveis hierárquicos rígidos desenhados para máxima visibilidade setorial." />
          {tiersError ? (
            <p className="text-center text-sm text-destructive">{tiersError}</p>
          ) : tiersEmpty ? (
            <p className="text-center text-sm text-muted-foreground">Patrocínios em preparação.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 reveal-premium reveal-delay-1">
              {tiers.map((s) => (
                <div key={s.id} className={`relative p-10 flex flex-col border premium-card ${s.highlight ? "border-gold bg-gradient-to-b from-card via-background to-background shadow-elegant" : "border-border/40 bg-background"}`}>
                  <p className="font-display text-3xl tracking-[0.2em] text-gradient-gold">{s.tier}</p>
                  <div className="mt-2 hairline-gold max-w-[60px]" />
                  <p className="text-xs tracking-widest uppercase text-muted-foreground mt-4">{s.slots}</p>
                  <p className="font-display text-5xl text-foreground mt-6">{s.priceLabel} <span className="text-base text-muted-foreground">{s.priceCurrency}</span></p>
                  <ul className="mt-8 space-y-3 flex-1">
                    {s.perks.map((p, i) => (
                      <li key={i} className="flex gap-3 text-sm text-muted-foreground"><span className="text-gold mt-1">—</span><span>{p}</span></li>
                    ))}
                  </ul>
                  <Link to="/patrocinios" search={{ tier: s.id }} className={`mt-10 py-3 text-center text-xs tracking-widest uppercase transition ${s.highlight ? "bg-gradient-gold text-primary-foreground hover:opacity-90" : "border border-gold/40 text-gold hover:bg-gold/10"}`}>
                    Solicitar proposta
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="contacto" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="capital-grid opacity-25" />
        <div className="relative max-w-3xl mx-auto px-6 text-center reveal-premium">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-6">Acesso confidencial</p>
          <h2 className="font-display text-4xl md:text-6xl leading-tight">
            Posicione-se no <span className="text-gradient-gold">topo</span> do mercado financeiro regional.
          </h2>
          <p className="mt-6 text-muted-foreground text-lg">
            Os lugares são limitados e atribuídos por critério de elegibilidade. Garanta a sua reserva ou solicite o dossier de patrocínio.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/comprar" search={{ ticket: "early-investors" as const }} className="px-10 py-5 bg-gradient-gold text-primary-foreground font-medium tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition">
              Garantir Lugar
            </Link>
            <Link to="/patrocinios" className="px-10 py-5 border border-gold/60 text-gold font-medium tracking-widest text-xs uppercase hover:bg-gold/10 transition">
              Dossier de Patrocínio
            </Link>
          </div>
          <p className="mt-10 text-xs tracking-[0.3em] uppercase text-muted-foreground">Direção Executiva · Maputo, Junho de 2026</p>
        </div>
      </section>

      <footer className="border-t border-border/40 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-6 justify-between items-center text-xs text-muted-foreground">
          <p className="font-display tracking-[0.25em] text-foreground">THE <span className="text-gold">BOARD</span> · BIG PLAYERS FORUM</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 justify-center tracking-widest uppercase text-[10px]">
            <a href="#capital-corridor" className="hover:text-gold transition">Capital</a>
            <a href="#bilhetes" className="hover:text-gold transition">Bilhetes</a>
            <Link to="/patrocinios" className="hover:text-gold transition">Patrocínios</Link>
            <a href="mailto:reservas@theboard-forum.com" className="hover:text-gold transition">Contacto</a>
          </nav>
          <p className="tracking-widest uppercase">© 2026 · Edição Moçambique &amp; Angola</p>
        </div>
      </footer>
    </div>
  );
}

function CapitalCorridor({ kpis }: { kpis: Array<{ value: string; label: string }> }) {
  return (
    <section id="capital-corridor" className="relative overflow-hidden border-y border-border/40 bg-background py-24 md:py-28 scroll-mt-24 capital-corridor">
      <div className="capital-corridor__map" aria-hidden="true" />
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
          <div className="reveal-premium">
            <p className="text-[10px] tracking-[0.45em] uppercase text-gold mb-5">Capital Corridor</p>
            <h2 className="font-display text-4xl md:text-6xl leading-tight">
              Moçambique <span className="text-gradient-gold">×</span> Angola no mesmo tabuleiro.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed text-base md:text-lg max-w-xl">
              Dois mercados. Uma sala. Capital, conhecimento e influência reunidos num ambiente reservado para decisões de alto valor.
            </p>
          </div>

          <div className="capital-corridor__panel reveal-premium reveal-delay-1">
            <div className="capital-corridor__axis" />
            <div className="grid sm:grid-cols-3 gap-4">
              {corridorPoints.map((point) => (
                <div key={point.label} className="capital-corridor__node">
                  <p>{point.label}</p>
                  <strong>{point.value}</strong>
                </div>
              ))}
            </div>
            <p className="mt-8 text-xs tracking-[0.28em] uppercase text-gold/75">
              Deal flow · Instituições · Investors · Market intelligence
            </p>
          </div>
        </div>

        <div className="capital-kpi-strip reveal-premium reveal-delay-2">
          {kpis.map((k) => (
            <div key={k.label} className="capital-kpi-strip__item">
              <strong>{k.value}</strong>
              <span>{k.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketSignal() {
  return (
    <div className="market-signal" aria-hidden="true">
      <div className="market-signal__line" />
      <div className="market-signal__candles">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} style={{ "--i": i } as CSSProperties} />
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="text-center mb-14 reveal-premium">
      <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">{eyebrow}</p>
      <h2 className="font-display text-4xl md:text-5xl">{title}</h2>
      {description && <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{description}</p>}
    </div>
  );
}
