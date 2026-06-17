import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { createOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/comprar")({
  head: () => ({
    meta: [
      { title: "Reservar Bilhete — THE BOARD 2026" },
      { name: "description", content: "Reserve o seu lugar Early Investors no The Board Forum 2026." },
    ],
  }),
  component: Comprar,
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

function Comprar() {
  const navigate = useNavigate();
  const submit = useServerFn(createOrder);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", payment_method: "mpesa" as "mpesa" | "bank" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await submit({ data: { ticket: "early-investors", ...form } });
      navigate({ to: "/confirmacao/$reference", params: { reference: res.reference } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar reserva");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-gold">← Voltar</Link>

        <div className="mt-10 mb-12 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Reserva · Lote 1</p>
          <h1 className="font-display text-4xl md:text-5xl">Early Investors</h1>
          <p className="mt-4 text-muted-foreground">Acesso geral antecipado · 50 lugares</p>
          <p className="font-display text-5xl text-gradient-gold mt-6">2.500 <span className="text-base text-muted-foreground">MT</span></p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 border border-border/40 bg-card/40 p-8 md:p-10">
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Nome completo</label>
            <input
              required minLength={2} maxLength={120}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mt-2 bg-background border border-border/60 px-4 py-3 focus:border-gold outline-none"
            />
          </div>
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
            <label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Telefone (com indicativo)</label>
            <input
              type="tel" required minLength={6} maxLength={30}
              placeholder="+258 84 000 0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full mt-2 bg-background border border-border/60 px-4 py-3 focus:border-gold outline-none"
            />
          </div>

          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Método de pagamento</p>
            <div className="grid grid-cols-2 gap-3">
              {(["mpesa", "bank"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({ ...form, payment_method: m })}
                  className={`py-4 text-xs tracking-widest uppercase border transition ${
                    form.payment_method === m
                      ? "border-gold text-gold bg-gold/10"
                      : "border-border/60 text-muted-foreground hover:border-gold/40"
                  }`}
                >
                  {m === "mpesa" ? "M-Pesa" : "Transferência"}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-gold text-primary-foreground tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "A processar…" : "Gerar referência de pagamento"}
          </button>
          <p className="text-xs text-muted-foreground text-center">
            Receberá a referência de pagamento na próxima página. O bilhete é confirmado após validação manual do pagamento.
          </p>
        </form>
      </div>
    </div>
  );
}
