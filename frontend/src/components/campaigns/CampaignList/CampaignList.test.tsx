import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CampaignList } from "./CampaignList";

describe("CampaignList", () => {
  it("shows campaigns and selects the clicked campaign", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <CampaignList
        campaigns={[
          { id: 41, name: "Test campaign", state: "active", streams: [{ id: 100 }] },
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
        campaigns={[{ id: 41, name: "Test campaign", state: "active" }]}
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
});
