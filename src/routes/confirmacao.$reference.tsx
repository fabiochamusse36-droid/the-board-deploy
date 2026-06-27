import { createFileRoute, Link, useRouter, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getOrder } from "@/lib/orders.functions";
import {
  confirmPaymentMock,
  getReservation,
  type MockReservation,
  type PaymentStatus,
} from "@/lib/reservations.mock";

type Order = Awaited<ReturnType<typeof getOrder>>;

export const Route = createFileRoute("/confirmacao/$reference")({
  head: () => ({
    meta: [
      { title: "Confirmação de Reserva — THE BOARD 2026" },
      { name: "description", content: "Instruções de pagamento por M-Pesa, e-Mola ou transferência bancária." },
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
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [reservation, setReservation] = useState<MockReservation | null>(null);

  useEffect(() => {
    let active = true;
    getOrder({ data: { reference } })
      .then((o) => active && setOrder(o))
      .catch((e) => active && setError(e instanceof Error ? e.message : "Erro"));
    const { data } = getReservation(reference);
    if (active) setReservation(data);
    return () => { active = false; };
  }, [reference]);

  // Automatic deterministic payment validation: processing → confirmed
  // after ~2.5s, then auto-redirect to admission form after ~1.8s.
  useEffect(() => {
    if (!order) return;
    if (reservation?.paymentStatus === "payment_confirmed") return;
    const t = window.setTimeout(() => {
      const { data } = confirmPaymentMock(reference);
      if (data) setReservation(data);
    }, 2500);
    return () => window.clearTimeout(t);
  }, [order, reservation?.paymentStatus, reference]);

  useEffect(() => {
    if (reservation?.paymentStatus !== "payment_confirmed") return;
    const t = window.setTimeout(() => {
      navigate({ to: "/admissao", search: { reference } });
    }, 1800);
    return () => window.clearTimeout(t);
  }, [reservation?.paymentStatus, reference, navigate]);

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

  const paymentStatus: PaymentStatus = reservation?.paymentStatus ?? "payment_pending";
  const isConfirmed = paymentStatus === "payment_confirmed";
  const method = (reservation?.paymentMethod ?? order.payment_method) as string;
  const isMpesa = method === "mpesa";
  const isEmola = method === "emola";
  const isBank = method === "bank";
  const isManual = method === "manual";

  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-gold mb-6">
            {isConfirmed ? (
              <span className="text-gold font-display text-2xl">✓</span>
            ) : (
              <span className="block w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            )}
          </div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
            {isConfirmed ? "Pagamento confirmado" : "Validação em curso"}
          </p>
          <h1 className="font-display text-3xl md:text-4xl">
            {isConfirmed
              ? "Pagamento validado. Continue para a admissão."
              : "Validação de pagamento em curso"}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {isConfirmed
              ? "O pagamento foi validado. Preencha agora o Formulário de Admissão Executiva para concluir a validação do perfil."
              : "Estamos a validar o pagamento associado à sua reserva. O Formulário de Admissão será liberado assim que a confirmação for recebida."}
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
          <p className="text-[10px] tracking-[0.3em] uppercase mt-3">
            <span className={isConfirmed ? "text-gold" : "text-gold/80"}>
              Estado: {isConfirmed ? "pagamento confirmado" : "a processar pagamento"}
            </span>
          </p>
        </div>

        {/* Admission gate */}
        <div className={`border p-6 md:p-8 mb-8 ${isConfirmed ? "border-gold/60 bg-gradient-to-b from-gold/10 to-transparent" : "border-border/60 bg-card/40"}`}>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
            {isConfirmed ? "Formulário de Admissão liberado" : "Formulário de Admissão bloqueado"}
          </p>
          <h2 className="font-display text-2xl">Formulário de Admissão Executiva</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {isConfirmed
              ? "O pagamento foi validado. Preencha agora o Formulário de Admissão Executiva para concluir a validação do perfil."
              : "O Formulário de Admissão Executiva será liberado assim que a confirmação do pagamento for recebida. A credencial final será emitida apenas após validação do perfil pela Direção Executiva."}
          </p>

          {isConfirmed ? (
            <Link
              to="/admissao"
              search={{ reference: order.reference }}
              className="mt-5 inline-block px-6 py-3 bg-gradient-gold text-primary-foreground tracking-widest text-xs uppercase shadow-gold hover:opacity-90 transition"
            >
              Preencher Formulário de Admissão
            </Link>
          ) : (
            <button
              type="button"
              disabled
              aria-busy="true"
              className="mt-5 inline-flex items-center gap-3 px-6 py-3 border border-border/60 text-muted-foreground tracking-widest text-xs uppercase cursor-not-allowed opacity-70"
            >
              <span className="block w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              Aguardando confirmação
            </button>
          )}
        </div>


        {/* Payment instructions */}
        <div className="border border-border/40 bg-card/40 p-8 md:p-10 mb-8">
          <h2 className="font-display text-xl mb-6">
            {isMpesa ? "Pagamento por M-Pesa"
              : isEmola ? "Pagamento por e-Mola"
              : isBank ? "Transferência bancária"
              : "Pagamento Manual"}
          </h2>

          {isMpesa ? (
            <>
              <ol className="space-y-4 text-sm text-muted-foreground">
                <li><span className="text-gold mr-2">1.</span>Marque <span className="text-foreground font-medium">*150#</span> no seu telemóvel.</li>
                <li><span className="text-gold mr-2">2.</span>Escolha <span className="text-foreground">Transferir Dinheiro → Para Comerciante</span>.</li>
                <li><span className="text-gold mr-2">3.</span>Número do comerciante: <span className="text-foreground font-display tracking-widest">900123</span></li>
                <li><span className="text-gold mr-2">4.</span>Valor: <span className="text-foreground font-medium">{order.amount_mt.toLocaleString("pt-PT")} MT</span></li>
                <li><span className="text-gold mr-2">5.</span>Indique a referência <span className="text-foreground font-display">{order.reference}</span> no campo de mensagem.</li>
              </ol>
              <p className="mt-5 text-xs text-muted-foreground">Confirme o pagamento no M-Pesa usando o número informado.</p>
            </>
          ) : isEmola ? (
            <>
              <ol className="space-y-4 text-sm text-muted-foreground">
                <li><span className="text-gold mr-2">1.</span>Marque <span className="text-foreground font-medium">*898#</span> no seu telemóvel.</li>
                <li><span className="text-gold mr-2">2.</span>Escolha <span className="text-foreground">Transferir → Pagar Serviço</span>.</li>
                <li><span className="text-gold mr-2">3.</span>Número do comerciante: <span className="text-foreground font-display tracking-widest">870123</span></li>
                <li><span className="text-gold mr-2">4.</span>Valor: <span className="text-foreground font-medium">{order.amount_mt.toLocaleString("pt-PT")} MT</span></li>
                <li><span className="text-gold mr-2">5.</span>Indique a referência <span className="text-foreground font-display">{order.reference}</span> no descritivo.</li>
              </ol>
              <p className="mt-5 text-xs text-muted-foreground">Confirme o pagamento no e-Mola usando o número informado.</p>
            </>
          ) : isManual ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              A equipa irá confirmar manualmente a sua reserva. Contacte a organização indicando a sua
              referência <span className="text-foreground font-display">{order.reference}</span>.
            </p>
          ) : (
            <>
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
              <p className="mt-5 text-xs text-muted-foreground">A validação bancária pode demorar até confirmação da equipa.</p>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-border/40">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Após o pagamento, envie o comprovativo para{" "}
              <a href={`mailto:reservas@theboard-forum.com?subject=Comprovativo ${order.reference}`} className="text-gold underline">
                reservas@theboard-forum.com
              </a>{" "}
              indicando a referência <span className="text-foreground font-display">{order.reference}</span>.
            </p>
          </div>
        </div>

        {/* Refund / admission policy */}
        <div className="border border-border/40 bg-background/60 p-5 mb-8 text-xs text-muted-foreground leading-relaxed">
          A admissão final está sujeita à validação executiva. Caso o perfil não seja elegível para a
          categoria solicitada, o valor será reembolsado conforme a política do evento.
        </div>

        {/* Summary */}
        <div className="text-sm space-y-2 mb-10 px-2">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Dados da reserva</p>
          <div className="flex justify-between"><span className="text-muted-foreground">Nome</span><span>{order.buyer_name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{order.buyer_email}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Telefone</span><span>{order.buyer_phone}</span></div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estado</span>
            <span className="text-gold uppercase tracking-widest text-xs">
              {isConfirmed ? "pagamento confirmado" : "a processar pagamento"}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center text-xs tracking-widest uppercase">
          <a
            href={`mailto:reservas@theboard-forum.com?subject=Reserva ${order.reference}`}
            className="px-5 py-3 border border-gold/40 text-gold hover:bg-gold/10 transition text-center"
          >
            Contactar organização
          </a>
          <Link to="/" className="px-5 py-3 border border-border/60 text-muted-foreground hover:text-gold hover:border-gold/40 transition text-center">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
