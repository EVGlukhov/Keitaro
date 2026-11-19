import { FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { CampaignCreateRequest, Metadata } from "@/api";
import { optionLabel } from "@/utils/campaign";
import { Button, FormField, IconButton, SelectInput, TextInput } from "@/components/ui";

type CampaignCreateModalProps = {
  metadata: Metadata;
  saving: boolean;
  onClose: () => void;
  onCreate: (campaign: CampaignCreateRequest) => Promise<boolean>;
};

export function CampaignCreateModal({
  metadata,
  saving,
  onClose,
  onCreate,
}: CampaignCreateModalProps) {
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
    <div
      className="fixed inset-0 z-20 grid place-items-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="my-auto w-full max-w-dialog rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="flex items-center gap-2 text-caption font-bold tracking-label text-slate-500">
              <i className="h-0.5 w-3.5 rounded bg-violet-500" /> НОВАЯ КАМПАНИЯ
            </span>
            <h2 id="modal-title" className="mt-2 text-xl font-bold tracking-tight text-slate-900">
              Настроить кампанию
            </h2>
          </div>
          <IconButton label="Закрыть" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>

        <p className="mb-5 mt-2 text-ui-sm leading-relaxed text-slate-500">
          Будут созданы два потока: гео-фильтр на Google и поток выбранного оффера.
        </p>
        <form onSubmit={(event) => void handleSubmit(event)}>
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
              <SelectInput name="offer_id" required defaultValue="">
                <option value="" disabled>Выберите оффер</option>
                {metadata.offers.map((option) => (
                  <option key={option.id} value={option.id}>
                    {optionLabel(option)} · #{option.id}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Домен">
              <SelectInput name="domain_id" required defaultValue="">
                <option value="" disabled>Выберите домен</option>
                {metadata.domains.map((option) => (
                  <option key={option.id} value={option.id}>{optionLabel(option)}</option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Группа">
              <SelectInput name="group_id" required defaultValue="">
                <option value="" disabled>Выберите группу</option>
                {metadata.groups.map((option) => (
                  <option key={option.id} value={option.id}>{optionLabel(option)}</option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Источник трафика" className="sm:col-span-2">
              <SelectInput name="traffic_source_id" required defaultValue="">
                <option value="" disabled>Выберите источник</option>
                {metadata.traffic_sources.map((option) => (
                  <option key={option.id} value={option.id}>{optionLabel(option)}</option>
                ))}
              </SelectInput>
            </FormField>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" loading={saving}>
              {!saving && <Plus size={16} />}
              Создать кампанию
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
