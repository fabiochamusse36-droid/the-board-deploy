import {
  createFileRoute,
  Link,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getOrder } from "@/lib/orders.functions";

type Order = Awaited<ReturnType<typeof getOrder>>;

export const Route = createFileRoute("/confirmacao/$reference")({
  head: () => ({
    meta: [
      {
        title: "Estado da Reserva — THE BOARD 2026",
      },
      {
        name: "description",
        content:
          "Acompanhe o estado da sua reserva no THE BOARD Big Players Forum 2026.",
      },
    ],
  }),

  component: Confirmacao,

  errorComponent: ({ error, reset }) => {
    const router = useRouter();

    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-background text-foreground">
        <div className="max-w-md">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
            Estado da reserva
          </p>

          <p className="text-muted-foreground mb-6">
            {error.message}
          </p>

          <button
            onClick={() => {
              reset();
              router.invalidate();
            }}
            className="px-6 py-3 border border-gold text-gold text-xs tracking-widest uppercase"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  },

  notFoundComponent: () => (
    <div className="p-10">
      Reserva não encontrada
    </div>
  ),
});

type Stage =
  | "reservation_created"
  | "payment_pending"
  | "payment_processing"
  | "payment_confirmed"
  | "payment_failed"
  | "payment_cancelled";

function Confirmacao() {
  const { reference } = Route.useParams();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  async function loadOrder() {
    try {
      const currentOrder = await getOrder({
        data: { reference },
      });

      setOrder(currentOrder);
      setError(null);

      return currentOrder;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível consultar a reserva.",
      );

      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    getOrder({
      data: { reference },
    })
      .then((currentOrder) => {
        if (!active) return;

        setOrder(currentOrder);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível consultar a reserva.",
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [reference]);

  /*
   * Enquanto o pagamento ainda estiver pendente,
   * consultamos novamente o backend.
   */
  useEffect(() => {
    if (!order) return;

    const paymentStatus =
      readPaymentStatus(order);

    if (
      paymentStatus === "payment_confirmed" ||
      paymentStatus === "payment_failed" ||
      paymentStatus === "payment_cancelled"
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      void loadOrder();
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [order, reference]);

  const stage = getStage(order);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-xs tracking-widest uppercase">
        A carregar estado da reserva…
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-background text-foreground">
        <div className="max-w-md">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
            Reserva
          </p>

          <h1 className="font-display text-4xl mb-4">
            Não foi possível carregar
          </h1>

          <p className="text-destructive mb-8">
            {error ??
              "Reserva não encontrada."}
          </p>

          <button
            type="button"
            onClick={() => void loadOrder()}
            className="inline-block mr-3 px-6 py-3 border border-gold text-gold text-xs tracking-widest uppercase"
          >
            Tentar novamente
          </button>

          <Link
            to="/"
            className="inline-block px-6 py-3 border border-border/60 text-muted-foreground text-xs tracking-widest uppercase"
          >
            Início
          </Link>
        </div>
      </div>
    );
  }

  const quantity =
    readQuantity(order) ?? 1;

  const ticketName =
    readTicketName(order);

  const total =
    readAmount(order);

  const currency =
    readCurrency(order);

  const buyerName =
    readBuyerName(order);

  const buyerEmail =
    readBuyerEmail(order);

  const buyerPhone =
    readBuyerPhone(order);

  const reservationReference =
    readReference(order, reference);

  const paymentStatus =
    readPaymentStatus(order);

  const admissionStatus =
    readAdmissionStatus(order);

  const createdAt =
    readCreatedAt(order);

  const content =
    stageCopy(stage);

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #080706 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            width: 210mm;
            min-height: 297mm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* =====================================================
          WEBSITE / SCREEN VERSION
          ===================================================== */}
      <div className="print:hidden min-h-screen bg-background text-foreground py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Link
              to="/"
              className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-gold"
            >
              ← Início
            </Link>
          </div>

          <div className="text-center mb-10">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
              THE BOARD
            </p>

            <h1 className="font-display text-4xl md:text-5xl">
              {stage === "payment_confirmed"
                ? "Comprovativo da Reserva"
                : "Estado da Reserva"}
            </h1>

            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              {stage === "payment_confirmed"
                ? "Guarde este comprovativo e a sua referência THE BOARD."
                : "Acompanhe o estado real do pagamento associado à sua reserva."}
            </p>
          </div>

          <Journey stage={stage} />

          <div className="text-center mt-12 mb-10 border border-gold/40 bg-gradient-to-b from-card to-background p-8 md:p-10 shadow-gold">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-gold mb-6">
              {stage === "payment_confirmed" ? (
                <span
                  className="text-gold font-display text-2xl"
                  aria-hidden="true"
                >
                  ✓
                </span>
              ) : stage === "payment_failed" ||
                stage === "payment_cancelled" ? (
                <span
                  className="text-destructive font-display text-2xl"
                  aria-hidden="true"
                >
                  !
                </span>
              ) : (
                <span
                  className="block w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
              )}
            </div>

            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
              {content.eyebrow}
            </p>

            <h2 className="font-display text-3xl md:text-4xl">
              {content.title}
            </h2>

            <p
              aria-live="polite"
              className="mt-4 text-muted-foreground max-w-md mx-auto"
            >
              {content.body}
            </p>
          </div>

          <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-6 mb-8">
            <section className="border border-gold/40 bg-background/70 p-6 md:p-8">
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                Referência da reserva
              </p>

              <p className="font-display text-3xl text-gradient-gold mt-3 tracking-widest break-all">
                {reservationReference}
              </p>

              <div className="hairline-gold my-6 max-w-[80px]" />

              <ReviewRow
                label="Acesso"
                value={ticketName}
              />

              <ReviewRow
                label="Quantidade"
                value={String(quantity)}
              />

              <ReviewRow
                label="Total"
                value={formatMoney(
                  total,
                  currency,
                )}
                strong
              />

              <ReviewRow
                label="Pagamento"
                value={paymentStatusLabel(
                  paymentStatus,
                )}
                strong={
                  stage ===
                  "payment_confirmed"
                }
              />
            </section>

            <section className="border border-border/40 bg-card/35 p-6 md:p-8">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
                Participante
              </p>

              {buyerName ? (
                <ReviewRow
                  label="Nome"
                  value={buyerName}
                />
              ) : null}

              {buyerEmail ? (
                <ReviewRow
                  label="Email"
                  value={buyerEmail}
                />
              ) : null}

              {buyerPhone ? (
                <ReviewRow
                  label="Telefone"
                  value={buyerPhone}
                />
              ) : null}
            </section>
          </div>

          {stage === "payment_confirmed" ? (
            <div className="border border-gold/40 bg-gold/5 p-5 mb-8 text-xs text-muted-foreground leading-relaxed">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
                Comprovativo
              </p>

              <p>
                O pagamento associado a esta reserva foi
                confirmado pelo sistema THE BOARD.
              </p>

              <p className="mt-3">
                Guarde esta referência e este comprovativo.
                A confirmação final de participação será
                comunicada após a validação executiva.
              </p>

              <p className="mt-3">
                No dia do evento, a organização poderá
                validar a referência diretamente no sistema.
              </p>
            </div>
          ) : (
            <div className="border border-border/40 bg-background/60 p-5 mb-8 text-xs text-muted-foreground leading-relaxed">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
                Próxima etapa
              </p>

              O sistema continuará a consultar o estado real
              da reserva. A admissão só será liberada depois
              da confirmação do pagamento pelo backend.
            </div>
          )}

          {stage === "payment_confirmed" ? (
            <div className="mb-10 grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-8 py-4 border border-gold text-gold text-[10px] tracking-widest uppercase hover:bg-gold/10 transition"
              >
                Guardar comprovativo em PDF
              </button>

              <Link
                to="/admissao"
                search={{ reference }}
                className="px-8 py-4 bg-gradient-gold text-primary-foreground text-[10px] tracking-widest uppercase shadow-gold hover:opacity-90 transition text-center"
              >
                Continuar para admissão
              </Link>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 justify-center text-xs tracking-widest uppercase">
            {stage !==
            "payment_confirmed" ? (
              <button
                type="button"
                onClick={() =>
                  void loadOrder()
                }
                className="px-5 py-3 border border-gold text-gold hover:bg-gold/10 transition text-center"
              >
                Atualizar estado
              </button>
            ) : null}

            <Link
              to="/"
              className="px-5 py-3 border border-border/60 text-muted-foreground hover:text-gold hover:border-gold/40 transition text-center"
            >
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          PREMIUM A4 PRINT / PDF VERSION
          ===================================================== */}
      <div
        className="hidden print:block"
        style={{
          width: "210mm",
          height: "297mm",
          overflow: "hidden",
          background:
            "linear-gradient(145deg, #050504 0%, #0d0b08 50%, #050504 100%)",
          color: "#f3efe7",
          fontFamily:
            '"Times New Roman", Georgia, serif',
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            padding: "15mm 16mm 12mm",
            position: "relative",
          }}
        >
          {/* decorative frame */}
          <div
            style={{
              position: "absolute",
              inset: "8mm",
              border: "0.3mm solid rgba(207,160,42,0.32)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "8mm",
              left: "8mm",
              width: "35mm",
              height: "0.8mm",
              background: "#cfa02a",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: "8mm",
              right: "8mm",
              width: "35mm",
              height: "0.8mm",
              background: "#cfa02a",
            }}
          />

          {/* header */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              paddingBottom: "8mm",
              borderBottom:
                "0.25mm solid rgba(207,160,42,0.32)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "22pt",
                  letterSpacing: "0.12em",
                  color: "#d6aa37",
                  lineHeight: 1,
                }}
              >
                THE BOARD
              </div>

              <div
                style={{
                  marginTop: "3mm",
                  fontFamily:
                    "Arial, Helvetica, sans-serif",
                  fontSize: "6.8pt",
                  letterSpacing: "0.38em",
                  textTransform: "uppercase",
                  color: "#d5d0c6",
                }}
              >
                Big Players Forum 2026
              </div>
            </div>

            <div
              style={{
                textAlign: "right",
                fontFamily:
                  "Arial, Helvetica, sans-serif",
              }}
            >
              <div
                style={{
                  fontSize: "6pt",
                  color: "#d6aa37",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                }}
              >
                Comprovativo oficial
              </div>

              <div
                style={{
                  marginTop: "2mm",
                  fontSize: "9pt",
                  letterSpacing: "0.1em",
                  color: "#ffffff",
                }}
              >
                {reservationReference}
              </div>
            </div>
          </header>

          {/* title */}
          <section
            style={{
              textAlign: "center",
              padding: "10mm 0 8mm",
            }}
          >
            <div
              style={{
                fontFamily:
                  "Arial, Helvetica, sans-serif",
                fontSize: "6pt",
                letterSpacing: "0.42em",
                color: "#d6aa37",
                textTransform: "uppercase",
              }}
            >
              Reserva · Pagamento Confirmado
            </div>

            <h1
              style={{
                margin: "4mm 0 0",
                fontSize: "28pt",
                fontWeight: 400,
                lineHeight: 1.1,
              }}
            >
              Comprovativo da Reserva
            </h1>

            <p
              style={{
                margin: "3mm auto 0",
                maxWidth: "125mm",
                fontFamily:
                  "Arial, Helvetica, sans-serif",
                fontSize: "8pt",
                lineHeight: 1.55,
                color: "#b9b3aa",
              }}
            >
              Documento de confirmação do pagamento associado
              à sua reserva no THE BOARD.
            </p>
          </section>

          {/* confirmation box */}
          <section
            style={{
              border: "0.35mm solid #b7891e",
              padding: "7mm",
              textAlign: "center",
              background:
                "linear-gradient(180deg, rgba(207,160,42,0.055), rgba(0,0,0,0.15))",
            }}
          >
            <div
              style={{
                width: "13mm",
                height: "13mm",
                margin: "0 auto",
                border: "0.45mm solid #d6aa37",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d6aa37",
                fontFamily:
                  "Arial, Helvetica, sans-serif",
                fontSize: "15pt",
              }}
            >
              ✓
            </div>

            <div
              style={{
                marginTop: "4mm",
                fontFamily:
                  "Arial, Helvetica, sans-serif",
                fontSize: "6pt",
                letterSpacing: "0.42em",
                color: "#d6aa37",
                textTransform: "uppercase",
              }}
            >
              Pagamento confirmado
            </div>

            <div
              style={{
                marginTop: "2mm",
                fontSize: "18pt",
              }}
            >
              Pagamento recebido
            </div>

            <div
              style={{
                marginTop: "2.5mm",
                fontFamily:
                  "Arial, Helvetica, sans-serif",
                fontSize: "7.5pt",
                color: "#c8c2b9",
              }}
            >
              A reserva encontra-se registada no sistema
              oficial do THE BOARD.
            </div>
          </section>

          {/* reference */}
          <section
            style={{
              marginTop: "7mm",
              padding: "6mm",
              border:
                "0.25mm solid rgba(207,160,42,0.3)",
              background:
                "rgba(255,255,255,0.018)",
            }}
          >
            <div
              style={{
                fontFamily:
                  "Arial, Helvetica, sans-serif",
                fontSize: "5.7pt",
                letterSpacing: "0.36em",
                color: "#aaa49a",
                textTransform: "uppercase",
              }}
            >
              Referência oficial da reserva
            </div>

            <div
              style={{
                marginTop: "3mm",
                color: "#d6aa37",
                fontSize: "21pt",
                letterSpacing: "0.14em",
              }}
            >
              {reservationReference}
            </div>
          </section>

          {/* two columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6mm",
              marginTop: "6mm",
            }}
          >
            <PrintPanel title="Reserva">
              <PrintRow
                label="Acesso"
                value={ticketName}
              />

              <PrintRow
                label="Quantidade"
                value={String(quantity)}
              />

              <PrintRow
                label="Valor total"
                value={formatMoney(
                  total,
                  currency,
                )}
                gold
              />

              <PrintRow
                label="Pagamento"
                value="Confirmado"
                gold
              />
            </PrintPanel>

            <PrintPanel title="Participante">
              <PrintRow
                label="Nome"
                value={
                  buyerName || "—"
                }
              />

              <PrintRow
                label="Email"
                value={
                  buyerEmail || "—"
                }
              />

              <PrintRow
                label="Telefone"
                value={
                  buyerPhone || "—"
                }
              />

              {createdAt ? (
                <PrintRow
                  label="Data da reserva"
                  value={createdAt}
                />
              ) : null}
            </PrintPanel>
          </div>

          {/* important */}
          <section
            style={{
              marginTop: "6mm",
              padding: "5mm 6mm",
              border:
                "0.3mm solid rgba(207,160,42,0.42)",
              background:
                "rgba(207,160,42,0.035)",
            }}
          >
            <div
              style={{
                fontFamily:
                  "Arial, Helvetica, sans-serif",
                color: "#d6aa37",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                fontSize: "6pt",
              }}
            >
              Informação importante
            </div>

            <div
              style={{
                marginTop: "3mm",
                fontFamily:
                  "Arial, Helvetica, sans-serif",
                color: "#c4beb4",
                lineHeight: 1.6,
                fontSize: "7.3pt",
              }}
            >
              <p style={{ margin: 0 }}>
                Este comprovativo confirma a receção do
                pagamento da reserva.
              </p>

              <p
                style={{
                  margin: "1.5mm 0 0",
                }}
              >
                A entrada no evento permanece sujeita à
                conclusão da etapa de Admissão Executiva.
              </p>

              <p
                style={{
                  margin: "1.5mm 0 0",
                }}
              >
                Guarde este documento e a referência acima.
                A organização poderá validar a reserva
                diretamente no sistema THE BOARD.
              </p>
            </div>
          </section>

          {/* status */}
          <section
            style={{
              marginTop: "6mm",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "5mm 6mm",
              borderTop:
                "0.25mm solid rgba(207,160,42,0.25)",
              borderBottom:
                "0.25mm solid rgba(207,160,42,0.25)",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily:
                    "Arial, Helvetica, sans-serif",
                  color: "#aaa49a",
                  fontSize: "5.7pt",
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                }}
              >
                Estado financeiro
              </div>

              <div
                style={{
                  marginTop: "1.5mm",
                  color: "#d6aa37",
                  fontSize: "11pt",
                }}
              >
                Pagamento confirmado
              </div>
            </div>

            <div
              style={{
                width: "0.25mm",
                height: "13mm",
                background:
                  "rgba(207,160,42,0.3)",
              }}
            />

            <div>
              <div
                style={{
                  fontFamily:
                    "Arial, Helvetica, sans-serif",
                  color: "#aaa49a",
                  fontSize: "5.7pt",
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                }}
              >
                Admissão
              </div>

              <div
                style={{
                  marginTop: "1.5mm",
                  color: "#d5d0c6",
                  fontSize: "11pt",
                }}
              >
                {admissionStatus ===
                "admission_approved"
                  ? "Aprovada"
                  : "Validação pendente"}
              </div>
            </div>
          </section>

          {/* footer */}
          <footer
            style={{
              position: "absolute",
              left: "16mm",
              right: "16mm",
              bottom: "15mm",
              borderTop:
                "0.25mm solid rgba(207,160,42,0.32)",
              paddingTop: "5mm",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <div
                style={{
                  color: "#d6aa37",
                  fontSize: "13pt",
                  letterSpacing: "0.16em",
                }}
              >
                THE BOARD
              </div>

              <div
                style={{
                  marginTop: "1.5mm",
                  fontFamily:
                    "Arial, Helvetica, sans-serif",
                  fontSize: "5.7pt",
                  color: "#99938a",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                Big Players Forum 2026
              </div>
            </div>

            <div
              style={{
                maxWidth: "92mm",
                textAlign: "right",
                fontFamily:
                  "Arial, Helvetica, sans-serif",
                color: "#8f8980",
                fontSize: "5.8pt",
                lineHeight: 1.45,
              }}
            >
              Documento gerado a partir dos dados oficiais
              da reserva registada no sistema THE BOARD.
              <br />
              Referência:{" "}
              <span
                style={{
                  color: "#d6aa37",
                }}
              >
                {reservationReference}
              </span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

function PrintPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        border:
          "0.25mm solid rgba(207,160,42,0.3)",
        padding: "5mm",
        background:
          "rgba(255,255,255,0.018)",
      }}
    >
      <div
        style={{
          fontFamily:
            "Arial, Helvetica, sans-serif",
          fontSize: "5.8pt",
          textTransform: "uppercase",
          color: "#d6aa37",
          letterSpacing: "0.34em",
          marginBottom: "3mm",
        }}
      >
        {title}
      </div>

      {children}
    </section>
  );
}

function PrintRow({
  label,
  value,
  gold = false,
}: {
  label: string;
  value: string;
  gold?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "38% 62%",
        gap: "3mm",
        padding: "2.3mm 0",
        borderBottom:
          "0.2mm solid rgba(255,255,255,0.08)",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <span
        style={{
          fontSize: "6.5pt",
          color: "#9f998f",
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontSize: "6.8pt",
          color: gold
            ? "#d6aa37"
            : "#f2eee6",
          textAlign: "right",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm border-b border-border/20 last:border-b-0">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span
        className={`text-right break-words ${
          strong
            ? "font-display text-gold"
            : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function formatMoney(
  value: number,
  currency = "MZN",
) {
  if (currency === "MZN") {
    return `${value.toLocaleString(
      "pt-PT",
    )} MT`;
  }

  try {
    return new Intl.NumberFormat(
      "pt-PT",
      {
        style: "currency",
        currency,
      },
    ).format(value);
  } catch {
    return `${value.toLocaleString(
      "pt-PT",
    )} ${currency}`;
  }
}

function asRecord(
  value: unknown,
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object"
  ) {
    return value as Record<
      string,
      unknown
    >;
  }

  return {};
}

function stringValue(
  record: Record<string, unknown>,
  ...keys: string[]
) {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value;
    }
  }

  return "";
}

function numberValue(
  record: Record<string, unknown>,
  ...keys: string[]
) {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }
  }

  return 0;
}

function readReference(
  order: Order,
  fallback: string,
) {
  const data = asRecord(order);

  return (
    stringValue(
      data,
      "reference",
    ) || fallback
  );
}

function readTicketName(order: Order) {
  const data = asRecord(order);

  return (
    stringValue(
      data,
      "ticketName",
      "ticket_name",
      "ticket_type",
    ) || "Acesso THE BOARD"
  );
}

function readAmount(order: Order) {
  const data = asRecord(order);

  return numberValue(
    data,
    "totalAmount",
    "total_amount",
    "amount",
    "amount_mt",
  );
}

function readCurrency(order: Order) {
  const data = asRecord(order);

  return (
    stringValue(
      data,
      "currency",
    ) || "MZN"
  );
}

function readBuyerName(order: Order) {
  const data = asRecord(order);

  return stringValue(
    data,
    "buyerName",
    "buyer_name",
  );
}

function readBuyerEmail(order: Order) {
  const data = asRecord(order);

  return stringValue(
    data,
    "buyerEmail",
    "buyer_email",
  );
}

function readBuyerPhone(order: Order) {
  const data = asRecord(order);

  return stringValue(
    data,
    "buyerPhone",
    "buyer_phone",
  );
}

function readQuantity(
  order: Order,
): number | null {
  const data = asRecord(order);

  const direct = numberValue(
    data,
    "quantity",
  );

  if (direct > 0) {
    return direct;
  }

  const notes = data.notes;

  if (typeof notes !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(
      notes,
    ) as Record<string, unknown>;

    const value = parsed.quantity;

    return typeof value === "number"
      ? value
      : null;
  } catch {
    return null;
  }
}

function readPaymentStatus(
  order: Order,
) {
  const data = asRecord(order);

  return (
    stringValue(
      data,
      "paymentStatus",
      "payment_status",
    ) || "payment_pending"
  );
}

function readAdmissionStatus(
  order: Order,
) {
  const data = asRecord(order);

  const direct = stringValue(
    data,
    "admissionStatus",
    "admission_status",
  );

  if (direct) {
    return direct;
  }

  const notes = data.notes;

  if (typeof notes !== "string") {
    return "admission_locked";
  }

  try {
    const parsed = JSON.parse(
      notes,
    ) as Record<string, unknown>;

    const status =
      parsed.admissionStatus;

    return typeof status === "string"
      ? status
      : "admission_locked";
  } catch {
    return "admission_locked";
  }
}

function readCreatedAt(
  order: Order,
) {
  const data = asRecord(order);

  const raw = stringValue(
    data,
    "createdAt",
    "created_at",
  );

  if (!raw) return "";

  const date = new Date(raw);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return raw;
  }

  return new Intl.DateTimeFormat(
    "pt-PT",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function getStage(
  order: Order | null,
): Stage {
  if (!order) {
    return "reservation_created";
  }

  const status =
    readPaymentStatus(order);

  switch (status) {
    case "payment_confirmed":
      return "payment_confirmed";

    case "payment_processing":
      return "payment_processing";

    case "payment_failed":
      return "payment_failed";

    case "payment_cancelled":
    case "payment_expired":
      return "payment_cancelled";

    case "payment_started":
    case "payment_session_created":
    case "payment_pending":
      return "payment_pending";

    default:
      return "reservation_created";
  }
}

function paymentStatusLabel(
  status: string,
) {
  const labels: Record<
    string,
    string
  > = {
    payment_started:
      "Pagamento iniciado",

    payment_session_created:
      "Sessão criada",

    payment_pending:
      "Pagamento pendente",

    payment_processing:
      "Em processamento",

    payment_confirmed:
      "Pagamento confirmado",

    payment_failed:
      "Pagamento falhado",

    payment_cancelled:
      "Pagamento cancelado",

    payment_expired:
      "Pagamento expirado",
  };

  return labels[status] ?? status;
}

function stageCopy(
  stage: Stage,
): {
  eyebrow: string;
  title: string;
  body: string;
} {
  switch (stage) {
    case "reservation_created":
      return {
        eyebrow:
          "Reserva criada",

        title:
          "Reserva registada",

        body:
          "A sua reserva existe no sistema. Aguardamos o início ou confirmação do processo financeiro.",
      };

    case "payment_pending":
      return {
        eyebrow:
          "Pagamento",

        title:
          "Aguardando confirmação",

        body:
          "O pagamento ainda não foi confirmado pelo backend.",
      };

    case "payment_processing":
      return {
        eyebrow:
          "Validação em curso",

        title:
          "Pagamento em processamento",

        body:
          "O backend recebeu o processo de pagamento e aguarda a confirmação definitiva.",
      };

    case "payment_confirmed":
      return {
        eyebrow:
          "Pagamento confirmado",

        title:
          "Pagamento recebido",

        body:
          "O pagamento foi confirmado. Guarde este comprovativo e avance para a etapa de Admissão Executiva.",
      };

    case "payment_failed":
      return {
        eyebrow:
          "Pagamento",

        title:
          "Pagamento não concluído",

        body:
          "O pagamento não foi confirmado. Pode tentar novamente quando o fluxo de pagamento estiver disponível.",
      };

    case "payment_cancelled":
      return {
        eyebrow:
          "Pagamento",

        title:
          "Pagamento cancelado",

        body:
          "O processo de pagamento foi cancelado ou expirou.",
      };
  }
}

type StepStatus =
  | "done"
  | "active"
  | "locked"
  | "future";

function Journey({
  stage,
}: {
  stage: Stage;
}) {
  const paymentDone =
    stage ===
    "payment_confirmed";

  const paymentProblem =
    stage === "payment_failed" ||
    stage ===
      "payment_cancelled";

  const steps: {
    label: string;
    state: StepStatus;
    hint: string;
  }[] = [
    {
      label: "Reserva",
      state: "done",
      hint: "concluída",
    },

    {
      label: "Pagamento",
      state: paymentDone
        ? "done"
        : "active",

      hint: paymentDone
        ? "concluído"
        : paymentProblem
          ? "requer atenção"
          : "aguardando",
    },

    {
      label: "Admissão",

      state: paymentDone
        ? "active"
        : "locked",

      hint: paymentDone
        ? "disponível"
        : "bloqueada",
    },

    {
      label: "Credencial",
      state: "future",
      hint: "futura",
    },
  ];

  return (
    <ol className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
      {steps.map(
        (step, index) => (
          <li
            key={step.label}
            className="flex flex-col items-center"
          >
            <span
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-display ${
                step.state === "done"
                  ? "border-gold text-gold bg-gold/10"
                  : step.state ===
                      "active"
                    ? "border-gold text-gold"
                    : "border-border/60 text-muted-foreground"
              }`}
              aria-hidden="true"
            >
              {step.state === "done"
                ? "✓"
                : index + 1}
            </span>

            <span
              className={`mt-2 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase ${
                step.state ===
                  "locked" ||
                step.state ===
                  "future"
                  ? "text-muted-foreground"
                  : "text-gold"
              }`}
            >
              {step.label}
            </span>

            <span className="mt-1 text-[9px] tracking-[0.15em] uppercase text-muted-foreground/70 hidden sm:block">
              {step.hint}
            </span>
          </li>
        ),
      )}
    </ol>
  );
}
