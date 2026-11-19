import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CampaignCreateDialog } from "./CampaignCreateDialog";
import { Metadata } from "@/api";

const metadata: Metadata = {
  domains: [{ id: 2, name: "tracker.test" }],
  groups: [{ id: 3, name: "Default group" }],
  traffic_sources: [{ id: 4, name: "Facebook" }],
  offers: [{ id: 8, name: "Offer A" }],
};

describe("CampaignCreateDialog", () => {
  it("submits normalized form values and closes after success", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn().mockResolvedValue(true);
    const onClose = vi.fn();
    render(
      <CampaignCreateDialog
        metadata={metadata}
        saving={false}
        onCreate={onCreate}
        onClose={onClose}
      />,
    );

    const campaignName = screen.getByRole("textbox", {
      name: "Название кампании",
    });
    expect(campaignName).toHaveAttribute("autocomplete", "off");
    await user.type(campaignName, " Spring test ");
    await user.type(screen.getByRole("textbox", { name: "Гео-код страны" }), "us");
    await user.selectOptions(screen.getByRole("combobox", { name: "Оффер" }), "8");
    await user.selectOptions(screen.getByRole("combobox", { name: "Домен" }), "2");
    await user.selectOptions(screen.getByRole("combobox", { name: "Группа" }), "3");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Источник трафика" }),
      "4",
    );
    await user.click(screen.getByRole("button", { name: "Создать кампанию" }));

    expect(onCreate).toHaveBeenCalledWith({
      name: "Spring test",
      country_code: "US",
      offer_id: 8,
      domain_id: 2,
      group_id: 3,
      traffic_source_id: 4,
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("keeps the dialog open when creation fails", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn().mockResolvedValue(false);
    const onClose = vi.fn();
    render(
      <CampaignCreateDialog
        metadata={metadata}
        saving={false}
        onCreate={onCreate}
        onClose={onClose}
      />,
    );

    await user.type(screen.getByRole("textbox", { name: "Название кампании" }), "Test");
    await user.type(screen.getByRole("textbox", { name: "Гео-код страны" }), "US");
    await user.selectOptions(screen.getByRole("combobox", { name: "Оффер" }), "8");
    await user.selectOptions(screen.getByRole("combobox", { name: "Домен" }), "2");
    await user.selectOptions(screen.getByRole("combobox", { name: "Группа" }), "3");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Источник трафика" }),
      "4",
    );
    await user.click(screen.getByRole("button", { name: "Создать кампанию" }));

    expect(onCreate).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not submit an invalid country code", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn().mockResolvedValue(true);
    render(
      <CampaignCreateDialog
        metadata={metadata}
        saving={false}
        onCreate={onCreate}
        onClose={vi.fn()}
      />,
    );

    await user.type(screen.getByRole("textbox", { name: "Название кампании" }), "Test");
    await user.type(screen.getByRole("textbox", { name: "Гео-код страны" }), "U");
    await user.selectOptions(screen.getByRole("combobox", { name: "Оффер" }), "8");
    await user.selectOptions(screen.getByRole("combobox", { name: "Домен" }), "2");
    await user.selectOptions(screen.getByRole("combobox", { name: "Группа" }), "3");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Источник трафика" }),
      "4",
    );
    await user.click(screen.getByRole("button", { name: "Создать кампанию" }));

    expect(onCreate).not.toHaveBeenCalled();
  });

  it("closes only when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <CampaignCreateDialog
        metadata={metadata}
        saving={false}
        onCreate={vi.fn()}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole("presentation"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
