const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(
    message: string,
    status: number,
    code = "api_error",
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      "O servidor retornou uma resposta inválida.",
      response.status,
      "invalid_response",
    );
  }

  if (!response.ok || !payload.ok) {
    const message =
      payload && !payload.ok
        ? payload.error?.message
        : "Não foi possível comunicar com o servidor.";

    const code =
      payload && !payload.ok
        ? payload.error?.code
        : "request_failed";

    throw new ApiError(
      message || "Não foi possível comunicar com o servidor.",
      response.status,
      code || "request_failed",
    );
  }

  return payload.data;
}

export async function apiRequest<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  headers.set("accept", "application/json");

  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  headers.set("authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  return readResponse<T>(response);
}

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export function getAdminReservations<T>(
  accessToken: string,
  page = 1,
  pageSize = 100,
) {
  return apiRequest<PaginatedResponse<T>>(
    `/api/admin/reservations?page=${page}&pageSize=${pageSize}`,
    accessToken,
  );
}

export function getAdminPayments<T>(
  accessToken: string,
  page = 1,
  pageSize = 100,
) {
  return apiRequest<PaginatedResponse<T>>(
    `/api/admin/payments?page=${page}&pageSize=${pageSize}`,
    accessToken,
  );
}

export function getAdminAdmissions<T>(
  accessToken: string,
  page = 1,
  pageSize = 100,
) {
  return apiRequest<PaginatedResponse<T>>(
    `/api/admin/admissions?page=${page}&pageSize=${pageSize}`,
    accessToken,
  );
}

export function getAdminSponsors<T>(
  accessToken: string,
  page = 1,
  pageSize = 100,
) {
  return apiRequest<PaginatedResponse<T>>(
    `/api/admin/sponsors?page=${page}&pageSize=${pageSize}`,
    accessToken,
  );
}

export function getAdminCredentials<T>(
  accessToken: string,
  page = 1,
  pageSize = 100,
) {
  return apiRequest<PaginatedResponse<T>>(
    `/api/admin/credentials?page=${page}&pageSize=${pageSize}`,
    accessToken,
  );
}

export function getAdminAudit<T>(
  accessToken: string,
  page = 1,
  pageSize = 100,
) {
  return apiRequest<PaginatedResponse<T>>(
    `/api/admin/audit?page=${page}&pageSize=${pageSize}`,
    accessToken,
  );
}

export function reviewAdmission<T>(
  accessToken: string,
  reference: string,
  status: string,
) {
  return apiRequest<T>(
    `/api/admin/admissions/${encodeURIComponent(reference)}/review`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

export function updateSponsorStatus<T>(
  accessToken: string,
  reference: string,
  status: string,
) {
  return apiRequest<T>(
    `/api/admin/sponsors/${encodeURIComponent(reference)}/status`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

export function issueCredential<T>(
  accessToken: string,
  reservationReference: string,
) {
  return apiRequest<T>(
    "/api/admin/credentials/issue",
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        reservationReference,
      }),
    },
  );
}

export function updateCredentialStatus<T>(
  accessToken: string,
  credentialCode: string,
  status: string,
) {
  return apiRequest<T>(
    `/api/admin/credentials/${encodeURIComponent(
      credentialCode,
    )}/status`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}
