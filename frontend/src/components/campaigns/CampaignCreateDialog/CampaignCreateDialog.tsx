import { FormEvent } from "react";
import { Plus as PlusIcon, X as XIcon } from "lucide-react";
import { CampaignCreateRequest, Metadata } from "@/api";
import { optionLabel } from "@/utils/campaign";
import { Button, Dialog, FormField, IconButton, SelectInput, TextInput, Typography } from "@/components/ui";

type CampaignCreateDialogProps = {
  metadata: Metadata;
  saving: boolean;
  onClose: () => void;
  onCreate: (campaign: CampaignCreateRequest) => Promise<boolean>;
};

export function CampaignCreateDialog({
  metadata,
  saving,
  onClose,
  onCreate,
}: CampaignCreateDialogProps) {
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
    <Dialog labelledBy="modal-title" onClose={onClose}>
      <div className="flex items-start justify-between">
        <div>
          <Typography as="span" variant="caption" className="flex items-center gap-2 font-bold tracking-label text-slate-500">
            <i className="h-0.5 w-3.5 rounded bg-violet-500" />
            НОВАЯ КАМПАНИЯ
          </Typography>
          <Typography as="h2" variant="title" id="modal-title" className="mt-2 font-bold tracking-tight text-slate-900">
            Настроить кампанию
          </Typography>
        </div>
        <IconButton label="Закрыть" onClick={onClose}>
          <XIcon size={18} />
        </IconButton>
      </div>

      <Typography as="p" variant="uiSmall" className="mb-5 mt-2 leading-relaxed text-slate-500">
        Будут созданы два потока: гео-фильтр на Google и поток выбранного оффера.
      </Typography>
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
              <Typography as="option" variant="inherit" value="" disabled>
                Выберите оффер
              </Typography>
              {metadata.offers.map((option) => (
                <Typography as="option" variant="inherit" key={option.id} value={option.id}>
                  {optionLabel(option)} · #{option.id}
                </Typography>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Домен">
            <SelectInput name="domain_id" required defaultValue="">
              <Typography as="option" variant="inherit" value="" disabled>
                Выберите домен
              </Typography>
              {metadata.domains.map((option) => (
                <Typography as="option" variant="inherit" key={option.id} value={option.id}>
                  {optionLabel(option)}
                </Typography>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Группа">
            <SelectInput name="group_id" required defaultValue="">
              <Typography as="option" variant="inherit" value="" disabled>
                Выберите группу
              </Typography>
              {metadata.groups.map((option) => (
                <Typography as="option" variant="inherit" key={option.id} value={option.id}>
                  {optionLabel(option)}
                </Typography>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Источник трафика" className="sm:col-span-2">
            <SelectInput name="traffic_source_id" required defaultValue="">
              <Typography as="option" variant="inherit" value="" disabled>
                Выберите источник
              </Typography>
              {metadata.traffic_sources.map((option) => (
                <Typography as="option" variant="inherit" key={option.id} value={option.id}>
                  {optionLabel(option)}
                </Typography>
              ))}
            </SelectInput>
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
    </Dialog>
  );
}
