import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CampaignListQuery } from "@/api";
import { CampaignList } from "./CampaignList";
import {
  CAMPAIGN_SORT,
  CAMPAIGN_STATE,
  CAMPAIGN_STATUS_FILTER,
} from "@/constants/campaign";

const campaigns = [
  { id: 41, name: "Test campaign", state: CAMPAIGN_STATE.ACTIVE },
];

function renderList({
  query = vi.fn(),
  items = campaigns,
  campaignCount = items.length,
  total = items.length,
}: {
  query?: (query: CampaignListQuery) => void;
  items?: typeof campaigns;
  campaignCount?: number;
  total?: number;
} = {}) {
  render(
    <CampaignList
      campaigns={items}
      loading={false}
      campaignCount={campaignCount}
      total={total}
      onQueryChange={query}
      selectedId={null}
      selectedStreamCount={0}
      onSelect={vi.fn()}
    />,
  );
  return query;
}

describe("CampaignList", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("shows campaigns and selects the clicked campaign", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <CampaignList
        campaigns={campaigns}
        loading={false}
        campaignCount={1}
        total={1}
        onQueryChange={vi.fn()}
        selectedId={null}
        selectedStreamCount={0}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByText("Активна")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Test campaign/ }));

    expect(onSelect).toHaveBeenCalledWith(41);
  });

  it("shows the empty state when there are no campaigns", () => {
    renderList({ items: [], campaignCount: 0, total: 0 });

    expect(screen.getByText("Кампаний пока нет. Создайте первую.")).toBeInTheDocument();
  });

  it("sends search and status changes to the server", async () => {
    const user = userEvent.setup();
    const query = renderList({
      items: [],
      campaignCount: 12,
      total: 3,
    });

    await user.type(screen.getByRole("searchbox", { name: "Поиск кампаний" }), "spring");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Фильтр по статусу" }),
      CAMPAIGN_STATUS_FILTER.ACTIVE,
    );

    await waitFor(() => {
      expect(query).toHaveBeenLastCalledWith({
        q: "spring",
        status: CAMPAIGN_STATUS_FILTER.ACTIVE,
        sort: CAMPAIGN_SORT.ID_ASC,
        offset: 0,
        limit: 25,
      });
    });
  });

  it("sends sort changes and paginates through server results", async () => {
    const user = userEvent.setup();
    const query = renderList({ total: 51 });
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Сортировка кампаний" }),
      CAMPAIGN_SORT.NAME,
    );
    await waitFor(() => {
      expect(query).toHaveBeenLastCalledWith({
        q: undefined,
        status: CAMPAIGN_STATUS_FILTER.ALL,
        sort: CAMPAIGN_SORT.NAME,
        offset: 0,
        limit: 25,
      });
    });

    await user.click(screen.getByRole("button", { name: "Далее" }));
    await waitFor(() => {
      expect(query).toHaveBeenLastCalledWith({
        q: undefined,
        status: CAMPAIGN_STATUS_FILTER.ALL,
        sort: CAMPAIGN_SORT.NAME,
        offset: 25,
        limit: 25,
      });
    });
    expect(screen.getByText("26–50 из 51")).toBeInTheDocument();
    expect(new URLSearchParams(window.location.search).get("page")).toBe("2");
  });

  it("initializes search, status, sorting, and page from URL parameters", async () => {
    window.history.replaceState(null, "", "/?q=active&status=active&sort=name&page=2");
    const query = renderList({
      items: [{ id: 9, name: "Zeta active", state: CAMPAIGN_STATE.ACTIVE }],
      total: 60,
    });

    expect(screen.getByRole("searchbox", { name: "Поиск кампаний" })).toHaveValue("active");
    expect(screen.getByRole("combobox", { name: "Фильтр по статусу" })).toHaveValue(
      CAMPAIGN_STATUS_FILTER.ACTIVE,
    );
    expect(screen.getByRole("combobox", { name: "Сортировка кампаний" })).toHaveValue(
      CAMPAIGN_SORT.NAME,
    );
    await waitFor(() => {
      expect(query).toHaveBeenLastCalledWith({
        q: "active",
        status: CAMPAIGN_STATUS_FILTER.ACTIVE,
        sort: CAMPAIGN_SORT.NAME,
        offset: 25,
        limit: 25,
      });
    });
  });

  it("updates URL parameters and responds to browser navigation", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/?utm_source=campaign-list");
    renderList({ items: [], campaignCount: 0, total: 0 });

    await user.type(screen.getByRole("searchbox", { name: "Поиск кампаний" }), "spring");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Фильтр по статусу" }),
      CAMPAIGN_STATUS_FILTER.ACTIVE,
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Сортировка кампаний" }),
      CAMPAIGN_SORT.NAME,
    );

    let params = new URLSearchParams(window.location.search);
    expect(params.get("q")).toBe("spring");
    expect(params.get("status")).toBe(CAMPAIGN_STATUS_FILTER.ACTIVE);
    expect(params.get("sort")).toBe(CAMPAIGN_SORT.NAME);
    expect(params.get("utm_source")).toBe("campaign-list");

    window.history.pushState(
      null,
      "",
      "/?q=summer&status=inactive&sort=id-desc&page=3&utm_source=campaign-list",
    );
    act(() => window.dispatchEvent(new PopStateEvent("popstate")));

    expect(screen.getByRole("searchbox", { name: "Поиск кампаний" })).toHaveValue("summer");
    expect(screen.getByRole("combobox", { name: "Фильтр по статусу" })).toHaveValue(
      CAMPAIGN_STATUS_FILTER.INACTIVE,
    );
    expect(screen.getByRole("combobox", { name: "Сортировка кампаний" })).toHaveValue(
      CAMPAIGN_SORT.ID_DESC,
    );
    params = new URLSearchParams(window.location.search);
    expect(params.get("utm_source")).toBe("campaign-list");
  });
});
