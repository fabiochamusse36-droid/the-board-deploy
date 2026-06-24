import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getOrder } from "@/lib/orders.functions";

type Order = Awaited<ReturnType<typeof getOrder>>;

export const Route = createFileRoute("/confirmacao/$reference")({
  head: () => ({
    meta: [
      { title: "Confirmação de Reserva — THE BOARD 2026" },
      { name: "description", content: "Instruções de pagamento por M-Pesa ou transferência bancária." },
    ],
  }),
  component: Confirmacao,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Erro</p>
          <p className="text-muted-foreground mb-6">{error.message}</p>
          <button onClick={() => { reset(); router.invalidate(); }} className="px-6 py-3 border border-gold text-gold text-xs tracking-widest uppercase">Tentar novamente</button>
        </div>
      </div>
    );
  },
  notFoundComponent: () => <div className="p-10">Reserva não encontrada</div>,
});

function Confirmacao() {
  const { reference } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    getOrder({ data: { reference } })
      .then((o) => active && setOrder(o))
      .catch((e) => active && setError(e instanceof Error ? e.message : "Erro"));
    return () => { active = false; };
  }, [reference]);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-destructive mb-6">{error}</p>
          <Link to="/" className="px-6 py-3 border border-gold text-gold text-xs tracking-widest uppercase">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-xs tracking-widest uppercase">A carregar…</div>;
  }


  const isMpesa = order.payment_method === "mpesa";

  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-gold mb-6">
            <span className="text-gold font-display text-2xl">✓</span>
          </div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Reserva criada</p>
          <h1 className="font-display text-3xl md:text-4xl">Aguardando pagamento</h1>
          <p className="mt-4 text-muted-foreground">
            A sua reserva está provisória. Conclua o pagamento usando a referência abaixo.
          </p>
        </div>

        {/* Reference card */}
        <div className="border border-gold/60 bg-gradient-to-b from-card to-background p-8 md:p-10 mb-8 text-center shadow-gold">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Referência de pagamento</p>
          <p className="font-display text-3xl md:text-4xl text-gradient-gold mt-3 tracking-widest break-all">{order.reference}</p>
          <button
            type="button"
            onClick={copyReference}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-gold/50 text-gold text-[10px] tracking-widest uppercase hover:bg-gold/10 transition"
          >
            {copied ? "Copiado ✓" : "Copiar referência"}
          </button>
          <div className="hairline-gold mx-auto my-6 max-w-[80px]" />
          <p className="font-display text-4xl">{order.amount_mt.toLocaleString("pt-PT")} <span className="text-base text-muted-foreground">MT</span></p>
          <p className="text-sm text-muted-foreground mt-2">{order.ticket_type}</p>
        </div>


        {/* Payment instructions */}
        <div className="border border-border/40 bg-card/40 p-8 md:p-10 mb-8">
          <h2 className="font-display text-xl mb-6">
            {isMpesa ? "Pagamento por M-Pesa" : "Transferência bancária"}
          </h2>

          {isMpesa ? (
            <ol className="space-y-4 text-sm text-muted-foreground">
              <li><span className="text-gold mr-2">1.</span>Marque <span className="text-foreground font-medium">*150#</span> no seu telemóvel.</li>
              <li><span className="text-gold mr-2">2.</span>Escolha <span className="text-foreground">Transferir Dinheiro → Para Comerciante</span>.</li>
              <li><span className="text-gold mr-2">3.</span>Número do comerciante: <span className="text-foreground font-display tracking-widest">900123</span></li>
              <li><span className="text-gold mr-2">4.</span>Valor: <span className="text-foreground font-medium">{order.amount_mt.toLocaleString("pt-PT")} MT</span></li>
              <li><span className="text-gold mr-2">5.</span>Indique a referência <span className="text-foreground font-display">{order.reference}</span> no campo de mensagem.</li>
            </ol>
          ) : (
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-border/40 pb-3">
                <dt className="text-muted-foreground">Banco</dt>
                <dd className="text-foreground">BCI Moçambique</dd>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-3">
                <dt className="text-muted-foreground">Titular</dt>
                <dd className="text-foreground">The Board Forum Lda.</dd>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-3">
                <dt className="text-muted-foreground">NIB</dt>
                <dd className="text-foreground font-display tracking-widest">0008 0000 1234 5678 9012 3</dd>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-3">
                <dt className="text-muted-foreground">Valor</dt>
                <dd className="text-foreground">{order.amount_mt.toLocaleString("pt-PT")} MT</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Descritivo</dt>
                <dd className="text-foreground font-display">{order.reference}</dd>
              </div>
            </dl>
          )}

          <div className="mt-8 pt-6 border-t border-border/40">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Após o pagamento, envie o comprovativo para{" "}
              <a href={`mailto:reservas@theboard-forum.com?subject=Comprovativo ${order.reference}`} className="text-gold underline">
                reservas@theboard-forum.com
              </a>{" "}
              indicando a referência <span className="text-foreground font-display">{order.reference}</span>.
              O bilhete será emitido em até 24h úteis para <span className="text-foreground">{order.buyer_email}</span>.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="text-sm space-y-2 mb-10 px-2">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Dados da reserva</p>
          <div className="flex justify-between"><span className="text-muted-foreground">Nome</span><span>{order.buyer_name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{order.buyer_email}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Telefone</span><span>{order.buyer_phone}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><span className="text-gold uppercase tracking-widest text-xs">{order.status}</span></div>
        </div>

        <div className="text-center">
          <Link to="/" className="text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-gold">← Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}
