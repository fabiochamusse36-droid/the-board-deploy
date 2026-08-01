import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/checkin")({
  head: () => ({
    meta: [
      { title: "Check-in — THE BOARD 2026" },
      { name: "description", content: "Validação operacional de credenciais do THE BOARD Big Players Forum 2026." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CheckinPage,
});

type CheckinStatus = "ready" | "checked_in" | "blocked";

type Credential = {
  id: string;
  reference: string;
  name: string;
  ticket: string;
  company: string;
  status: CheckinStatus;
  checkedInAt?: string;
  validatedBy?: string;
};

const initialCredentials: Credential[] = [
  {
    id: "BOARD-CHK-001",
    reference: "THB-PREP-003",
    name: "Participante Board #003",
    ticket: "VIP Board Member",
    company: "Private Desk",
    status: "ready",
  },
  {
    id: "BOARD-CHK-002",
    reference: "THB-PREP-001",
    name: "Participante VIP #001",
    ticket: "VIP Board Member",
    company: "Empresa em preparação",
    status: "blocked",
  },
];

function CheckinPage() {
  const [session, setSession] = useState<{ operator: string } | null>(null);
  const [login, setLogin] = useState({ email: "", code: "" });
  const [query, setQuery] = useState("");
  const [credentials, setCredentials] = useState(initialCredentials);
  const [lastResult, setLastResult] = useState<Credential | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const stats = useMemo(() => {
    const valid = credentials.filter((item) => item.status === "checked_in").length;
    const ready = credentials.filter((item) => item.status === "ready").length;
    const blocked = credentials.filter((item) => item.status === "blocked").length;
    return { valid, ready, blocked };
  }, [credentials]);

  function enter(e: React.FormEvent) {
    e.preventDefault();
    if (!login.email.trim() || !login.code.trim()) return;
    setSession({ operator: login.email.trim() });
  }

  function validateCredential(e: React.FormEvent) {
    e.preventDefault();
    const normalized = query.trim().toLowerCase();
    setMessage(null);

    const found = credentials.find((item) =>
      [item.id, item.reference, item.name].some((value) => value.toLowerCase().includes(normalized)),
    );

    if (!found) {
      setLastResult(null);
      setMessage("Credencial não encontrada. Confirme o código, referência ou nome.");
      return;
    }

    if (found.status === "blocked") {
      setLastResult(found);
      setMessage("Credencial bloqueada. Encaminhar o participante para a mesa de apoio.");
      return;
    }

    if (found.status === "checked_in") {
      setLastResult(found);
      setMessage("Entrada já validada anteriormente.");
      return;
    }

    const updated: Credential = {
      ...found,
      status: "checked_in",
      checkedInAt: new Date().toLocaleString("pt-MZ", { dateStyle: "medium", timeStyle: "short" }),
      validatedBy: session?.operator ?? "Operador",
    };

    setCredentials((items) => items.map((item) => (item.id === found.id ? updated : item)));
    setLastResult(updated);
    setMessage("Entrada validada com sucesso.");
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <form onSubmit={enter} className="w-full max-w-md border border-border/50 bg-card/30 p-8 md:p-10">
          <Link to="/" className="font-display text-sm tracking-[0.32em] uppercase">
            THE <span className="text-gold">BOARD</span>
          </Link>
          <p className="mt-10 text-[10px] tracking-[0.4em] uppercase text-gold">Entrada operacional</p>
          <h1 className="mt-4 font-display text-3xl md:text-4xl">Check-in</h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Acesso reservado à equipa autorizada para validação de entradas no dia do evento.
          </p>

          <label className="block mt-8">
            <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Email do operador</span>
            <input
              type="email"
              required
              value={login.email}
              onChange={(e) => setLogin({ ...login, email: e.target.value })}
              className="w-full mt-2 bg-background border border-border/60 px-4 py-3 text-sm focus:border-gold outline-none"
            />
          </label>

          <label className="block mt-5">
            <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Código de acesso</span>
            <input
              type="password"
              required
              value={login.code}
              onChange={(e) => setLogin({ ...login, code: e.target.value })}
              className="w-full mt-2 bg-background border border-border/60 px-4 py-3 text-sm focus:border-gold outline-none"
            />
          </label>

          <button type="submit" className="mt-6 w-full py-4 bg-gradient-gold text-primary-foreground tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition">
            Entrar no check-in
          </button>

          <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
            Toda validação de entrada deve ser feita apenas por operador autorizado.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/78 border-b border-border/40">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-lg tracking-[0.25em]">
            THE <span className="text-gold">BOARD</span>
          </Link>
          <div className="flex items-center gap-5 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            <span>Operador</span>
            <button onClick={() => setSession(null)} className="text-gold hover:opacity-80 transition">Sair</button>
          </div>
        </nav>
      </header>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-end mb-10">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Validação de entrada</p>
              <h1 className="font-display text-4xl md:text-6xl leading-tight">Check-in</h1>
              <p className="mt-4 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Valide credenciais no acesso ao evento. Esta área é independente do painel de gestão e mostra apenas informação necessária para entrada.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-px bg-border/30">
              <Metric label="Prontas" value={stats.ready} />
              <Metric label="Validadas" value={stats.valid} />
              <Metric label="Bloqueadas" value={stats.blocked} />
            </div>
          </div>

          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6">
            <form onSubmit={validateCredential} className="border border-border/40 bg-card/30 p-6 md:p-8 h-fit">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-4">Buscar credencial</p>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="QR Code, credencial, referência ou nome"
                className="w-full bg-background border border-border/60 px-4 py-4 text-sm focus:border-gold outline-none"
              />
              <button type="submit" className="mt-4 w-full py-4 border border-gold text-gold text-xs tracking-widest uppercase hover:bg-gold/10 transition">
                Validar entrada
              </button>
              <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
                Digite ou leia o código da credencial para confirmar a entrada do participante.
              </p>
            </form>

            <div className="border border-border/40 bg-background p-6 md:p-8 min-h-[260px] flex items-center justify-center">
              {lastResult ? (
                <div className="w-full">
                  <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3">Resultado</p>
                  <h2 className="font-display text-3xl">{lastResult.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {lastResult.id} · {lastResult.reference} · {lastResult.ticket}
                  </p>
                  <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    <Info label="Empresa" value={lastResult.company} />
                    <Info label="Estado" value={statusPt(lastResult.status)} />
                    <Info label="Validado por" value={lastResult.validatedBy ?? "—"} />
                    <Info label="Hora" value={lastResult.checkedInAt ?? "—"} />
                  </div>
                  {message && <p className={`mt-6 text-sm ${lastResult.status === "checked_in" ? "text-gold" : "text-muted-foreground"}`}>{message}</p>}
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="font-display text-2xl">Aguardando credencial</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Digite ou leia o código para validar a entrada.</p>
                  {message && <p className="mt-6 text-sm text-gold">{message}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 border border-border/40 bg-card/20 p-5 text-xs text-muted-foreground leading-relaxed">
            Área exclusiva para validação de entrada no evento.
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-background p-5">
      <p className="text-[10px] tracking-[0.25em] uppercase text-gold/80">{label}</p>
      <p className="font-display text-4xl mt-3 text-gradient-gold">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border/40 p-4">
      <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm text-foreground">{value}</p>
    </div>
  );
}

function statusPt(status: CheckinStatus) {
  const labels: Record<CheckinStatus, string> = {
    ready: "Credencial pronta",
    checked_in: "Entrada validada",
    blocked: "Credencial bloqueada",
  };
  return labels[status];
}
