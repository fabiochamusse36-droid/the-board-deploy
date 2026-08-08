const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  error: {
    code?: string;
    message?: string;
  };
};

type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export type AdmissionAccess = {
  reference: string;
  paymentStatus: string;
  admissionStatus: string;
  admissionAvailable: boolean;
  existingAdmission?: {
    id: string;
    reference: string;
    status: string;
    submittedAt?: string | null;
  } | null;
};

export type CreateAdmissionInput = {
  reservationReference: string;
  fullName: string;
  email: string;
  phone: string;
  profileType: string;
  company?: string;
  role?: string;
  investmentExperience?: string;
  motivation?: string;
};

export type CreatedAdmission = {
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
  status: string;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
};

async function readApi<T>(response: Response): Promise<T> {
  let payload: ApiEnvelope<T> | null = null;

  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new Error("Resposta inválida do servidor.");
  }

  if (!response.ok || !payload.ok) {
    const message =
      payload && !payload.ok
        ? payload.error?.message
        : null;

    throw new Error(
      message ||
        "Não foi possível comunicar com o backend do THE BOARD.",
    );
  }

  return payload.data;
}

export async function getAdmissionAccess(
  reference: string,
): Promise<AdmissionAccess> {
  const response = await fetch(
    `${API_BASE_URL}/api/admissions/access/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    },
  );

  return readApi<AdmissionAccess>(response);
}

export async function createAdmission(
  input: CreateAdmissionInput,
): Promise<CreatedAdmission> {
  const response = await fetch(
    `${API_BASE_URL}/api/admissions`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  return readApi<CreatedAdmission>(response);
}
