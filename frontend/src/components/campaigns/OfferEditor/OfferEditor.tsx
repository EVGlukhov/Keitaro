import { CircleHelp as CircleHelpIcon, Route as RouteIcon } from "lucide-react";
import { Campaign, Metadata, Stream } from "@/api";
import { Button, Dialog, Typography } from "@/components/ui";
import { OfferAddForm } from "@/components/campaigns/OfferEditor/OfferAddForm";
import { OfferStreamRow } from "@/components/campaigns/OfferEditor/OfferStreamRow";
import { useOfferRemoval } from "@/hooks/useOfferRemoval";

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
  const streams = campaign?.streams ?? [];
  const {
    cancelRemoval,
    confirmRemoval,
    requestRemoval,
    streamToRemove,
  } = useOfferRemoval(onRemoveOffer);

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
            <OfferAddForm
              metadata={metadata}
              saving={saving}
              onAddOffer={onAddOffer}
            />

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
                <OfferStreamRow
                  key={stream.id}
                  stream={stream}
                  metadata={metadata}
                  saving={saving}
                  onRemove={() => requestRemoval(stream)}
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
          describedBy="remove-offer-description"
          onClose={cancelRemoval}
        >
          <Typography
            as="h2"
            variant="title"
            id="remove-offer-title"
            className="font-bold text-slate-900"
          >
            Удалить оффер?
          </Typography>
          <Typography
            as="p"
            variant="uiSmall"
            id="remove-offer-description"
            className="mt-2 text-slate-500"
          >
            Поток «{streamToRemove.name ?? "оффер"}» будет удалён из кампании.
          </Typography>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={cancelRemoval}
            >
              Отмена
            </Button>
            <Button
              type="button"
              loading={saving}
              disabled={saving}
              className="bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-200"
              onClick={() => void confirmRemoval()}
            >
              Удалить
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
