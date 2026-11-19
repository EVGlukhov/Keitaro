import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Campaign, Metadata, Stream } from "@/api";
import { OfferEditor } from "./OfferEditor";

const metadata: Metadata = {
  domains: [],
  groups: [],
  traffic_sources: [],
  offers: [
    { id: 8, name: "Offer A" },
    { id: 9, name: "Offer B" },
  ],
};

const offerStream: Stream = {
  id: 101,
  name: "Offer 8",
  action_type: "offer",
  action_options: { offer_id: 8 },
};

const campaign: Campaign = {
  id: 41,
  name: "Test campaign",
  streams: [
    { id: 100, name: "Geo redirect", action_type: "http" },
    offerStream,
  ],
};

describe("OfferEditor", () => {
  it("adds the selected offer", async () => {
    const user = userEvent.setup();
    const onAddOffer = vi.fn().mockResolvedValue(true);
    render(
      <OfferEditor
        campaign={campaign}
        metadata={metadata}
        saving={false}
        onAddOffer={onAddOffer}
        onRemoveOffer={vi.fn().mockResolvedValue(true)}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox", { name: /Добавить оффер/ }), "9");
    await user.click(screen.getByRole("button", { name: "Добавить" }));

    expect(onAddOffer).toHaveBeenCalledWith(9);
  });

  it("confirms deletion in a dialog and never offers to remove geo streams", async () => {
    const user = userEvent.setup();
    const onRemoveOffer = vi.fn().mockResolvedValue(true);
    render(
      <OfferEditor
        campaign={campaign}
        metadata={metadata}
        saving={false}
        onAddOffer={vi.fn().mockResolvedValue(true)}
        onRemoveOffer={onRemoveOffer}
      />,
    );

    expect(screen.getAllByRole("button", { name: "Удалить оффер" })).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Удалить оффер" }));

    expect(screen.getByRole("dialog", { name: "Удалить оффер?" })).toHaveTextContent(
      "Поток «Offer 8» будет удалён из кампании.",
    );
    expect(onRemoveOffer).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Удалить" }));
    expect(onRemoveOffer).toHaveBeenCalledWith(offerStream);
  });

  it("does not remove an offer when dialog is cancelled", async () => {
    const user = userEvent.setup();
    const onRemoveOffer = vi.fn().mockResolvedValue(true);
    render(
      <OfferEditor
        campaign={campaign}
        metadata={metadata}
        saving={false}
        onAddOffer={vi.fn().mockResolvedValue(true)}
        onRemoveOffer={onRemoveOffer}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Удалить оффер" }));
    await user.click(screen.getByRole("button", { name: "Отмена" }));

    expect(onRemoveOffer).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
