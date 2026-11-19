import { FormEvent, useState } from "react";
import { CircleHelp, LoaderCircle, Plus, Route, Trash2 } from "lucide-react";
import { Campaign, Metadata, Stream } from "@/api";
import { offerId, optionLabel } from "@/utils/campaign";
import { Button, FormField, IconButton, SelectInput } from "@/components/ui";

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
  const streams = campaign?.streams ?? [];
  const selectedOffer = metadata?.offers.find((offer) => offer.id === Number(newOfferId));

  async function handleAddOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newOfferId) return;
    if (await onAddOffer(Number(newOfferId))) setNewOfferId("");
  }

  async function handleRemoveOffer(stream: Stream) {
    if (!window.confirm(`Удалить поток «${stream.name ?? "оффер"}»?`)) return;
    await onRemoveOffer(stream);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="text-micro font-bold tracking-wider text-slate-400">РЕДАКТОР</div>
          <h2 className="mt-1 max-w-60 truncate text-section font-bold text-slate-800">
            {campaign?.name ?? "Офферы кампании"}
          </h2>
        </div>
        {campaign && (
          <span className="rounded-md bg-slate-100 px-2 py-1 text-caption text-slate-500">
            ID {campaign.id}
          </span>
        )}
      </div>

      {!campaign ? (
        <div className="flex min-h-56 flex-col items-center justify-center text-center">
          <div className="mb-3 grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-600">
            <Route size={22} />
          </div>
          <strong className="text-ui-sm font-semibold text-slate-700">Выберите кампанию</strong>
          <p className="mt-1.5 max-w-48 text-ui leading-relaxed text-slate-400">
            Здесь появятся потоки и офферы выбранной кампании.
          </p>
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
                  <option value="">Выберите оффер</option>
                  {(metadata?.offers ?? []).map((offer) => (
                    <option key={offer.id} value={offer.id}>
                      {optionLabel(offer)} · #{offer.id}
                    </option>
                  ))}
                </SelectInput>
                <Button
                  size="small"
                  type="submit"
                  disabled={!selectedOffer}
                  loading={saving}
                  className="shrink-0"
                >
                  {!saving && <Plus size={15} />}
                  Добавить
                </Button>
              </div>
            </FormField>
          </form>

          <div>
            <div className="grid grid-cols-stream gap-1.5 pb-2 pt-3 text-micro font-bold tracking-wider text-slate-400">
              <span>ПОТОК</span><span>ОФФЕР</span><span />
            </div>
            {streams.length === 0 ? (
              <p className="py-4 text-center text-ui text-slate-400">У кампании нет потоков.</p>
            ) : streams.map((stream) => (
              <StreamRow
                key={stream.id}
                stream={stream}
                metadata={metadata}
                saving={saving}
                onRemove={() => void handleRemoveOffer(stream)}
              />
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-md bg-violet-50/70 px-2 py-2.5 text-caption leading-relaxed text-violet-800/70">
            <CircleHelp size={15} className="shrink-0 text-violet-500" />
            <span>Удаляются только потоки типа «оффер». Гео-поток кампании защищён.</span>
          </div>
        </>
      )}
    </section>
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
    <div className="grid min-h-10 grid-cols-stream items-center gap-1.5 border-b border-slate-100 text-caption last:border-0">
      <span className="flex min-w-0 items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-slate-600">
        <i className={`size-1.5 shrink-0 rounded-full ${isOffer ? "bg-emerald-500" : "bg-violet-500"}`} />
        {stream.name ?? `Поток #${stream.id}`}
      </span>
      <span className="truncate text-slate-500">
        {isOffer
          ? offer ? optionLabel(offer) : `Оффер #${id ?? "—"}`
          : <span className="rounded bg-violet-50 px-1.5 py-1 text-micro text-violet-600">Гео / редирект</span>}
      </span>
      {isOffer ? (
        <IconButton
          className="border-0 bg-transparent text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          size="small"
          label="Удалить оффер"
          disabled={saving}
          onClick={onRemove}
        >
          {saving ? <LoaderCircle className="animate-spin" size={15} /> : <Trash2 size={15} />}
        </IconButton>
      ) : <span />}
    </div>
  );
}
