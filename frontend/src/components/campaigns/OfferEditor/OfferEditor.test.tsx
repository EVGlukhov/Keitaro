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
  schema: "landings",
  action_type: "http",
  offers: [{ offer_id: 8, share: 100, state: "active" }],
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
        detailLoading={false}
        detailError=""
        metadata={metadata}
        saving={false}
        onRetryDetail={vi.fn()}
        onAddOffer={onAddOffer}
        onRemoveOffer={vi.fn().mockResolvedValue(true)}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox", { name: /Добавить оффер/ }), "9");
    await user.click(screen.getByRole("button", { name: "Добавить" }));

    expect(onAddOffer).toHaveBeenCalledWith(9);
    expect(screen.getByRole("combobox", { name: /Добавить оффер/ })).toHaveValue("");
  });

  it("keeps the selected offer when the add request fails", async () => {
    const user = userEvent.setup();
    const onAddOffer = vi.fn().mockResolvedValue(false);
    render(
      <OfferEditor
        campaign={campaign}
        detailLoading={false}
        detailError=""
        metadata={metadata}
        saving={false}
        onRetryDetail={vi.fn()}
        onAddOffer={onAddOffer}
        onRemoveOffer={vi.fn().mockResolvedValue(true)}
      />,
    );

    const offerSelect = screen.getByRole("combobox", { name: /Добавить оффер/ });
    expect(screen.getByRole("button", { name: "Добавить" })).toBeDisabled();
    await user.selectOptions(offerSelect, "9");
    await user.click(screen.getByRole("button", { name: "Добавить" }));

    expect(onAddOffer).toHaveBeenCalledWith(9);
    expect(offerSelect).toHaveValue("9");
  });

  it("confirms deletion in a dialog and never offers to remove geo streams", async () => {
    const user = userEvent.setup();
    const onRemoveOffer = vi.fn().mockResolvedValue(true);
    render(
      <OfferEditor
        campaign={campaign}
        detailLoading={false}
        detailError=""
        metadata={metadata}
        saving={false}
        onRetryDetail={vi.fn()}
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
        detailLoading={false}
        detailError=""
        metadata={metadata}
        saving={false}
        onRetryDetail={vi.fn()}
        onAddOffer={vi.fn().mockResolvedValue(true)}
        onRemoveOffer={onRemoveOffer}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Удалить оффер" }));
    await user.click(screen.getByRole("button", { name: "Отмена" }));

    expect(onRemoveOffer).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows a loading state while campaign details are fetched", () => {
    render(
      <OfferEditor
        campaign={null}
        detailLoading
        detailError=""
        metadata={metadata}
        saving={false}
        onRetryDetail={vi.fn()}
        onAddOffer={vi.fn().mockResolvedValue(true)}
        onRemoveOffer={vi.fn().mockResolvedValue(true)}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Загружаем кампанию…");
  });

  it("retries a failed campaign detail request", async () => {
    const user = userEvent.setup();
    const onRetryDetail = vi.fn();
    render(
      <OfferEditor
        campaign={null}
        detailLoading={false}
        detailError="Не удалось открыть кампанию"
        metadata={metadata}
        saving={false}
        onRetryDetail={onRetryDetail}
        onAddOffer={vi.fn().mockResolvedValue(true)}
        onRemoveOffer={vi.fn().mockResolvedValue(true)}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Не удалось открыть кампанию");
    await user.click(screen.getByRole("button", { name: "Повторить загрузку" }));

    expect(onRetryDetail).toHaveBeenCalledOnce();
  });
});
