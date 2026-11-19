import clsx from "clsx";
import { LoaderCircle as LoaderCircleIcon, Trash2 as Trash2Icon } from "lucide-react";
import { Metadata, Stream } from "@/api";
import { offerId, optionLabel } from "@/utils/campaign";
import { IconButton, Typography } from "@/components/ui";

type OfferStreamRowProps = {
  stream: Stream;
  metadata: Metadata | null;
  saving: boolean;
  onRemove: () => void;
};

export function OfferStreamRow({
  stream,
  metadata,
  saving,
  onRemove,
}: OfferStreamRowProps) {
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
          className="border-0 bg-transparent text-slate-500 hover:bg-rose-50 hover:text-rose-600"
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
