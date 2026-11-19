import { expect, test } from "@playwright/test";
import { Campaign, Metadata, Stream } from "../../src/api";

const metadata: Metadata = {
  domains: [{ id: 2, name: "tracker.test" }],
  groups: [{ id: 3, name: "Default group" }],
  traffic_sources: [{ id: 4, name: "Facebook" }],
  offers: [
    { id: 8, name: "Offer A" },
    { id: 9, name: "Offer B" },
  ],
};

test("creates a campaign, adds an offer, and removes only the offer stream", async ({ page }) => {
  const campaigns: Campaign[] = [];
  const streams = new Map<number, Stream[]>();
  let nextStreamId = 100;

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    if (!pathname.startsWith("/api/")) {
      await route.continue();
      return;
    }

    if (request.method() === "GET" && pathname === "/api/metadata") {
      await route.fulfill({ json: metadata });
      return;
    }
    if (request.method() === "GET" && pathname === "/api/campaigns") {
      await route.fulfill({
        json: {
          items: campaigns,
          total: campaigns.length,
          campaign_count: campaigns.length,
          limit: 25,
          offset: 0,
        },
      });
      return;
    }
    if (request.method() === "POST" && pathname === "/api/campaigns") {
      const input = request.postDataJSON();
      const campaign: Campaign = {
        id: 41,
        name: input.name,
        state: "active",
        streams: [
          {
            id: nextStreamId++,
            name: `Гео ${input.country_code} → Google`,
            action_type: "http",
          },
          {
            id: nextStreamId++,
            name: "Оффер 8",
            action_type: "offer",
            action_options: { offer_id: 8 },
          },
        ],
      };
      campaigns.push(campaign);
      streams.set(campaign.id, campaign.streams ?? []);
      await route.fulfill({ status: 201, json: campaign });
      return;
    }

    const detailMatch = pathname.match(/^\/api\/campaigns\/(\d+)$/);
    if (request.method() === "GET" && detailMatch) {
      const campaign = campaigns.find((item) => item.id === Number(detailMatch[1]));
      await route.fulfill({
        status: campaign ? 200 : 404,
        json: campaign ? { ...campaign, streams: streams.get(campaign.id) } : {},
      });
      return;
    }

    const addMatch = pathname.match(/^\/api\/campaigns\/(\d+)\/offers$/);
    if (request.method() === "POST" && addMatch) {
      const campaignId = Number(addMatch[1]);
      const { offer_id: offerId } = request.postDataJSON();
      const stream: Stream = {
        id: nextStreamId++,
        name: `Оффер ${offerId}`,
        action_type: "offer",
        action_options: { offer_id: offerId },
      };
      streams.get(campaignId)?.push(stream);
      await route.fulfill({ status: 201, json: stream });
      return;
    }

    const deleteMatch = pathname.match(/^\/api\/campaigns\/(\d+)\/offers\/(\d+)$/);
    if (request.method() === "DELETE" && deleteMatch) {
      const [, campaignId, streamId] = deleteMatch;
      streams.set(
        Number(campaignId),
        (streams.get(Number(campaignId)) ?? []).filter(
          (stream) => stream.id !== Number(streamId),
        ),
      );
      await route.fulfill({ json: { deleted: Number(streamId) } });
      return;
    }

    await route.fulfill({ status: 404, json: { detail: "Unexpected API request" } });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Создать кампанию" }).click();
  await page.getByRole("textbox", { name: "Название кампании" }).fill("US Spring");
  await page.getByRole("textbox", { name: "Гео-код страны" }).fill("us");
  await page.getByRole("combobox", { name: "Оффер" }).selectOption("8");
  await page.getByRole("combobox", { name: "Домен" }).selectOption("2");
  await page.getByRole("combobox", { name: "Группа" }).selectOption("3");
  await page.getByRole("combobox", { name: "Источник трафика" }).selectOption("4");
  await page.getByRole("button", { name: "Создать кампанию" }).last().click();

  await expect(page.getByText("Гео US → Google")).toBeVisible();
  await expect(page.getByText("Offer A", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Удалить оффер" })).toHaveCount(1);

  await page.getByRole("combobox", { name: "Добавить оффер" }).selectOption("9");
  await page.getByRole("button", { name: "Добавить" }).click();
  await expect(page.getByText("Offer B", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Удалить оффер" })).toHaveCount(2);

  await page.getByRole("button", { name: "Удалить оффер" }).last().click();
  const removeDialog = page.getByRole("dialog", { name: "Удалить оффер?" });
  await expect(removeDialog).toBeVisible();
  await removeDialog.getByRole("button", { name: "Удалить" }).click();
  await expect(page.getByText("Offer B", { exact: true })).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Удалить оффер" })).toHaveCount(1);
  await expect(page.getByText("Гео US → Google")).toBeVisible();
});
