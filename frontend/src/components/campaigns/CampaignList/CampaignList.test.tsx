import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CampaignList } from "./CampaignList";
import {
  CAMPAIGN_SORT,
  CAMPAIGN_STATE,
  CAMPAIGN_STATUS_FILTER,
} from "@/constants/campaign";

describe("CampaignList", () => {
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
});
