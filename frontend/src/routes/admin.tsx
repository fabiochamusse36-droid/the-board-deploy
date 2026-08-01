import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";

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

type Tab = "overview" | "reservations" | "payments" | "admissions" | "sponsors" | "credentials" | "audit";
type Permission =
  | "*"
  | "reservations.read"
  | "payments.read"
  | "payments.manual_confirm"
  | "admissions.read"
  | "admissions.approve"
  | "admissions.reject"
  | "sponsors.read"
  | "sponsors.qualify"
  | "sponsors.send_dossier"
  | "sponsors.reject"
  | "credentials.read"
  | "credentials.issue"
  | "audit.read";

type AdminSession = {
  name: string;
  email: string;
  role: "admin";
  permissions: Permission[];
};

type PaymentStatus = "payment_pending" | "payment_confirmed" | "payment_failed" | "payment_cancelled";
type AdmissionStatus = "admission_locked" | "admission_under_review" | "admission_approved" | "admission_rejected";
type SponsorStatus = "sponsor_inquiry_received" | "sponsor_under_review" | "sponsor_qualified" | "dossier_pending" | "dossier_sent" | "proposal_sent" | "rejected";
type CredentialStatus = "credential_not_ready" | "credential_ready" | "credential_issued";
type CheckinStatus = "not_checked_in" | "checked_in";

type Reservation = {
  reference: string;
  participant: string;
  email: string;
  ticket: string;
  amount: string;
  paymentStatus: PaymentStatus;
  admissionStatus: AdmissionStatus;
  credentialStatus: CredentialStatus;
  createdAt: string;
};

type Admission = {
  reference: string;
  reservationReference: string;
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

type Credential = {
  credentialCode: string;
  reservationReference: string;
  participant: string;
  ticket: string;
  status: CredentialStatus;
  checkinStatus: CheckinStatus;
  validatedBy?: string;
  validatedAt?: string;
};

type AuditLog = {
  id: string;
  actor: string;
  action: string;
  target: string;
  previousState?: string;
  nextState?: string;
  timestamp: string;
};

const ownerSession: AdminSession = {
  name: "Owner THE BOARD",
  email: "owner@theboard.co.mz",
  role: "admin",
  permissions: ["*"],
};

const initialReservations: Reservation[] = [
  {
    reference: "THB-PREP-001",
    participant: "Participante VIP #001",
    email: "vip001@empresa.co.mz",
    ticket: "VIP Board Member",
    amount: "7.500 MT",
    paymentStatus: "payment_confirmed",
    admissionStatus: "admission_under_review",
    credentialStatus: "credential_not_ready",
    createdAt: "29 Jul 2026",
  },
  {
    reference: "THB-PREP-002",
    participant: "Participante Executivo #002",
    email: "exec002@empresa.co.mz",
    ticket: "Investidores Iniciais",
    amount: "2.500 MT",
    paymentStatus: "payment_pending",
    admissionStatus: "admission_locked",
    credentialStatus: "credential_not_ready",
    createdAt: "29 Jul 2026",
  },
  {
    reference: "THB-PREP-003",
    participant: "Participante Board #003",
    email: "board003@empresa.co.mz",
    ticket: "VIP Board Member",
    amount: "7.500 MT",
    paymentStatus: "payment_confirmed",
    admissionStatus: "admission_approved",
    credentialStatus: "credential_ready",
    createdAt: "28 Jul 2026",
  },
];

const initialAdmissions: Admission[] = [
  {
    reference: "ADM-PREP-001",
    reservationReference: "THB-PREP-001",
    name: "Participante VIP #001",
    profile: "Empresário / Investidor",
    company: "Empresa em preparação",
    status: "admission_under_review",
    submittedAt: "29 Jul 2026",
  },
  {
    reference: "ADM-PREP-003",
    reservationReference: "THB-PREP-003",
    name: "Participante Board #003",
    profile: "Trader profissional",
    company: "Private Desk",
    status: "admission_approved",
    submittedAt: "28 Jul 2026",
  },
];

const initialSponsors: SponsorInquiry[] = [
  {
    reference: "SP-PREP-MASTER",
    company: "Instituição Parceira #001",
    tier: "Master",
    contact: "Direção Comercial",
    status: "sponsor_under_review",
    createdAt: "29 Jul 2026",
  },
  {
    reference: "SP-PREP-GOLD",
    company: "Marca Estratégica #002",
    tier: "Gold",
    contact: "Head of Growth",
    status: "sponsor_inquiry_received",
    createdAt: "29 Jul 2026",
  },
];

const initialCredentials: Credential[] = [
  {
    credentialCode: "BOARD-CHK-001",
    reservationReference: "THB-PREP-003",
    participant: "Participante Board #003",
    ticket: "VIP Board Member",
    status: "credential_ready",
    checkinStatus: "not_checked_in",
  },
  {
    credentialCode: "BOARD-CHK-002",
    reservationReference: "THB-PREP-001",
    participant: "Participante VIP #001",
    ticket: "VIP Board Member",
    status: "credential_not_ready",
    checkinStatus: "not_checked_in",
  },
];

const tabs: { id: Tab; label: string; permission: Permission }[] = [
  { id: "overview", label: "Visão geral", permission: "reservations.read" },
  { id: "reservations", label: "Reservas", permission: "reservations.read" },
  { id: "payments", label: "Pagamentos", permission: "payments.read" },
  { id: "admissions", label: "Admissões", permission: "admissions.read" },
  { id: "sponsors", label: "Patrocínios", permission: "sponsors.read" },
  { id: "credentials", label: "Credenciais", permission: "credentials.read" },
  { id: "audit", label: "Auditoria", permission: "audit.read" },
];

function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [reservations, setReservations] = useState(initialReservations);
  const [admissions, setAdmissions] = useState(initialAdmissions);
  const [sponsors, setSponsors] = useState(initialSponsors);
  const [credentials, setCredentials] = useState(initialCredentials);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "AUD-001",
      actor: "Sistema",
      action: "Painel operacional iniciado",
      target: "Painel Executivo",
      timestamp: "29 Jul 2026",
    },
  ]);

  const can = (permission: Permission) => Boolean(session?.permissions.includes("*") || session?.permissions.includes(permission));

  function writeAudit(action: string, target: string, previousState?: string, nextState?: string) {
    const timestamp = new Date().toLocaleString("pt-MZ", { dateStyle: "medium", timeStyle: "short" });
    setAuditLogs((items) => [
      {
        id: `AUD-${Date.now()}`,
        actor: session?.name ?? "Admin",
        action,
        target,
        previousState,
        nextState,
        timestamp,
      },
      ...items,
    ]);
  }

  const metrics = useMemo(() => {
    const confirmedPayments = reservations.filter((r) => r.paymentStatus === "payment_confirmed").length;
    const pendingPayments = reservations.filter((r) => r.paymentStatus === "payment_pending").length;
    const admissionsUnderReview = admissions.filter((a) => a.status === "admission_under_review").length;
    const sponsorsUnderReview = sponsors.filter((s) => s.status === "sponsor_under_review" || s.status === "sponsor_inquiry_received").length;
    const checkedIn = credentials.filter((c) => c.checkinStatus === "checked_in").length;

    return [
      { label: "Reservas", value: reservations.length, hint: "Pedidos de acesso criados." },
      { label: "Pagamentos confirmados", value: confirmedPayments, hint: "Reservas aptas para admissão." },
      { label: "Admissões em análise", value: admissionsUnderReview, hint: "Perfis aguardando decisão." },
      { label: "Patrocínios pendentes", value: sponsorsUnderReview, hint: "Marcas aguardando curadoria." },
      { label: "Pagamentos pendentes", value: pendingPayments, hint: "Transações por validar." },
      { label: "Check-ins validados", value: checkedIn, hint: "Entradas confirmadas no evento." },
    ];
  }, [reservations, admissions, sponsors, credentials]);

  function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSession(ownerSession);
  }

  function confirmPayment(reference: string) {
    if (!can("payments.manual_confirm")) return;
    const current = reservations.find((item) => item.reference === reference);
    if (!current || current.paymentStatus === "payment_confirmed") return;

    setReservations((items) =>
      items.map((item) =>
        item.reference === reference
          ? { ...item, paymentStatus: "payment_confirmed", admissionStatus: "admission_under_review" }
          : item,
      ),
    );
    writeAudit("Confirmou pagamento", reference, current.paymentStatus, "payment_confirmed");
  }

  function setAdmissionStatus(reference: string, status: AdmissionStatus) {
    const permission = status === "admission_approved" ? "admissions.approve" : "admissions.reject";
    if (!can(permission)) return;
    const current = admissions.find((item) => item.reference === reference);
    if (!current || current.status === status) return;

    setAdmissions((items) => items.map((item) => (item.reference === reference ? { ...item, status } : item)));
    setReservations((items) =>
      items.map((item) =>
        item.reference === current.reservationReference
          ? { ...item, admissionStatus: status, credentialStatus: status === "admission_approved" ? "credential_ready" : item.credentialStatus }
          : item,
      ),
    );
    setCredentials((items) =>
      items.map((item) =>
        item.reservationReference === current.reservationReference && status === "admission_approved"
          ? { ...item, status: "credential_ready" }
          : item,
      ),
    );
    writeAudit(status === "admission_approved" ? "Aprovou admissão" : "Rejeitou admissão", reference, current.status, status);
  }

  function setSponsorStatus(reference: string, status: SponsorStatus) {
    const permission = status === "sponsor_qualified" ? "sponsors.qualify" : status === "dossier_sent" ? "sponsors.send_dossier" : "sponsors.reject";
    if (!can(permission)) return;
    const current = sponsors.find((item) => item.reference === reference);
    if (!current || current.status === status) return;

    setSponsors((items) => items.map((item) => (item.reference === reference ? { ...item, status } : item)));
    writeAudit(status === "sponsor_qualified" ? "Qualificou patrocinador" : status === "dossier_sent" ? "Marcou dossier enviado" : "Rejeitou patrocinador", reference, current.status, status);
  }

  function issueCredential(code: string) {
    if (!can("credentials.issue")) return;
    const current = credentials.find((item) => item.credentialCode === code);
    if (!current || current.status !== "credential_ready") return;
    setCredentials((items) => items.map((item) => (item.credentialCode === code ? { ...item, status: "credential_issued" } : item)));
    writeAudit("Emitiu credencial", code, current.status, "credential_issued");
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="w-full max-w-md border border-border/50 bg-card/40 p-8 md:p-10 shadow-elegant">
          <Link to="/" className="font-display text-lg tracking-[0.25em]">
            THE <span className="text-gold">BOARD</span>
          </Link>
          <p className="mt-10 text-[10px] tracking-[0.4em] uppercase text-gold">Área restrita</p>
          <h1 className="mt-3 font-display text-4xl">Acesso Executivo</h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Entrada reservada ao proprietário e equipa autorizada para gestão do evento.
          </p>
          <form onSubmit={login} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Email administrativo</span>
              <input required type="email" placeholder="owner@theboard.co.mz" className={inputCls} />
            </label>
            <label className="block">
              <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Código de acesso</span>
              <input required type="password" placeholder="••••••••" className={inputCls} />
            </label>
            <button className="w-full py-4 bg-gradient-gold text-primary-foreground text-xs tracking-widest uppercase shadow-gold">
              Entrar no painel
            </button>
          </form>
          <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
            Acesso administrativo sujeito a validação e registo de atividade.
          </p>
        </div>
      </div>
    );
  }

  const visibleTabs = tabs.filter((tab) => can(tab.permission));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/78 border-b border-border/40">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-lg tracking-[0.25em]">
            THE <span className="text-gold">BOARD</span>
          </Link>
          <div className="flex items-center gap-5">
            <span className="hidden sm:inline text-[10px] tracking-[0.25em] uppercase text-muted-foreground">{session.name}</span>
            <button onClick={() => setSession(null)} className="text-[10px] tracking-[0.25em] uppercase text-gold hover:opacity-80">Sair</button>
          </div>
        </nav>
      </header>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-end mb-12">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Área restrita</p>
              <h1 className="font-display text-4xl md:text-6xl leading-tight">Painel Operacional</h1>
              <p className="mt-4 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Gestão de reservas, pagamentos, admissões, patrocínios e credenciais do THE BOARD.
              </p>
            </div>
            <div className="border border-gold/30 bg-gold/5 p-5 text-sm text-muted-foreground leading-relaxed">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-2">Regra de negócio</p>
              Pagamento confirmado libera admissão. Admissão aprovada libera credencial. Credencial emitida permite validação de entrada.
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
            {visibleTabs.map((tab) => (
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

          {activeTab === "overview" && (
            <Panel title="Visão geral" subtitle="Resumo operacional da organização do evento.">
              <div className="grid md:grid-cols-3 gap-4">
                <OwnerCard title="Acesso" body="O proprietário entra pelo painel executivo. A equipa de porta usa uma rota separada de check-in." />
                <OwnerCard title="Permissões" body="Existe utilizador comum e administrador. Dentro do administrador, permissões definem o que cada pessoa pode ver e alterar." />
                <OwnerCard title="Auditoria" body="Ações sensíveis, como aprovar admissão, enviar dossier ou emitir credencial, ficam registadas." />
              </div>
            </Panel>
          )}

          {activeTab === "reservations" && (
            <Panel title="Reservas" subtitle="Controlo de pedidos de acesso e estado de admissão.">
              <div className="space-y-3">
                {reservations.map((item) => (
                  <Row key={item.reference}>
                    <div>
                      <p className="font-display text-xl text-foreground">{item.participant}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.reference} · {item.ticket} · {item.email} · {item.createdAt}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{item.amount}</div>
                    <Status label={item.paymentStatus} tone={item.paymentStatus === "payment_confirmed" ? "good" : "warn"} />
                    <Status label={item.admissionStatus} tone={item.admissionStatus === "admission_approved" ? "good" : item.admissionStatus === "admission_rejected" ? "bad" : "neutral"} />
                  </Row>
                ))}
              </div>
            </Panel>
          )}

          {activeTab === "payments" && (
            <Panel title="Pagamentos" subtitle="Validação financeira e acompanhamento de transações.">
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
                    <Status label={item.status} tone={item.status === "dossier_sent" || item.status === "proposal_sent" ? "good" : item.status === "rejected" ? "bad" : "warn"} />
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

          {activeTab === "credentials" && (
            <Panel title="Credenciais" subtitle="Emissão de credenciais após admissão aprovada.">
              <div className="space-y-3">
                {credentials.map((item) => (
                  <Row key={item.credentialCode}>
                    <div>
                      <p className="font-display text-xl text-foreground">{item.participant}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.credentialCode} · {item.reservationReference} · {item.ticket}</p>
                    </div>
                    <Status label={item.status} tone={item.status === "credential_issued" || item.status === "credential_ready" ? "good" : "neutral"} />
                    <Status label={item.checkinStatus} tone={item.checkinStatus === "checked_in" ? "good" : "neutral"} />
                    <div className="flex justify-end">
                      {item.status === "credential_ready" ? (
                        <button onClick={() => issueCredential(item.credentialCode)} className="admin-action">Emitir credencial</button>
                      ) : (
                        <span className="text-xs text-muted-foreground">{item.status === "credential_not_ready" ? "Aguardando admissão" : "Emitida"}</span>
                      )}
                    </div>
                  </Row>
                ))}
              </div>
            </Panel>
          )}

          {activeTab === "audit" && (
            <Panel title="Auditoria" subtitle="Registo de ações administrativas para controlo interno.">
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <Row key={log.id}>
                    <div>
                      <p className="font-display text-xl text-foreground">{log.action}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{log.actor} · {log.target} · {log.timestamp}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{log.previousState ?? "—"}</div>
                    <div className="text-xs text-gold">{log.nextState ?? "—"}</div>
                  </Row>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </section>
    </div>
  );
}

const inputCls = "w-full mt-2 bg-background border border-border/60 px-4 py-3 text-sm focus:border-gold outline-none";

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="border border-border/40 bg-card/30 p-5 md:p-7">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-2">Gestão</p>
          <h2 className="font-display text-3xl">{title}</h2>
        </div>
        <p className="text-xs text-muted-foreground max-w-md md:text-right">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid lg:grid-cols-[1.4fr_0.7fr_0.8fr_1fr] gap-4 items-center border border-border/35 bg-background p-4">{children}</div>;
}

function Status({ label, tone }: { label: string; tone: "good" | "warn" | "bad" | "neutral" }) {
  const cls =
    tone === "good"
      ? "border-emerald-500/50 text-emerald-300 bg-emerald-500/10"
      : tone === "bad"
      ? "border-red-500/50 text-red-300 bg-red-500/10"
      : tone === "warn"
      ? "border-gold/60 text-gold bg-gold/10"
      : "border-border/60 text-muted-foreground bg-card/30";

  return <span className={`inline-flex justify-center px-3 py-2 text-[10px] tracking-[0.22em] uppercase border ${cls}`}>{statusLabel(label)}</span>;
}

function OwnerCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-border/40 bg-background p-5">
      <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    payment_pending: "Pagamento pendente",
    payment_confirmed: "Pagamento confirmado",
    payment_failed: "Pagamento falhado",
    payment_cancelled: "Pagamento cancelado",
    admission_locked: "Admissão bloqueada",
    admission_under_review: "Admissão em análise",
    admission_approved: "Admissão aprovada",
    admission_rejected: "Admissão rejeitada",
    sponsor_inquiry_received: "Pedido recebido",
    sponsor_under_review: "Patrocínio em análise",
    sponsor_qualified: "Patrocinador qualificado",
    dossier_pending: "Dossier pendente",
    dossier_sent: "Dossier enviado",
    proposal_sent: "Proposta enviada",
    rejected: "Rejeitado",
    credential_not_ready: "Credencial indisponível",
    credential_ready: "Credencial pronta",
    credential_issued: "Credencial emitida",
    not_checked_in: "Não entrou",
    checked_in: "Entrada validada",
  };

  return labels[status] ?? status;
}
