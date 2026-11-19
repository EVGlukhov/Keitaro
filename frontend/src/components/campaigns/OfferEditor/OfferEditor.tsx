import clsx from "clsx";
import { FormEvent, useState } from "react";
import {
  CircleHelp as CircleHelpIcon,
  LoaderCircle as LoaderCircleIcon,
  Plus as PlusIcon,
  Route as RouteIcon,
  Trash2 as Trash2Icon,
} from "lucide-react";
import { Campaign, Metadata, Stream } from "@/api";
import { offerId, optionLabel } from "@/utils/campaign";
import { Button, Dialog, FormField, IconButton, SelectInput, Typography } from "@/components/ui";

type OfferEditorProps = {
  campaign: Campaign | null;
  metadata: Metadata | null;
  saving: boolean;
  onAddOffer: (offerId: number) => Promise<boolean>;
  onRemoveOffer: (stream: Stream) => Promise<boolean>;
};

export function OfferEditor({
  campaign,
  metadata,
  saving,
  onAddOffer,
  onRemoveOffer,
}: OfferEditorProps) {
  const [newOfferId, setNewOfferId] = useState("");
  const [streamToRemove, setStreamToRemove] = useState<Stream | null>(null);
  const streams = campaign?.streams ?? [];
  const selectedOffer = metadata?.offers.find((offer) => offer.id === Number(newOfferId));

  async function handleAddOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newOfferId) return;
    if (await onAddOffer(Number(newOfferId))) setNewOfferId("");
  }

  async function confirmRemoveOffer() {
    if (streamToRemove && (await onRemoveOffer(streamToRemove))) {
      setStreamToRemove(null);
    }
  }

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <Typography as="div" variant="micro" className="font-bold tracking-wider text-slate-400">
              РЕДАКТОР
            </Typography>
            <Typography as="h2" variant="section" className="mt-1 max-w-60 truncate font-bold text-slate-800">
              {campaign?.name ?? "Офферы кампании"}
            </Typography>
          </div>
          {campaign && (
            <Typography as="span" variant="caption" className="rounded-md bg-slate-100 px-2 py-1 text-slate-500">
              ID {campaign.id}
            </Typography>
          )}
        </div>

        {!campaign ? (
          <div className="flex min-h-56 flex-col items-center justify-center text-center">
            <div className="mb-3 grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <RouteIcon size={22} />
            </div>
            <Typography as="strong" variant="uiSmall" className="font-semibold text-slate-700">
              Выберите кампанию
            </Typography>
            <Typography as="p" variant="ui" className="mt-1.5 max-w-48 leading-relaxed text-slate-400">
              Здесь появятся потоки и офферы выбранной кампании.
            </Typography>
          </div>
        ) : (
          <>
            <form className="border-b border-slate-100 py-3" onSubmit={(event) => void handleAddOffer(event)}>
              <FormField label="Добавить оффер" htmlFor="add-offer">
                <div className="mt-2 flex gap-2">
                  <SelectInput
                    className="min-w-0"
                    compact
                    id="add-offer"
                    value={newOfferId}
                    onChange={(event) => setNewOfferId(event.target.value)}
                    required
                  >
                    <Typography as="option" variant="inherit" value="">
                      Выберите оффер
                    </Typography>
                    {(metadata?.offers ?? []).map((offer) => (
                      <Typography as="option" variant="inherit" key={offer.id} value={offer.id}>
                        {optionLabel(offer)} · #{offer.id}
                      </Typography>
                    ))}
                  </SelectInput>
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

            <div>
              <div className="grid grid-cols-stream gap-1.5 pb-2 pt-3">
                <Typography variant="micro" className="font-bold tracking-wider text-slate-400">ПОТОК</Typography>
                <Typography variant="micro" className="font-bold tracking-wider text-slate-400">ОФФЕР</Typography>
                <span />
              </div>
              {streams.length === 0 ? (
                <Typography as="p" variant="ui" className="py-4 text-center text-slate-400">
                  У кампании нет потоков.
                </Typography>
              ) : streams.map((stream) => (
                <StreamRow
                  key={stream.id}
                  stream={stream}
                  metadata={metadata}
                  saving={saving}
                  onRemove={() => setStreamToRemove(stream)}
                />
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-md bg-violet-50/70 px-2 py-2.5">
              <CircleHelpIcon size={15} className="shrink-0 text-violet-500" />
              <Typography variant="caption" className="leading-relaxed text-violet-800/70">
                Удаляются только потоки типа «оффер». Гео-поток кампании защищён.
              </Typography>
            </div>
          </>
        )}
      </section>
      {streamToRemove && (
        <Dialog
          labelledBy="remove-offer-title"
          onClose={() => setStreamToRemove(null)}
        >
          <Typography
            as="h2"
            variant="title"
            id="remove-offer-title"
            className="font-bold text-slate-900"
          >
            Удалить оффер?
          </Typography>
          <Typography as="p" variant="uiSmall" className="mt-2 text-slate-500">
            Поток «{streamToRemove.name ?? "оффер"}» будет удалён из кампании.
          </Typography>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStreamToRemove(null)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              loading={saving}
              disabled={saving}
              className="bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-200"
              onClick={() => void confirmRemoveOffer()}
            >
              Удалить
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}

function StreamRow({
  stream,
  metadata,
  saving,
  onRemove,
}: {
  stream: Stream;
  metadata: Metadata | null;
  saving: boolean;
  onRemove: () => void;
}) {
  const id = offerId(stream);
  const offer = metadata?.offers.find((item) => item.id === id);
  const isOffer = stream.action_type === "offer";

  return (
    <div className="grid min-h-10 grid-cols-stream items-center gap-1.5 border-b border-slate-100 last:border-0">
      <Typography as="span" variant="caption" className="flex min-w-0 items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-slate-600">
        <i className={clsx("size-1.5 shrink-0 rounded-full", isOffer ? "bg-emerald-500" : "bg-violet-500")} />
        {stream.name ?? `Поток #${stream.id}`}
      </Typography>
      <Typography variant="caption" className="truncate text-slate-500">
        {isOffer
          ? offer ? optionLabel(offer) : `Оффер #${id ?? "—"}`
          : <Typography variant="micro" className="rounded bg-violet-50 px-1.5 py-1 text-violet-600">Гео / редирект</Typography>}
      </Typography>
      {isOffer ? (
        <IconButton
          className="border-0 bg-transparent text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          size="small"
          label="Удалить оффер"
          disabled={saving}
          onClick={onRemove}
        >
          {saving ? <LoaderCircleIcon className="animate-spin" size={15} /> : <Trash2Icon size={15} />}
        </IconButton>
      ) : <span />}
    </div>
  );
}
