import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import type { Campaign, Metadata } from "../../src/api";

const metadata: Metadata = {
  domains: [{ id: 2, name: "tracker.test" }],
  groups: [{ id: 3, name: "Default group" }],
  traffic_sources: [{ id: 4, name: "Facebook" }],
  offers: [{ id: 8, name: "Offer A" }],
};

const campaign: Campaign = {
  id: 41,
  name: "Existing campaign",
  state: "active",
  streams: [
    { id: 100, name: "Geo redirect", action_type: "http" },
    {
      id: 101,
      name: "Offer 8",
      action_type: "offer",
      action_options: { offer_id: 8 },
    },
  ],
};

async function expectNoAccessibilityViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const details = violations
    .map((violation) => `${violation.id}: ${violation.help}`)
    .join("\n");

  expect(violations, details).toEqual([]);
}

test("campaign page and dialogs meet WCAG 2.1 A/AA checks", async ({ page }) => {
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
          items: [campaign],
          total: 1,
          campaign_count: 1,
          limit: 25,
          offset: 0,
        },
      });
      return;
    }
    if (request.method() === "GET" && pathname === "/api/campaigns/41") {
      await route.fulfill({ json: campaign });
      return;
    }

    await route.fulfill({ status: 404, json: { detail: "Unexpected API request" } });
  });

  await page.goto("/");
  await expect(page.getByRole("button", { name: /Existing campaign/ })).toBeVisible();
  await expectNoAccessibilityViolations(page);

  await page.getByRole("button", { name: /Existing campaign/ }).click();
  await expect(page.getByText("Offer A", { exact: true })).toBeVisible();
  await expectNoAccessibilityViolations(page);

  await page.getByRole("button", { name: "Создать кампанию" }).first().click();
  await expect(page.getByRole("dialog", { name: "Настроить кампанию" })).toBeVisible();
  await expectNoAccessibilityViolations(page);
  await page.getByRole("button", { name: "Закрыть" }).click();

  await page.getByRole("button", { name: "Удалить оффер" }).click();
  await expect(page.getByRole("dialog", { name: "Удалить оффер?" })).toBeVisible();
  await expectNoAccessibilityViolations(page);
});
