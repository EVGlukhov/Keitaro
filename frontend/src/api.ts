export type Option = {
  id: number;
  name: string;
  [key: string]: unknown;
};

export type Stream = {
  id: number;
  name?: string;
  position?: number;
  action_type?: string;
  action_options?: { offer_id?: number; [key: string]: unknown };
  [key: string]: unknown;
};

export type Campaign = {
  id: number;
  name: string;
  state?: string | null;
  streams?: Stream[];
};

export type Metadata = {
  domains: Option[];
  groups: Option[];
  traffic_sources: Option[];
  offers: Option[];
};

export type CampaignCreateRequest = {
  name: string;
  country_code: string;
  offer_id: number;
  domain_id: number;
  group_id: number;
  traffic_source_id: number;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getErrorMessage(detail: unknown, fallback: string): string {
  if (typeof detail === "string" && detail.trim()) return detail;
  if (!Array.isArray(detail)) return fallback;

  const messages = detail.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const error = item as { loc?: unknown; msg?: unknown };
    if (typeof error.msg !== "string") return [];

    const location = Array.isArray(error.loc)
      ? error.loc.filter((part) => part !== "body").join(".")
      : "";
    return [location ? `${location}: ${error.msg}` : error.msg];
  });

  return messages.length > 0 ? messages.join("; ") : fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (reason) {
    if (reason instanceof Error && reason.name === "AbortError") throw reason;
    throw new ApiError(
      "Не удалось связаться с сервером. Проверьте подключение и повторите попытку.",
      null,
    );
  }

  if (!response.ok) {
    const fallback = `Не удалось выполнить запрос (HTTP ${response.status}).`;
    let detail: unknown;
    try {
      const body = await response.json();
      detail = body && typeof body === "object" ? body.detail : undefined;
    } catch {
      detail = undefined;
    }
    throw new ApiError(getErrorMessage(detail, fallback), response.status);
  }
  return response.json() as Promise<T>;
}

export const api = {
  metadata: () => request<Metadata>("/api/metadata"),
  campaigns: () => request<Campaign[]>("/api/campaigns"),
  campaign: (id: number) => request<Campaign>(`/api/campaigns/${id}`),
  createCampaign: (data: CampaignCreateRequest) =>
    request<Campaign>("/api/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  addOffer: (campaignId: number, offerId: number) =>
    request<Stream>(`/api/campaigns/${campaignId}/offers`, {
      method: "POST",
      body: JSON.stringify({ offer_id: offerId }),
    }),
  deleteOffer: (campaignId: number, streamId: number) =>
    request<{ deleted: number }>(
      `/api/campaigns/${campaignId}/offers/${streamId}`,
      { method: "DELETE" },
    ),
};
