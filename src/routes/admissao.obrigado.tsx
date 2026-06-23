import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admissao/obrigado")({
  head: () => ({
    meta: [
      { title: "Candidatura recebida — THE BOARD 2026" },
      {
        name: "description",
        content:
          "A sua candidatura à mesa do THE BOARD foi recebida. A comissão de curadoria entrará em contacto.",
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

function ObrigadoPage() {
  const [calendarMsg, setCalendarMsg] = useState<string | null>(null);
  const [memoMsg, setMemoMsg] = useState<string | null>(null);

  function addToCalendar() {
    setCalendarMsg("Convite .ics enviado para o seu e-mail dentro de 24h.");
  }
  function requestMemo() {
    setMemoMsg("Memorando estratégico em preparação — chegará por e-mail.");
  }

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
            A sua candidatura foi recebida pela{" "}
            <span className="text-gradient-gold">Mesa Executiva</span>.
          </h1>

          <div className="mx-auto mt-10 max-w-xs hairline-gold" />

          <p className="mt-10 text-base md:text-lg text-muted-foreground leading-relaxed">
            A comissão de curadoria do THE BOARD analisará o seu perfil operacional nos
            próximos dias úteis. Em caso de pré-aprovação, será contactado por e-mail com
            instruções de confirmação de assento e protocolo de admissão.
          </p>

          <div className="mt-10 grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            {[
              { k: "Data", v: "08 Ago 2026" },
              { k: "Local", v: "Hotel ONOMO" },
              { k: "Cidade", v: "Maputo, MZ" },
            ].map((i) => (
              <div key={i.k} className="border-l border-gold/40 pl-4 py-2">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold/70">{i.k}</p>
                <p className="mt-1 font-display text-lg text-foreground">{i.v}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={addToCalendar}
              className="px-8 py-4 bg-gradient-gold text-primary-foreground font-medium tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition"
            >
              Adicionar ao Calendário
            </button>
            <button
              type="button"
              onClick={requestMemo}
              className="px-8 py-4 border border-gold/60 text-gold font-medium tracking-widest text-xs uppercase hover:bg-gold/10 transition"
            >
              Memorando Estratégico
            </button>
            <Link
              to="/"
              className="px-8 py-4 border border-border/60 text-muted-foreground font-medium tracking-widest text-xs uppercase hover:text-gold hover:border-gold/40 transition"
            >
              Voltar ao início
            </Link>
          </div>

          {(calendarMsg || memoMsg) && (
            <div className="mt-8 space-y-2 text-sm text-gold/90">
              {calendarMsg && <p>{calendarMsg}</p>}
              {memoMsg && <p>{memoMsg}</p>}
            </div>
          )}

          <p className="mt-16 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            Direção Executiva · Maputo, Junho de 2026
          </p>
        </div>
      </section>
    </div>
  );
}
