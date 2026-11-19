import { FormEvent } from "react";
import { Plus as PlusIcon } from "lucide-react";
import { CampaignCreateRequest, Metadata, Option } from "@/api";
import { optionLabel } from "@/utils/campaign";
import {
  Button,
  FormField,
  SelectInput,
  TextInput,
} from "@/components/ui";
import type { SelectInputOption } from "@/components/ui";

type CampaignCreateFormProps = {
  metadata: Metadata;
  saving: boolean;
  onClose: () => void;
  onCreate: (campaign: CampaignCreateRequest) => Promise<boolean>;
};

export function CampaignCreateForm({
  metadata,
  saving,
  onClose,
  onCreate,
}: CampaignCreateFormProps) {
  const offerOptions = createSelectOptions(metadata.offers, "Выберите оффер", true);
  const domainOptions = createSelectOptions(metadata.domains, "Выберите домен");
  const groupOptions = createSelectOptions(metadata.groups, "Выберите группу");
  const trafficSourceOptions = createSelectOptions(
    metadata.traffic_sources,
    "Выберите источник",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const created = await onCreate({
      name: String(form.get("name") ?? "").trim(),
      country_code: String(form.get("country_code") ?? "").trim().toUpperCase(),
      offer_id: Number(form.get("offer_id")),
      domain_id: Number(form.get("domain_id")),
      group_id: Number(form.get("group_id")),
      traffic_source_id: Number(form.get("traffic_source_id")),
    });
    if (created) onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Название кампании">
        <TextInput name="name" placeholder="Например, US — весенняя акция" required maxLength={255} />
      </FormField>
      <div className="mt-4 grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-2">
        <FormField label="Гео-код страны">
          <TextInput
            name="country_code"
            placeholder="US"
            required
            minLength={2}
            maxLength={2}
            pattern="[A-Za-z]{2}"
            title="Двухбуквенный ISO-код, например US"
          />
        </FormField>
        <FormField label="Оффер">
          <SelectInput
            name="offer_id"
            options={offerOptions}
            required
            defaultValue=""
          />
        </FormField>
        <FormField label="Домен">
          <SelectInput
            name="domain_id"
            options={domainOptions}
            required
            defaultValue=""
          />
        </FormField>
        <FormField label="Группа">
          <SelectInput
            name="group_id"
            options={groupOptions}
            required
            defaultValue=""
          />
        </FormField>
        <FormField label="Источник трафика" className="sm:col-span-2">
          <SelectInput
            name="traffic_source_id"
            options={trafficSourceOptions}
            required
            defaultValue=""
          />
        </FormField>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" loading={saving}>
          {!saving && <PlusIcon size={16} />}
          Создать кампанию
        </Button>
      </div>
    </form>
  );
}

function createSelectOptions(
  options: Option[],
  placeholder: string,
  includeId = false,
): SelectInputOption[] {
  return [
    { value: "", label: placeholder, disabled: true },
    ...options.map((option) => ({
      value: option.id,
      label: includeId
        ? `${optionLabel(option)} · #${option.id}`
        : optionLabel(option),
    })),
  ];
}
