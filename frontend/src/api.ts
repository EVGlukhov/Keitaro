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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    let message = `Ошибка запроса (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") message = body.detail;
    } catch {
      // Keep the HTTP status message when the response is not JSON.
    }
    throw new Error(message);
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
