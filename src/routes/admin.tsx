import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

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

type Tab = "reservations" | "admissions" | "sponsors" | "payments";
type PaymentStatus = "payment_pending" | "payment_confirmed" | "payment_failed";
type AdmissionStatus = "admission_locked" | "admission_under_review" | "admission_approved" | "admission_rejected";
type SponsorStatus = "sponsor_inquiry_received" | "sponsor_under_review" | "sponsor_qualified" | "dossier_sent" | "rejected";

type Reservation = {
  reference: string;
  participant: string;
  ticket: string;
  amount: string;
  paymentStatus: PaymentStatus;
  admissionStatus: AdmissionStatus;
  createdAt: string;
};

type Admission = {
  reference: string;
  name: string;
  profile: string;
  company: string;
  status: AdmissionStatus;
  submittedAt: string;
};

type SponsorInquiry = {
  reference: string;
  company: string;
  tier: string;
  contact: string;
  status: SponsorStatus;
  createdAt: string;
};

const initialReservations: Reservation[] = [
  {
    reference: "THB-JL24A9F2",
    participant: "Milton Marino",
    ticket: "VIP Board Member",
    amount: "7.500 MT",
    paymentStatus: "payment_confirmed",
    admissionStatus: "admission_under_review",
    createdAt: "29 Jul 2026 · 15:42",
  },
  {
    reference: "THB-JL24C18B",
    participant: "Ana Chissano",
    ticket: "Investidores Iniciais",
    amount: "2.500 MT",
    paymentStatus: "payment_pending",
    admissionStatus: "admission_locked",
    createdAt: "29 Jul 2026 · 16:05",
  },
  {
    reference: "THB-JL23F72D",
    participant: "Carlos Mateus",
    ticket: "VIP Board Member",
    amount: "7.500 MT",
    paymentStatus: "payment_confirmed",
    admissionStatus: "admission_approved",
    createdAt: "28 Jul 2026 · 11:18",
  },
];

const initialAdmissions: Admission[] = [
  {
    reference: "ADM-JL24A9F2",
    name: "Milton Marino",
    profile: "Empresário / Investidor",
    company: "Rightware",
    status: "admission_under_review",
    submittedAt: "29 Jul 2026 · 15:58",
  },
  {
    reference: "ADM-JL23F72D",
    name: "Carlos Mateus",
    profile: "Trader profissional",
    company: "Private Desk",
    status: "admission_approved",
    submittedAt: "28 Jul 2026 · 12:02",
  },
];

const initialSponsors: SponsorInquiry[] = [
  {
    reference: "SP-JL24MSTR",
    company: "Banco Institucional",
    tier: "Master",
    contact: "Direção Comercial",
    status: "sponsor_under_review",
    createdAt: "29 Jul 2026 · 14:20",
  },
  {
    reference: "SP-JL24GOLD",
    company: "Fintech Regional",
    tier: "Gold",
    contact: "Head of Growth",
    status: "sponsor_inquiry_received",
    createdAt: "29 Jul 2026 · 16:11",
  },
];

const tabs: { id: Tab; label: string }[] = [
  { id: "reservations", label: "Reservas" },
  { id: "payments", label: "Pagamentos" },
  { id: "admissions", label: "Admissões" },
  { id: "sponsors", label: "Patrocínios" },
];

function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("reservations");
  const [reservations, setReservations] = useState(initialReservations);
  const [admissions, setAdmissions] = useState(initialAdmissions);
  const [sponsors, setSponsors] = useState(initialSponsors);

  const metrics = useMemo(() => {
    const confirmedPayments = reservations.filter((r) => r.paymentStatus === "payment_confirmed").length;
    const pendingPayments = reservations.filter((r) => r.paymentStatus === "payment_pending").length;
    const admissionsUnderReview = admissions.filter((a) => a.status === "admission_under_review").length;
    const sponsorsUnderReview = sponsors.filter((s) => s.status === "sponsor_under_review" || s.status === "sponsor_inquiry_received").length;

    return [
      { label: "Reservas", value: reservations.length, hint: "Pedidos de acesso criados." },
      { label: "Pagamentos confirmados", value: confirmedPayments, hint: "Reservas aptas para admissão." },
      { label: "Admissões em análise", value: admissionsUnderReview, hint: "Perfis aguardando decisão." },
      { label: "Patrocínios pendentes", value: sponsorsUnderReview, hint: "Marcas aguardando curadoria." },
      { label: "Pagamentos pendentes", value: pendingPayments, hint: "Transações por validar." },
      { label: "Credenciais emitidas", value: 0, hint: "Será ativado após aprovação final." },
    ];
  }, [reservations, admissions, sponsors]);

  function confirmPayment(reference: string) {
    setReservations((items) =>
      items.map((item) =>
        item.reference === reference
          ? { ...item, paymentStatus: "payment_confirmed", admissionStatus: "admission_under_review" }
          : item,
      ),
    );
  }

  function setAdmissionStatus(reference: string, status: AdmissionStatus) {
    setAdmissions((items) => items.map((item) => (item.reference === reference ? { ...item, status } : item)));
  }

  function setSponsorStatus(reference: string, status: SponsorStatus) {
    setSponsors((items) => items.map((item) => (item.reference === reference ? { ...item, status } : item)));
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/78 border-b border-border/40">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-lg tracking-[0.25em]">
            THE <span className="text-gold">BOARD</span>
          </Link>
          <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Painel Executivo</span>
        </nav>
      </header>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-end mb-12">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Área restrita</p>
              <h1 className="font-display text-4xl md:text-6xl leading-tight">Painel Operacional</h1>
              <p className="mt-4 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Frente de gestão para reservas, pagamentos, admissões e patrocínios. Nesta fase os dados são operacionais de preparação; no backend serão substituídos por API real, autenticação e base de dados.
              </p>
            </div>
            <div className="border border-gold/30 bg-gold/5 p-5 text-sm text-muted-foreground leading-relaxed">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-2">Regra de negócio</p>
              Pagamento confirmado libera admissão. Admissão aprovada libera credencial futura. Pedido de patrocínio qualificado libera envio controlado do dossier.
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-px bg-border/30 mb-10">
            {metrics.map((metric) => (
              <div key={metric.label} className="bg-background p-5 premium-card">
                <p className="text-[10px] tracking-[0.24em] uppercase text-gold/80 min-h-8">{metric.label}</p>
                <p className="font-display text-4xl mt-3 text-gradient-gold">{metric.value}</p>
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{metric.hint}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 border text-xs tracking-widest uppercase transition ${
                  activeTab === tab.id ? "border-gold bg-gold/10 text-gold" : "border-border/50 text-muted-foreground hover:border-gold/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "reservations" && (
            <Panel title="Reservas" subtitle="Controlo de pedidos de acesso e estado de admissão.">
              <div className="space-y-3">
                {reservations.map((item) => (
                  <Row key={item.reference}>
                    <div>
                      <p className="font-display text-xl text-foreground">{item.participant}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.reference} · {item.ticket} · {item.createdAt}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{item.amount}</div>
                    <Status label={item.paymentStatus} tone={item.paymentStatus === "payment_confirmed" ? "good" : "warn"} />
                    <Status label={item.admissionStatus} tone={item.admissionStatus === "admission_approved" ? "good" : "neutral"} />
                  </Row>
                ))}
              </div>
            </Panel>
          )}

          {activeTab === "payments" && (
            <Panel title="Pagamentos" subtitle="Validação operacional temporária até integração com Gateway/Paysuite.">
              <div className="space-y-3">
                {reservations.map((item) => (
                  <Row key={item.reference}>
                    <div>
                      <p className="font-display text-xl text-foreground">{item.reference}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.participant} · {item.ticket}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{item.amount}</div>
                    <Status label={item.paymentStatus} tone={item.paymentStatus === "payment_confirmed" ? "good" : "warn"} />
                    <div className="flex justify-end">
                      {item.paymentStatus !== "payment_confirmed" ? (
                        <button onClick={() => confirmPayment(item.reference)} className="admin-action">Marcar confirmado</button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Validado</span>
                      )}
                    </div>
                  </Row>
                ))}
              </div>
            </Panel>
          )}

          {activeTab === "admissions" && (
            <Panel title="Admissões" subtitle="Curadoria executiva de participantes após pagamento confirmado.">
              <div className="space-y-3">
                {admissions.map((item) => (
                  <Row key={item.reference}>
                    <div>
                      <p className="font-display text-xl text-foreground">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.reference} · {item.profile} · {item.company}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{item.submittedAt}</div>
                    <Status label={item.status} tone={item.status === "admission_approved" ? "good" : item.status === "admission_rejected" ? "bad" : "warn"} />
                    <div className="flex flex-wrap justify-end gap-2">
                      <button onClick={() => setAdmissionStatus(item.reference, "admission_approved")} className="admin-action">Aprovar</button>
                      <button onClick={() => setAdmissionStatus(item.reference, "admission_rejected")} className="admin-action-muted">Rejeitar</button>
                    </div>
                  </Row>
                ))}
              </div>
            </Panel>
          )}

          {activeTab === "sponsors" && (
            <Panel title="Patrocínios" subtitle="Análise institucional antes do envio controlado do dossier.">
              <div className="space-y-3">
                {sponsors.map((item) => (
                  <Row key={item.reference}>
                    <div>
                      <p className="font-display text-xl text-foreground">{item.company}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.reference} · {item.tier} · {item.contact}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{item.createdAt}</div>
                    <Status label={item.status} tone={item.status === "dossier_sent" || item.status === "sponsor_qualified" ? "good" : item.status === "rejected" ? "bad" : "warn"} />
                    <div className="flex flex-wrap justify-end gap-2">
                      <button onClick={() => setSponsorStatus(item.reference, "sponsor_qualified")} className="admin-action">Qualificar</button>
                      <button onClick={() => setSponsorStatus(item.reference, "dossier_sent")} className="admin-action">Dossier enviado</button>
                      <button onClick={() => setSponsorStatus(item.reference, "rejected")} className="admin-action-muted">Rejeitar</button>
                    </div>
                  </Row>
                ))}
              </div>
            </Panel>
          )}

          <div className="mt-10 border border-border/40 bg-card/40 p-6 text-xs text-muted-foreground leading-relaxed">
            Próxima camada: autenticação admin, API real, PostgreSQL, Redis para idempotência, Resend para emails e logs de auditoria para cada ação executiva.
          </div>
        </div>
      </section>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="border border-border/40 bg-card/30 p-5 md:p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-2">Gestão</p>
          <h2 className="font-display text-3xl">{title}</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid lg:grid-cols-[1.35fr_0.55fr_0.65fr_0.9fr] gap-4 items-center border border-border/40 bg-background p-4">
      {children}
    </div>
  );
}

function Status({ label, tone }: { label: string; tone: "good" | "warn" | "bad" | "neutral" }) {
  const toneClass = {
    good: "border-emerald-400/40 text-emerald-300 bg-emerald-400/5",
    warn: "border-gold/50 text-gold bg-gold/5",
    bad: "border-red-400/40 text-red-300 bg-red-400/5",
    neutral: "border-border/60 text-muted-foreground bg-card/40",
  }[tone];

  return <span className={`inline-flex justify-center px-3 py-2 border text-[10px] tracking-[0.18em] uppercase ${toneClass}`}>{label.replaceAll("_", " ")}</span>;
}
