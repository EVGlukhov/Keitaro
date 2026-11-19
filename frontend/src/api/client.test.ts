import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "./client";

const fetchMock = vi.fn();

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

    await expect(api.campaigns()).rejects.toMatchObject({
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

    await expect(api.campaigns()).rejects.toMatchObject({
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
    await expect(api.campaigns()).rejects.toMatchObject({
      message: "country_code: Invalid country code",
    });

    fetchMock.mockResolvedValueOnce(new Response("<html>error</html>", { status: 503 }));
    await expect(api.campaigns()).rejects.toEqual(
      new ApiError("Не удалось выполнить запрос (HTTP 503).", 503),
    );
  });
});
