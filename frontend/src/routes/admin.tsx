import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ApiError,
  apiRequest,
  getAdminAdmissions,
  getAdminAudit,
  getAdminCredentials,
  getAdminPayments,
  getAdminReservations,
  getAdminSponsors,
  reviewAdmission,
  updateCredentialStatus,
  updateSponsorStatus,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Executivo — THE BOARD 2026" },
      {
        name: "description",
        content: "Painel de gestão executiva do THE BOARD Big Players Forum 2026.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

type Tab =
  | "overview"
  | "reservations"
  | "payments"
  | "admissions"
  | "sponsors"
  | "credentials"
  | "audit";

type Permission =
  | "*"
  | "reservations.read"
  | "payments.read"
  | "payments.manual_confirm"
  | "admissions.read"
  | "admissions.review"
  | "admissions.approve"
  | "admissions.reject"
  | "sponsors.read"
  | "sponsors.update"
  | "sponsors.qualify"
  | "sponsors.send_dossier"
  | "sponsors.reject"
  | "credentials.read"
  | "credentials.issue"
  | "credentials.update"
  | "audit.read";

type AdminSession = {
  id: string;
  name: string;
  email: string;
  role: "admin";
  permissions: Permission[];
  accessToken: string;
};

type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    permissions: string[];
  };
};

type ReservationStatus =
  | "reservation_created"
  | "payment_started"
  | "payment_pending"
  | "payment_confirmed"
  | "payment_failed"
  | "payment_cancelled"
  | "expired";

type PaymentStatus =
  | "payment_session_created"
  | "payment_pending"
  | "payment_processing"
  | "payment_confirmed"
  | "payment_failed"
  | "payment_cancelled"
  | "payment_expired";

type AdmissionStatus =
  | "admission_locked"
  | "admission_available"
  | "admission_submitted"
  | "admission_under_review"
  | "admission_approved"
  | "admission_rejected"
  | "credential_issued";

type SponsorStatus =
  | "sponsor_inquiry_received"
  | "sponsor_under_review"
  | "sponsor_qualified"
  | "dossier_pending"
  | "dossier_sent"
  | "proposal_sent"
  | "negotiation"
  | "approved"
  | "rejected"
  | "closed_won"
  | "closed_lost";

type CredentialStatus =
  | "credential_not_ready"
  | "credential_ready"
  | "credential_issued"
  | "credential_checked_in"
  | "credential_blocked";

type BackendPayment = {
  id: string;
  reservationId: string;
  paymentSessionId?: string | null;
  gateway: string;
  gatewayReference?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: string | null;
  checkoutUrl?: string | null;
  expiresAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reservation?: BackendReservation;
};

type BackendAdmission = {
  id: string;
  reference: string;
  reservationId: string;
  fullName: string;
  email: string;
  phone: string;
  profileType: string;
  company?: string | null;
  role?: string | null;
  investmentExperience?: string | null;
  motivation?: string | null;
  status: AdmissionStatus;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  reservation?: BackendReservation;
};

type BackendCredential = {
  id: string;
  credentialCode: string;
  reservationId: string;
  participantName: string;
  ticketName: string;
  status: CredentialStatus;
  checkedInAt?: string | null;
  checkedInBy?: string | null;
  createdAt: string;
  updatedAt: string;
  reservation?: BackendReservation;
};

type BackendReservation = {
  id: string;
  reference: string;
  ticketId: string;
  ticketName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  country?: string | null;
  city?: string | null;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  admissionStatus: AdmissionStatus;
  createdAt: string;
  updatedAt: string;
  payments?: BackendPayment[];
  admissions?: BackendAdmission[];
  credentials?: BackendCredential[];
};

type BackendSponsor = {
  id: string;
  reference: string;
  tier: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  message?: string | null;
  status: SponsorStatus;
  dossierStatus: string;
  createdAt: string;
  updatedAt: string;
};

type BackendAudit = {
  id: string;
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType: string;
  targetRef: string;
  previousState?: string | null;
  nextState?: string | null;
  metadata?: unknown;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
};

const tabs: {
  id: Tab;
  label: string;
  permission: Permission;
}[] = [
  {
    id: "overview",
    label: "Visão geral",
    permission: "reservations.read",
  },
  {
    id: "reservations",
    label: "Reservas",
    permission: "reservations.read",
  },
  {
    id: "payments",
    label: "Pagamentos",
    permission: "payments.read",
  },
  {
    id: "admissions",
    label: "Admissões",
    permission: "admissions.read",
  },
  {
    id: "sponsors",
    label: "Patrocínios",
    permission: "sponsors.read",
  },
  {
    id: "credentials",
    label: "Credenciais",
    permission: "credentials.read",
  },
  {
    id: "audit",
    label: "Auditoria",
    permission: "audit.read",
  },
];

function readInput(form: HTMLFormElement, name: string) {
  const input = form.elements.namedItem(name);

  return input instanceof HTMLInputElement
    ? input.value.trim()
    : "";
}

async function postJson<T>(
  path: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!payload) {
    return {
      ok: false,
      error: {
        code: "invalid_response",
        message: "Resposta inválida do servidor.",
      },
    };
  }

  return payload;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("pt-MZ", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatMoney(value: number, currency = "MZN") {
  return new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function AdminPage() {
  const [session, setSession] =
    useState<AdminSession | null>(null);

  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<Tab>("overview");

  const [reservations, setReservations] = useState<
    BackendReservation[]
  >([]);

  const [payments, setPayments] = useState<
    BackendPayment[]
  >([]);

  const [admissions, setAdmissions] = useState<
    BackendAdmission[]
  >([]);

  const [sponsors, setSponsors] = useState<
    BackendSponsor[]
  >([]);

  const [credentials, setCredentials] = useState<
    BackendCredential[]
  >([]);

  const [auditLogs, setAuditLogs] = useState<
    BackendAudit[]
  >([]);

  const [dataBusy, setDataBusy] = useState(false);
  const [dataError, setDataError] =
    useState<string | null>(null);

  const [actionBusy, setActionBusy] =
    useState<string | null>(null);

  const can = (permission: Permission) =>
    Boolean(
      session?.permissions.includes("*") ||
        session?.permissions.includes(permission),
    );

  async function loadAdminData(currentSession: AdminSession) {
    setDataBusy(true);
    setDataError(null);

    try {
      const tasks: Promise<void>[] = [];

      if (
        currentSession.permissions.includes("*") ||
        currentSession.permissions.includes(
          "reservations.read",
        )
      ) {
        tasks.push(
          getAdminReservations<BackendReservation>(
            currentSession.accessToken,
          ).then((result) => {
            setReservations(result.items);
          }),
        );
      }

      if (
        currentSession.permissions.includes("*") ||
        currentSession.permissions.includes("payments.read")
      ) {
        tasks.push(
          getAdminPayments<BackendPayment>(
            currentSession.accessToken,
          ).then((result) => {
            setPayments(result.items);
          }),
        );
      }

      if (
        currentSession.permissions.includes("*") ||
        currentSession.permissions.includes(
          "admissions.read",
        )
      ) {
        tasks.push(
          getAdminAdmissions<BackendAdmission>(
            currentSession.accessToken,
          ).then((result) => {
            setAdmissions(result.items);
          }),
        );
      }

      if (
        currentSession.permissions.includes("*") ||
        currentSession.permissions.includes("sponsors.read")
      ) {
        tasks.push(
          getAdminSponsors<BackendSponsor>(
            currentSession.accessToken,
          ).then((result) => {
            setSponsors(result.items);
          }),
        );
      }

      if (
        currentSession.permissions.includes("*") ||
        currentSession.permissions.includes(
          "credentials.read",
        )
      ) {
        tasks.push(
          getAdminCredentials<BackendCredential>(
            currentSession.accessToken,
          ).then((result) => {
            setCredentials(result.items);
          }),
        );
      }

      if (
        currentSession.permissions.includes("*") ||
        currentSession.permissions.includes("audit.read")
      ) {
        tasks.push(
          getAdminAudit<BackendAudit>(
            currentSession.accessToken,
          ).then((result) => {
            setAuditLogs(result.items);
          }),
        );
      }

      await Promise.all(tasks);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setSession(null);
          setLoginError(
            "A sessão expirou. Entre novamente.",
          );
          return;
        }

        if (error.status === 403) {
          setDataError(
            "A sua conta não tem permissão para consultar estes dados.",
          );
          return;
        }

        setDataError(error.message);
        return;
      }

      setDataError(
        "Não foi possível carregar os dados operacionais.",
      );
    } finally {
      setDataBusy(false);
    }
  }

  useEffect(() => {
    if (!session) return;

    void loadAdminData(session);
  }, [session]);

  const metrics = useMemo(() => {
    const confirmedPayments = payments.filter(
      (payment) =>
        payment.status === "payment_confirmed",
    ).length;

    const pendingPayments = payments.filter(
      (payment) =>
        payment.status === "payment_pending" ||
        payment.status === "payment_processing" ||
        payment.status === "payment_session_created",
    ).length;

    const admissionsUnderReview = admissions.filter(
      (admission) =>
        admission.status === "admission_under_review",
    ).length;

    const sponsorsUnderReview = sponsors.filter(
      (sponsor) =>
        sponsor.status === "sponsor_under_review" ||
        sponsor.status === "sponsor_inquiry_received",
    ).length;

    const checkedIn = credentials.filter(
      (credential) =>
        credential.status === "credential_checked_in",
    ).length;

    return [
      {
        label: "Reservas",
        value: reservations.length,
        hint: "Pedidos de acesso criados.",
      },
      {
        label: "Pagamentos confirmados",
        value: confirmedPayments,
        hint: "Transações confirmadas pelo backend.",
      },
      {
        label: "Admissões em análise",
        value: admissionsUnderReview,
        hint: "Perfis aguardando decisão.",
      },
      {
        label: "Patrocínios pendentes",
        value: sponsorsUnderReview,
        hint: "Marcas aguardando curadoria.",
      },
      {
        label: "Pagamentos pendentes",
        value: pendingPayments,
        hint: "Transações ainda não confirmadas.",
      },
      {
        label: "Check-ins validados",
        value: checkedIn,
        hint: "Entradas confirmadas no evento.",
      },
    ];
  }, [
    reservations,
    payments,
    admissions,
    sponsors,
    credentials,
  ]);

  async function login(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setLoginError(null);
    setLoginBusy(true);

    const email = readInput(e.currentTarget, "email");
    const password = readInput(
      e.currentTarget,
      "password",
    );

    try {
      const payload = await postJson<LoginResponse>(
        "/api/auth/login",
        {
          email,
          password,
        },
      );

      if (!payload.ok) {
        setLoginError(payload.error.message);
        return;
      }

      if (payload.data.user.role !== "admin") {
        setLoginError(
          "Esta conta não tem acesso administrativo.",
        );
        return;
      }

      setSession({
        id: payload.data.user.id,
        name: payload.data.user.name,
        email: payload.data.user.email,
        role: "admin",
        permissions:
          payload.data.user.permissions as Permission[],
        accessToken: payload.data.accessToken,
      });
    } catch {
      setLoginError(
        "Não foi possível contactar o servidor. Verifique se o backend está ativo.",
      );
    } finally {
      setLoginBusy(false);
    }
  }

  async function setAdmissionStatus(
    reference: string,
    status:
      | "admission_approved"
      | "admission_rejected",
  ) {
    if (!session || !can("admissions.review")) return;

    setActionBusy(`admission:${reference}`);
    setDataError(null);

    try {
      await reviewAdmission(
        session.accessToken,
        reference,
        status,
      );

      await loadAdminData(session);
    } catch (error) {
      setDataError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a admissão.",
      );
    } finally {
      setActionBusy(null);
    }
  }

  async function setSponsorStatus(
    reference: string,
    status: SponsorStatus,
  ) {
    if (!session || !can("sponsors.update")) return;

    setActionBusy(`sponsor:${reference}`);
    setDataError(null);

    try {
      await updateSponsorStatus(
        session.accessToken,
        reference,
        status,
      );

      await loadAdminData(session);
    } catch (error) {
      setDataError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o patrocinador.",
      );
    } finally {
      setActionBusy(null);
    }
  }

  async function setCredentialIssued(
    credentialCode: string,
  ) {
    if (!session || !can("credentials.update")) return;

    setActionBusy(`credential:${credentialCode}`);
    setDataError(null);

    try {
      await updateCredentialStatus(
        session.accessToken,
        credentialCode,
        "credential_issued",
      );

      await loadAdminData(session);
    } catch (error) {
      setDataError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a credencial.",
      );
    } finally {
      setActionBusy(null);
    }
  }

  function logout() {
    setSession(null);
    setReservations([]);
    setPayments([]);
    setAdmissions([]);
    setSponsors([]);
    setCredentials([]);
    setAuditLogs([]);
    setDataError(null);
    setActiveTab("overview");
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="w-full max-w-md border border-border/50 bg-card/40 p-8 md:p-10 shadow-elegant">
          <Link
            to="/"
            className="font-display text-lg tracking-[0.25em]"
          >
            THE <span className="text-gold">BOARD</span>
          </Link>

          <p className="mt-10 text-[10px] tracking-[0.4em] uppercase text-gold">
            Área restrita
          </p>

          <h1 className="mt-3 font-display text-4xl">
            Acesso Executivo
          </h1>

          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Entrada reservada ao proprietário e equipa
            autorizada para gestão do evento.
          </p>

          <form
            onSubmit={login}
            className="mt-8 space-y-5"
          >
            <label className="block">
              <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                Email administrativo
              </span>

              <input
                required
                name="email"
                type="email"
                placeholder="owner@theboard.co.mz"
                className={inputCls}
              />
            </label>

            <label className="block">
              <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                Código de acesso
              </span>

              <input
                required
                name="password"
                type="password"
                placeholder="••••••••"
                className={inputCls}
              />
            </label>

            {loginError ? (
              <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200 leading-relaxed">
                {loginError}
              </div>
            ) : null}

            <button
              disabled={loginBusy}
              className="w-full py-4 bg-gradient-gold text-primary-foreground text-xs tracking-widest uppercase shadow-gold disabled:opacity-60"
            >
              {loginBusy
                ? "A validar..."
                : "Entrar no painel"}
            </button>
          </form>

          <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
            Acesso administrativo sujeito a validação e
            registo de atividade.
          </p>
        </div>
      </div>
    );
  }

  const visibleTabs = tabs.filter((tab) =>
    can(tab.permission),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/78 border-b border-border/40">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="font-display text-lg tracking-[0.25em]"
          >
            THE <span className="text-gold">BOARD</span>
          </Link>

          <div className="flex items-center gap-5">
            <span className="hidden sm:inline text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
              {session.name}
            </span>

            <button
              onClick={logout}
              className="text-[10px] tracking-[0.25em] uppercase text-gold hover:opacity-80"
            >
              Sair
            </button>
          </div>
        </nav>
      </header>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-end mb-12">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
                Área restrita
              </p>

              <h1 className="font-display text-4xl md:text-6xl leading-tight">
                Painel Operacional
              </h1>

              <p className="mt-4 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Gestão de reservas, pagamentos, admissões,
                patrocínios e credenciais do THE BOARD.
              </p>
            </div>

            <div className="border border-gold/30 bg-gold/5 p-5 text-sm text-muted-foreground leading-relaxed">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-2">
                Regra de negócio
              </p>

              Pagamento confirmado libera admissão.
              Admissão aprovada libera credencial.
              Credencial emitida permite validação de
              entrada.
            </div>
          </div>

          {dataError ? (
            <div className="mb-6 border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-200">
              {dataError}
            </div>
          ) : null}

          {dataBusy ? (
            <div className="mb-6 border border-border/40 bg-card/30 px-5 py-4 text-sm text-muted-foreground">
              A carregar dados operacionais...
            </div>
          ) : null}

          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-px bg-border/30 mb-10">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-background p-5 premium-card"
              >
                <p className="text-[10px] tracking-[0.24em] uppercase text-gold/80 min-h-8">
                  {metric.label}
                </p>

                <p className="font-display text-4xl mt-3 text-gradient-gold">
                  {metric.value}
                </p>

                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  {metric.hint}
                </p>
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
                  activeTab === tab.id
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border/50 text-muted-foreground hover:border-gold/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <Panel
              title="Visão geral"
              subtitle="Resumo operacional da organização do evento."
            >
              <div className="grid md:grid-cols-3 gap-4">
                <OwnerCard
                  title="Dados reais"
                  body="Os indicadores deste painel são carregados diretamente da API e da base de dados PostgreSQL."
                />

                <OwnerCard
                  title="Permissões"
                  body="As permissões do utilizador administrativo controlam as áreas e ações disponíveis no painel."
                />

                <OwnerCard
                  title="Auditoria"
                  body="As operações administrativas sensíveis são registadas pelo backend para controlo interno."
                />
              </div>
            </Panel>
          )}

          {activeTab === "reservations" && (
            <Panel
              title="Reservas"
              subtitle="Pedidos de acesso registados na base de dados."
            >
              {reservations.length === 0 ? (
                <EmptyState text="Ainda não existem reservas." />
              ) : (
                <div className="space-y-3">
                  {reservations.map((item) => (
                    <Row key={item.reference}>
                      <div>
                        <p className="font-display text-xl text-foreground">
                          {item.buyerName}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.reference} ·{" "}
                          {item.ticketName} ·{" "}
                          {item.buyerEmail} ·{" "}
                          {formatDate(item.createdAt)}
                        </p>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {formatMoney(
                          item.totalAmount,
                          item.currency,
                        )}
                      </div>

                      <Status
                        label={item.paymentStatus}
                        tone={
                          item.paymentStatus ===
                          "payment_confirmed"
                            ? "good"
                            : item.paymentStatus ===
                                "payment_failed"
                              ? "bad"
                              : "warn"
                        }
                      />

                      <Status
                        label={item.admissionStatus}
                        tone={
                          item.admissionStatus ===
                          "admission_approved"
                            ? "good"
                            : item.admissionStatus ===
                                "admission_rejected"
                              ? "bad"
                              : "neutral"
                        }
                      />
                    </Row>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {activeTab === "payments" && (
            <Panel
              title="Pagamentos"
              subtitle="Estados financeiros recebidos pelo backend e pelo gateway."
            >
              {payments.length === 0 ? (
                <EmptyState text="Ainda não existem transações de pagamento." />
              ) : (
                <div className="space-y-3">
                  {payments.map((item) => (
                    <Row key={item.id}>
                      <div>
                        <p className="font-display text-xl text-foreground">
                          {item.reservation?.reference ??
                            item.paymentSessionId ??
                            item.id}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.reservation?.buyerName ??
                            "Participante"}{" "}
                          ·{" "}
                          {item.gateway ||
                            "gateway pendente"}{" "}
                          · {formatDate(item.createdAt)}
                        </p>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {formatMoney(
                          item.amount,
                          item.currency,
                        )}
                      </div>

                      <Status
                        label={item.status}
                        tone={
                          item.status ===
                          "payment_confirmed"
                            ? "good"
                            : item.status ===
                                  "payment_failed" ||
                                item.status ===
                                  "payment_cancelled" ||
                                item.status ===
                                  "payment_expired"
                              ? "bad"
                              : "warn"
                        }
                      />

                      <div className="flex justify-end">
                        {item.status ===
                        "payment_confirmed" ? (
                          <span className="text-xs text-emerald-300">
                            Confirmado
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Aguardando gateway
                          </span>
                        )}
                      </div>
                    </Row>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {activeTab === "admissions" && (
            <Panel
              title="Admissões"
              subtitle="Curadoria executiva de participantes."
            >
              {admissions.length === 0 ? (
                <EmptyState text="Ainda não existem admissões submetidas." />
              ) : (
                <div className="space-y-3">
                  {admissions.map((item) => {
                    const busy =
                      actionBusy ===
                      `admission:${item.reference}`;

                    return (
                      <Row key={item.reference}>
                        <div>
                          <p className="font-display text-xl text-foreground">
                            {item.fullName}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.reference} ·{" "}
                            {item.profileType} ·{" "}
                            {item.company || "—"}
                          </p>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {formatDate(
                            item.submittedAt,
                          )}
                        </div>

                        <Status
                          label={item.status}
                          tone={
                            item.status ===
                            "admission_approved"
                              ? "good"
                              : item.status ===
                                  "admission_rejected"
                                ? "bad"
                                : "warn"
                          }
                        />

                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            disabled={busy}
                            onClick={() =>
                              void setAdmissionStatus(
                                item.reference,
                                "admission_approved",
                              )
                            }
                            className="admin-action disabled:opacity-40"
                          >
                            {busy
                              ? "A guardar..."
                              : "Aprovar"}
                          </button>

                          <button
                            disabled={busy}
                            onClick={() =>
                              void setAdmissionStatus(
                                item.reference,
                                "admission_rejected",
                              )
                            }
                            className="admin-action-muted disabled:opacity-40"
                          >
                            Rejeitar
                          </button>
                        </div>
                      </Row>
                    );
                  })}
                </div>
              )}
            </Panel>
          )}

          {activeTab === "sponsors" && (
            <Panel
              title="Patrocínios"
              subtitle="Análise institucional dos pedidos de parceria."
            >
              {sponsors.length === 0 ? (
                <EmptyState text="Ainda não existem pedidos de patrocínio." />
              ) : (
                <div className="space-y-3">
                  {sponsors.map((item) => {
                    const busy =
                      actionBusy ===
                      `sponsor:${item.reference}`;

                    return (
                      <Row key={item.reference}>
                        <div>
                          <p className="font-display text-xl text-foreground">
                            {item.company}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.reference} ·{" "}
                            {item.tier} ·{" "}
                            {item.contactName}
                          </p>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </div>

                        <Status
                          label={item.status}
                          tone={
                            item.status ===
                              "dossier_sent" ||
                            item.status ===
                              "proposal_sent" ||
                            item.status === "approved" ||
                            item.status ===
                              "closed_won"
                              ? "good"
                              : item.status ===
                                    "rejected" ||
                                  item.status ===
                                    "closed_lost"
                                ? "bad"
                                : "warn"
                          }
                        />

                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            disabled={busy}
                            onClick={() =>
                              void setSponsorStatus(
                                item.reference,
                                "sponsor_qualified",
                              )
                            }
                            className="admin-action disabled:opacity-40"
                          >
                            Qualificar
                          </button>

                          <button
                            disabled={busy}
                            onClick={() =>
                              void setSponsorStatus(
                                item.reference,
                                "dossier_sent",
                              )
                            }
                            className="admin-action disabled:opacity-40"
                          >
                            Dossier enviado
                          </button>

                          <button
                            disabled={busy}
                            onClick={() =>
                              void setSponsorStatus(
                                item.reference,
                                "rejected",
                              )
                            }
                            className="admin-action-muted disabled:opacity-40"
                          >
                            Rejeitar
                          </button>
                        </div>
                      </Row>
                    );
                  })}
                </div>
              )}
            </Panel>
          )}

          {activeTab === "credentials" && (
            <Panel
              title="Credenciais"
              subtitle="Credenciais persistidas na base de dados."
            >
              {credentials.length === 0 ? (
                <EmptyState text="Ainda não existem credenciais emitidas." />
              ) : (
                <div className="space-y-3">
                  {credentials.map((item) => {
                    const busy =
                      actionBusy ===
                      `credential:${item.credentialCode}`;

                    return (
                      <Row
                        key={item.credentialCode}
                      >
                        <div>
                          <p className="font-display text-xl text-foreground">
                            {item.participantName}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.credentialCode} ·{" "}
                            {item.reservation
                              ?.reference ??
                              item.reservationId}{" "}
                            · {item.ticketName}
                          </p>
                        </div>

                        <Status
                          label={item.status}
                          tone={
                            item.status ===
                              "credential_issued" ||
                            item.status ===
                              "credential_ready" ||
                            item.status ===
                              "credential_checked_in"
                              ? "good"
                              : item.status ===
                                  "credential_blocked"
                                ? "bad"
                                : "neutral"
                          }
                        />

                        <Status
                          label={
                            item.status ===
                            "credential_checked_in"
                              ? "checked_in"
                              : "not_checked_in"
                          }
                          tone={
                            item.status ===
                            "credential_checked_in"
                              ? "good"
                              : "neutral"
                          }
                        />

                        <div className="flex justify-end">
                          {item.status ===
                          "credential_ready" ? (
                            <button
                              disabled={busy}
                              onClick={() =>
                                void setCredentialIssued(
                                  item.credentialCode,
                                )
                              }
                              className="admin-action disabled:opacity-40"
                            >
                              {busy
                                ? "A guardar..."
                                : "Emitir credencial"}
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {item.status ===
                              "credential_checked_in"
                                ? "Entrada validada"
                                : item.status ===
                                    "credential_blocked"
                                  ? "Bloqueada"
                                  : "Emitida"}
                            </span>
                          )}
                        </div>
                      </Row>
                    );
                  })}
                </div>
              )}
            </Panel>
          )}

          {activeTab === "audit" && (
            <Panel
              title="Auditoria"
              subtitle="Registo real de ações administrativas."
            >
              {auditLogs.length === 0 ? (
                <EmptyState text="Ainda não existem registos de auditoria." />
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <Row key={log.id}>
                      <div>
                        <p className="font-display text-xl text-foreground">
                          {log.action}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {log.actor?.name ??
                            log.actorEmail ??
                            "Sistema"}{" "}
                          · {log.targetType} ·{" "}
                          {log.targetRef} ·{" "}
                          {formatDate(log.createdAt)}
                        </p>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {log.previousState ?? "—"}
                      </div>

                      <div className="text-xs text-gold">
                        {log.nextState ?? "—"}
                      </div>

                      <div className="text-xs text-muted-foreground text-right">
                        PostgreSQL
                      </div>
                    </Row>
                  ))}
                </div>
              )}
            </Panel>
          )}
        </div>
      </section>
    </div>
  );
}

const inputCls =
  "w-full mt-2 bg-background border border-border/60 px-4 py-3 text-sm focus:border-gold outline-none";

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-border/40 bg-card/30 p-5 md:p-7">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-2">
            Gestão
          </p>

          <h2 className="font-display text-3xl">
            {title}
          </h2>
        </div>

        <p className="text-xs text-muted-foreground max-w-md md:text-right">
          {subtitle}
        </p>
      </div>

      {children}
    </section>
  );
}

function Row({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="grid lg:grid-cols-[1.4fr_0.7fr_0.8fr_1fr] gap-4 items-center border border-border/35 bg-background p-4">
      {children}
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="border border-border/35 bg-background px-5 py-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function Status({
  label,
  tone,
}: {
  label: string;
  tone: "good" | "warn" | "bad" | "neutral";
}) {
  const cls =
    tone === "good"
      ? "border-emerald-500/50 text-emerald-300 bg-emerald-500/10"
      : tone === "bad"
        ? "border-red-500/50 text-red-300 bg-red-500/10"
        : tone === "warn"
          ? "border-gold/60 text-gold bg-gold/10"
          : "border-border/60 text-muted-foreground bg-card/30";

  return (
    <span
      className={`inline-flex justify-center px-3 py-2 text-[10px] tracking-[0.22em] uppercase border ${cls}`}
    >
      {statusLabel(label)}
    </span>
  );
}

function OwnerCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="border border-border/40 bg-background p-5">
      <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
        {title}
      </p>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {body}
      </p>
    </div>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    reservation_created: "Reserva criada",
    payment_started: "Pagamento iniciado",

    payment_session_created: "Sessão criada",
    payment_pending: "Pagamento pendente",
    payment_processing: "Pagamento em processamento",
    payment_confirmed: "Pagamento confirmado",
    payment_failed: "Pagamento falhado",
    payment_cancelled: "Pagamento cancelado",
    payment_expired: "Pagamento expirado",

    admission_locked: "Admissão bloqueada",
    admission_available: "Admissão disponível",
    admission_submitted: "Admissão submetida",
    admission_under_review: "Admissão em análise",
    admission_approved: "Admissão aprovada",
    admission_rejected: "Admissão rejeitada",

    sponsor_inquiry_received: "Pedido recebido",
    sponsor_under_review: "Patrocínio em análise",
    sponsor_qualified: "Patrocinador qualificado",
    dossier_pending: "Dossier pendente",
    dossier_sent: "Dossier enviado",
    proposal_sent: "Proposta enviada",
    negotiation: "Em negociação",
    approved: "Aprovado",
    rejected: "Rejeitado",
    closed_won: "Fechado — ganho",
    closed_lost: "Fechado — perdido",

    credential_not_ready: "Credencial indisponível",
    credential_ready: "Credencial pronta",
    credential_issued: "Credencial emitida",
    credential_checked_in: "Entrada validada",
    credential_blocked: "Credencial bloqueada",

    not_checked_in: "Não entrou",
    checked_in: "Entrada validada",
  };

  return labels[status] ?? status;
}
