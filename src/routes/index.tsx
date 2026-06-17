import { createFileRoute, Link } from "@tanstack/react-router";
import heroBg from "@/assets/hero-bg.jpg";

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

const tickets = [
  { name: "Early Investors", price: "2.500", desc: "Acesso geral antecipado", tag: "Lote 1", seats: "50 lugares" },
  { name: "Executive Access", price: "3.500", desc: "Acesso geral padrão", tag: "Lote 2", seats: "100 lugares", featured: true },
  { name: "Last Call", price: "5.000", desc: "Acesso geral de última hora", tag: "Lote 3", seats: "30 lugares" },
  { name: "VIP Board Member", price: "7.500", desc: "Lounge exclusivo + jantar", tag: "VIP", seats: "20 lugares" },
  { name: "Streaming Premium", price: "1.500", desc: "Acesso digital global", tag: "Online", seats: "Ilimitado" },
];

const schedule = [
  { time: "08:30", title: "Recepção Executiva & Credenciamento", desc: "Entrega de credenciais premium no Foyer." },
  { time: "09:00", title: "Cerimónia Oficial de Abertura", desc: "Contextualização macroeconómica do fórum." },
  { time: "09:10", title: "Painel I — The Market Makers", desc: "Fluxos institucionais e fronteiras regionais." },
  { time: "10:10", title: "Painel II — Capital & Escala", desc: "Alocação avançada e ativos reais." },
  { time: "11:00", title: "Power Networking Coffee", desc: "Marketplace com facilitação comercial." },
  { time: "11:40", title: "The Boardroom Session", desc: "Mesa redonda consultiva e fechada." },
  { time: "12:45", title: "Encerramento Oficial", desc: "Notas finais e balanço de indicadores." },
];

const sponsorTiers = [
  {
    tier: "MASTER",
    price: "300.000",
    slots: "1 cota — exclusividade de setor",
    perks: ["Naming Partner do evento", "Keynote institucional de abertura", "Stand premium de 1ª linha", "10 bilhetes VIP Board Member", "Destaque em todas as campanhas"],
    highlight: true,
  },
  {
    tier: "GOLD",
    price: "150.000",
    slots: "2 cotas disponíveis",
    perks: ["Logótipo em backdrops oficiais", "Stand dedicado no Marketplace", "6 bilhetes VIP Board Member", "Menções pelo Mestre de Cerimónias"],
  },
  {
    tier: "SILVER",
    price: "75.000",
    slots: "3 cotas disponíveis",
    perks: ["Logótipo em materiais oficiais", "4 bilhetes VIP Board Member", "Carrossel em redes sociais oficiais"],
  },
];

const kpis = [
  { n: "200", l: "Participantes presenciais" },
  { n: "10K+", l: "Alcance digital estimado" },
  { n: "05", l: "Parceiros estratégicos" },
  { n: "2M+", l: "Faturação alvo (MT)" },
  { n: "90%+", l: "Taxa de satisfação" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="font-display text-lg tracking-[0.25em] text-foreground">
            THE <span className="text-gold">BOARD</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase text-muted-foreground">
            <a href="#forum" className="hover:text-gold transition">Fórum</a>
            <a href="#agenda" className="hover:text-gold transition">Agenda</a>
            <a href="#bilhetes" className="hover:text-gold transition">Bilhetes</a>
            <a href="#patrocinios" className="hover:text-gold transition">Patrocínios</a>
          </div>
          <a href="#bilhetes" className="text-xs tracking-widest uppercase px-5 py-2.5 border border-gold text-gold hover:bg-gold hover:text-primary-foreground transition">
            Reservar
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section id="top" className="relative min-h-screen flex items-center overflow-hidden">
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="absolute inset-0 bg-gradient-dark opacity-70" />

        <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-20 text-center">
          <p className="text-[10px] md:text-xs tracking-[0.5em] text-gold uppercase mb-8">
            Edição Especial · Moçambique &amp; Angola
          </p>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.95] text-foreground">
            THE BOARD
          </h1>
          <p className="mt-6 text-sm md:text-base tracking-[0.4em] text-gold uppercase">
            Big Players Forum
          </p>

          <div className="mx-auto mt-10 max-w-md hairline-gold" />

          <p className="mt-10 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">
            A plataforma premium de convergência entre os ecossistemas financeiros da África Austral.
            Onde investidores soberanos, traders profissionais e líderes corporativos originam transações reais.
          </p>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-left">
            {[
              { k: "Data", v: "08 Ago 2026" },
              { k: "Local", v: "Hotel ONOMO" },
              { k: "Cidade", v: "Maputo, MZ" },
              { k: "Acesso", v: "200 lugares" },
            ].map((i) => (
              <div key={i.k} className="border-l border-gold/40 pl-4">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold/70">{i.k}</p>
                <p className="mt-1 font-display text-xl text-foreground">{i.v}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#bilhetes" className="px-8 py-4 bg-gradient-gold text-primary-foreground font-medium tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition">
              Garantir Lugar
            </a>
            <a href="#patrocinios" className="px-8 py-4 border border-gold/60 text-gold font-medium tracking-widest text-xs uppercase hover:bg-gold/10 transition">
              Tornar-se Parceiro
            </a>
          </div>
        </div>
      </section>

      {/* VISION */}
      <section id="forum" className="py-32 relative">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-4">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">01 — Visão</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">
              Mais do que uma <em className="text-gold not-italic">conferência</em>.
              Uma sala de decisões.
            </h2>
          </div>
          <div className="md:col-span-8 space-y-6 text-muted-foreground leading-relaxed">
            <p>
              O <span className="text-foreground font-medium">THE BOARD — Big Players Forum</span> reúne investidores privados,
              traders de nível profissional, family offices, instituições financeiras de vanguarda e líderes
              corporativos que ditam o ritmo económico da África Austral.
            </p>
            <p>
              Um ambiente restrito focado na tomada de decisões soberanas, originação de transações reais
              (deal-making) e transferência de conhecimento altamente especializado entre Moçambique e Angola.
            </p>
            <div className="border-l-2 border-gold pl-6 mt-8">
              <p className="text-foreground italic font-display text-xl leading-snug">
                "100% da audiência possui perfil decisor ou investidor — a camada mais líquida da economia activa de ambos os países."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="py-24 bg-card/40 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">02 — Audiência</p>
            <h2 className="font-display text-4xl md:text-5xl">Perfil dos participantes</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border/30">
            {[
              { t: "Investidores & Traders", d: "HNWIs e especialistas em Forex, Índices, Commodities e renda variável." },
              { t: "Empresários & C-Levels", d: "Fundadores e tomadores de decisão a converter lucros em ativos produtivos." },
              { t: "Instituições Financeiras", d: "Bancos, corretoras, fintechs, seguradoras e fundos de Private Equity." },
              { t: "Líderes em Ascensão", d: "Herdeiros e jovens empresários focados em finanças globais e escala." },
            ].map((a, i) => (
              <div key={i} className="bg-background p-8 hover:bg-card transition group">
                <div className="font-display text-3xl text-gold mb-4">0{i + 1}</div>
                <h3 className="font-display text-xl mb-3">{a.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AGENDA */}
      <section id="agenda" className="py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-16 text-center">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">03 — Agenda</p>
            <h2 className="font-display text-4xl md:text-5xl">Cronograma executivo</h2>
            <p className="mt-4 text-muted-foreground">08 de Agosto de 2026 · Hotel ONOMO Maputo</p>
          </div>
          <div className="relative">
            <div className="absolute left-[88px] md:left-[120px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
            <ul className="space-y-10">
              {schedule.map((s, i) => (
                <li key={i} className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-8 items-start">
                  <div className="relative">
                    <p className="font-display text-2xl md:text-3xl text-gold">{s.time}</p>
                    <span className="absolute -right-2 top-3 w-3 h-3 rounded-full bg-gold ring-4 ring-background" />
                  </div>
                  <div className="pl-6">
                    <h3 className="font-display text-xl md:text-2xl text-foreground">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* TICKETS */}
      <section id="bilhetes" className="py-32 bg-card/40 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">04 — Bilhética</p>
            <h2 className="font-display text-4xl md:text-5xl">Garanta o seu acesso</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Capacidade rigorosamente limitada. Preços em meticais (MT).
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {tickets.map((t) => {
              const isEarly = t.name === "Early Investors";
              return (
              <div
                key={t.name}
                className={`relative p-8 flex flex-col border ${
                  t.featured
                    ? "border-gold bg-gradient-to-b from-card to-background shadow-gold"
                    : isEarly
                    ? "border-gold/60 bg-background"
                    : "border-border/40 bg-background hover:border-gold/40 transition"
                }`}
              >
                {t.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gold text-primary-foreground text-[10px] tracking-widest uppercase">
                    Recomendado
                  </span>
                )}
                {isEarly && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-background border border-gold text-gold text-[10px] tracking-widest uppercase">
                    À venda
                  </span>
                )}
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold/80">{t.tag}</p>
                <h3 className="font-display text-2xl mt-3">{t.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 min-h-[40px]">{t.desc}</p>
                <div className="mt-6 mb-6">
                  <p className="font-display text-4xl text-foreground">
                    {t.price} <span className="text-base text-muted-foreground">MT</span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mb-6 mt-auto">{t.seats}</p>
                {isEarly ? (
                  <Link
                    to="/comprar"
                    className="text-center py-3 text-xs tracking-widest uppercase transition bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold"
                  >
                    Comprar
                  </Link>
                ) : (
                  <span
                    className="text-center py-3 text-xs tracking-widest uppercase border border-border/60 text-muted-foreground cursor-not-allowed"
                  >
                    Em breve
                  </span>
                )}
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">05 — Experiência</p>
            <h2 className="font-display text-4xl md:text-5xl">Premium agregada</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-border/30">
            {[
              { t: "Board Member Lounge", d: "Refúgio corporativo de acesso estrito, ideal para fecho de contratos com catering de alta gastronomia." },
              { t: "Livro de Atas Executivo", d: "Publicação impressa de alto padrão enviada aos escritórios dos parceiros institucionais." },
              { t: "Painel LED Financeiro Live", d: "Flutuação em tempo real de índices, câmbio (MZN, AOA, USD, EUR) e commodities no palco principal." },
              { t: "Networking Premium Brunch", d: "Intervalo gastronómico em parceria com The Box, em ambiente descontraído e sofisticado." },
              { t: "Photowall & Press Corner", d: "Cobertura mediática regional, entrevistas e registo fotográfico profissional." },
              { t: "Marketplace Exclusivo", d: "Apenas 6 expositores: corretoras, banca, imobiliário de luxo e marcas premium." },
            ].map((e) => (
              <div key={e.t} className="bg-background p-8 group">
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

      {/* SPONSORS */}
      <section id="patrocinios" className="py-32 bg-card/40 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">06 — Patrocínios</p>
            <h2 className="font-display text-4xl md:text-5xl">Cotas institucionais</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Três níveis hierárquicos rígidos desenhados para máxima visibilidade setorial.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {sponsorTiers.map((s) => (
              <div
                key={s.tier}
                className={`relative p-10 flex flex-col border ${
                  s.highlight
                    ? "border-gold bg-gradient-to-b from-card via-background to-background shadow-elegant"
                    : "border-border/40 bg-background"
                }`}
              >
                <p className="font-display text-3xl tracking-[0.2em] text-gradient-gold">{s.tier}</p>
                <div className="mt-2 hairline-gold max-w-[60px]" />
                <p className="text-xs tracking-widest uppercase text-muted-foreground mt-4">{s.slots}</p>
                <p className="font-display text-5xl text-foreground mt-6">
                  {s.price} <span className="text-base text-muted-foreground">MT</span>
                </p>
                <ul className="mt-8 space-y-3 flex-1">
                  {s.perks.map((p, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="text-gold mt-1">—</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contacto"
                  className={`mt-10 py-3 text-center text-xs tracking-widest uppercase transition ${
                    s.highlight
                      ? "bg-gradient-gold text-primary-foreground hover:opacity-90"
                      : "border border-gold/40 text-gold hover:bg-gold/10"
                  }`}
                >
                  Solicitar proposta
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KPIS */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-border/30">
            {kpis.map((k) => (
              <div key={k.l} className="bg-background p-8 text-center">
                <p className="font-display text-5xl md:text-6xl text-gradient-gold">{k.n}</p>
                <p className="mt-3 text-[10px] tracking-[0.25em] uppercase text-muted-foreground">{k.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contacto" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-6">Acesso confidencial</p>
          <h2 className="font-display text-4xl md:text-6xl leading-tight">
            Posicione-se no <span className="text-gradient-gold">topo</span> do
            mercado financeiro regional.
          </h2>
          <p className="mt-6 text-muted-foreground text-lg">
            Os lugares são limitados e atribuídos por critério de elegibilidade.
            Inicie a sua candidatura ou solicite o dossier de patrocínio.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:reservas@theboard-forum.com" className="px-10 py-5 bg-gradient-gold text-primary-foreground font-medium tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition">
              Candidatar-me
            </a>
            <a href="mailto:partners@theboard-forum.com" className="px-10 py-5 border border-gold/60 text-gold font-medium tracking-widest text-xs uppercase hover:bg-gold/10 transition">
              Dossier de Patrocínio
            </a>
          </div>
          <p className="mt-10 text-xs tracking-[0.3em] uppercase text-muted-foreground">
            Direção Executiva · Maputo, Junho de 2026
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/40 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-4 justify-between items-center text-xs text-muted-foreground">
          <p className="font-display tracking-[0.25em] text-foreground">
            THE <span className="text-gold">BOARD</span> · BIG PLAYERS FORUM
          </p>
          <p className="tracking-widest uppercase">© 2026 · Edição Moçambique &amp; Angola</p>
        </div>
      </footer>
    </div>
  );
}
