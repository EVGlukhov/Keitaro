import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "./client";

const fetchMock = vi.fn();
const listQuery = {
  q: "",
  status: "all",
  sort: "id-asc",
  offset: 0,
  limit: 25,
} as const;

describe("API request errors", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("shows a readable message for network failures", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(api.campaigns(listQuery)).rejects.toMatchObject({
      name: "ApiError",
      status: null,
      message: "Не удалось связаться с сервером. Проверьте подключение и повторите попытку.",
    });
  });

  it("uses the backend error detail when available", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ detail: "Keitaro недоступен" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(api.campaigns(listQuery)).rejects.toMatchObject({
      name: "ApiError",
      status: 502,
      message: "Keitaro недоступен",
    });
  });

  it("formats FastAPI validation details and falls back for non-JSON responses", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          detail: [{ loc: ["body", "country_code"], msg: "Invalid country code" }],
        }),
        { status: 422, headers: { "Content-Type": "application/json" } },
      ),
    );
    await expect(api.campaigns(listQuery)).rejects.toMatchObject({
      message: "country_code: Invalid country code",
    });

    fetchMock.mockResolvedValueOnce(new Response("<html>error</html>", { status: 503 }));
    await expect(api.campaigns(listQuery)).rejects.toEqual(
      new ApiError("Не удалось выполнить запрос (HTTP 503).", 503),
    );
  });

  it("encodes campaign list filters as query parameters", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [],
          total: 0,
          campaign_count: 0,
          limit: 25,
          offset: 0,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await api.campaigns({
      ...listQuery,
      q: "Spring campaign",
      status: "active",
      offset: 25,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/campaigns?q=Spring+campaign&status=active&sort=id-asc&offset=25&limit=25",
      expect.any(Object),
    );
  });
});
