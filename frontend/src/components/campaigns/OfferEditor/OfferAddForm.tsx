import { ChangeEvent, FormEvent, useState } from "react";
import { Plus as PlusIcon } from "lucide-react";
import { Metadata } from "@/api";
import { optionLabel } from "@/utils/campaign";
import { Button, FormField, SelectInput } from "@/components/ui";
import type { SelectInputOption } from "@/components/ui";

type OfferAddFormProps = {
  metadata: Metadata | null;
  saving: boolean;
  onAddOffer: (offerId: number) => Promise<boolean>;
};

export function OfferAddForm({
  metadata,
  saving,
  onAddOffer,
}: OfferAddFormProps) {
  const [newOfferId, setNewOfferId] = useState("");
  const selectedOffer = metadata?.offers.find(
    (offer) => offer.id === Number(newOfferId),
  );
  const offerOptions: SelectInputOption[] = [
    { value: "", label: "Выберите оффер" },
    ...(metadata?.offers.map((offer) => ({
      value: offer.id,
      label: `${optionLabel(offer)} · #${offer.id}`,
    })) ?? []),
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newOfferId) return;
    if (await onAddOffer(Number(newOfferId))) setNewOfferId("");
  }

  function handleOfferChange(event: ChangeEvent<HTMLSelectElement>) {
    setNewOfferId(event.currentTarget.value);
  }

  return (
    <form
      className="border-b border-slate-100 py-3"
      onSubmit={handleSubmit}
    >
      <FormField label="Добавить оффер" htmlFor="add-offer">
        <div className="mt-2 flex gap-2">
          <SelectInput
            className="min-w-0 flex-1"
            compact
            id="add-offer"
            value={newOfferId}
            onChange={handleOfferChange}
            options={offerOptions}
            required
          />
          <Button
            size="small"
            type="submit"
            disabled={!selectedOffer}
            loading={saving}
            className="shrink-0"
          >
            {!saving && <PlusIcon size={15} />}
            Добавить
          </Button>
        </div>
      </FormField>
    </form>
  );
}
