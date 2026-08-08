const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  error?: {
    code?: string;
    message?: string;
  };
};

type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export type BackendTicket = {
  id: string;
  name: string;
  price: number;
  currency: string;
  available: boolean;
};

export type TicketsResponse = {
  tickets: BackendTicket[];
};

async function readApi<T>(
  response: Response,
): Promise<T> {
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
        "Não foi possível carregar os bilhetes do THE BOARD.",
    );
  }

  return payload.data;
}

export async function getTickets(): Promise<
  BackendTicket[]
> {
  const response = await fetch(
    `${API_BASE_URL}/api/tickets`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    },
  );

  const data =
    await readApi<TicketsResponse>(response);

  return data.tickets;
}

export async function getAvailableTicket(
  ticketId: string,
): Promise<BackendTicket> {
  const tickets = await getTickets();

  const ticket = tickets.find(
    (item) => item.id === ticketId,
  );

  if (!ticket) {
    throw new Error("Bilhete não encontrado.");
  }

  if (!ticket.available) {
    throw new Error(
      "Este bilhete ainda não está disponível.",
    );
  }

  return ticket;
}
