import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CampaignList } from "./CampaignList";
import {
  CAMPAIGN_SORT,
  CAMPAIGN_STATE,
  CAMPAIGN_STATUS_FILTER,
} from "@/constants/campaign";

describe("CampaignList", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("shows campaigns and selects the clicked campaign", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <CampaignList
        campaigns={[
          {
            id: 41,
            name: "Test campaign",
            state: CAMPAIGN_STATE.ACTIVE,
            streams: [{ id: 100 }],
          },
        ]}
        loading={false}
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
    render(
      <CampaignList
        campaigns={[]}
        loading={false}
        selectedId={null}
        selectedStreamCount={0}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("Кампаний пока нет. Создайте первую.")).toBeInTheDocument();
  });

  it("marks the selected campaign button", () => {
    render(
      <CampaignList
        campaigns={[{ id: 41, name: "Test campaign", state: CAMPAIGN_STATE.ACTIVE }]}
        loading={false}
        selectedId={41}
        selectedStreamCount={0}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /Test campaign/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("searches by name or ID and filters by campaign status", async () => {
    const user = userEvent.setup();
    render(
      <CampaignList
        campaigns={[
          { id: 41, name: "Spring active", state: CAMPAIGN_STATE.ACTIVE },
          { id: 42, name: "Spring paused", state: "disabled" },
          { id: 43, name: "Summer active", state: CAMPAIGN_STATE.ACTIVE },
        ]}
        loading={false}
        selectedId={null}
        selectedStreamCount={0}
        onSelect={vi.fn()}
      />,
    );

    await user.type(screen.getByRole("searchbox", { name: "Поиск кампаний" }), "spring");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Фильтр по статусу" }),
      CAMPAIGN_STATUS_FILTER.ACTIVE,
    );

    expect(screen.getByRole("button", { name: /Spring active/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Spring paused/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Summer active/ })).not.toBeInTheDocument();

    await user.clear(screen.getByRole("searchbox", { name: "Поиск кампаний" }));
    await user.type(screen.getByRole("searchbox", { name: "Поиск кампаний" }), "43");
    expect(screen.getByRole("button", { name: /Summer active/ })).toBeInTheDocument();
  });

  it("sorts campaigns by name or ID", async () => {
    const user = userEvent.setup();
    render(
      <CampaignList
        campaigns={[
          { id: 9, name: "Zeta", state: CAMPAIGN_STATE.ACTIVE },
          { id: 3, name: "Alpha", state: CAMPAIGN_STATE.ACTIVE },
        ]}
        loading={false}
        selectedId={null}
        selectedStreamCount={0}
        onSelect={vi.fn()}
      />,
    );

    const sort = screen.getByRole("combobox", { name: "Сортировка кампаний" });
    await user.selectOptions(sort, CAMPAIGN_SORT.NAME);
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual([
      expect.stringContaining("Alpha"),
      expect.stringContaining("Zeta"),
    ]);

    await user.selectOptions(sort, CAMPAIGN_SORT.ID_DESC);
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual([
      expect.stringContaining("Zeta"),
      expect.stringContaining("Alpha"),
    ]);
  });

  it("initializes search, status, and sorting from URL parameters", () => {
    window.history.replaceState(
      null,
      "",
      "/?q=active&status=active&sort=name",
    );
    render(
      <CampaignList
        campaigns={[
          { id: 9, name: "Zeta active", state: CAMPAIGN_STATE.ACTIVE },
          { id: 3, name: "Alpha active", state: CAMPAIGN_STATE.ACTIVE },
          { id: 2, name: "Beta paused", state: "disabled" },
        ]}
        loading={false}
        selectedId={null}
        selectedStreamCount={0}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole("searchbox", { name: "Поиск кампаний" })).toHaveValue("active");
    expect(screen.getByRole("combobox", { name: "Фильтр по статусу" })).toHaveValue(
      CAMPAIGN_STATUS_FILTER.ACTIVE,
    );
    expect(screen.getByRole("combobox", { name: "Сортировка кампаний" })).toHaveValue(
      CAMPAIGN_SORT.NAME,
    );
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual([
      expect.stringContaining("Alpha active"),
      expect.stringContaining("Zeta active"),
    ]);
  });

  it("updates URL parameters and responds to browser navigation", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/?utm_source=campaign-list");
    render(
      <CampaignList
        campaigns={[]}
        loading={false}
        selectedId={null}
        selectedStreamCount={0}
        onSelect={vi.fn()}
      />,
    );

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
      "/?q=summer&status=inactive&sort=id-desc&utm_source=campaign-list",
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
