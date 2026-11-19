import clsx from "clsx";
import { Layers3 as Layers3Icon } from "lucide-react";
import { Campaign } from "@/api";
import { SelectableButton, Typography } from "@/components/ui";
import { isCampaignActive } from "@/utils/campaign";

type CampaignRowProps = {
  campaign: Campaign;
  selected: boolean;
  selectedStreamCount: number;
  onSelect: () => void;
};

export function CampaignRow({
  campaign,
  selected,
  selectedStreamCount,
  onSelect,
}: CampaignRowProps) {
  const active = isCampaignActive(campaign);
  const statusClass = clsx({
    "text-emerald-700": Boolean(campaign.state) && active,
    "text-slate-500": !campaign.state || !active,
  });
  const statusDotClass = clsx({
    "bg-emerald-500": Boolean(campaign.state) && active,
    "bg-slate-400": Boolean(campaign.state) && !active,
    "bg-transparent": !campaign.state,
  });

  return (
    <SelectableButton
      selected={selected}
      className="grid min-h-13 w-full grid-cols-campaign items-center gap-2 border-b border-slate-100 px-3 text-left text-slate-600 last:border-0 sm:grid-cols-campaign-wide sm:gap-3 sm:px-4"
      onClick={onSelect}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-violet-50 text-violet-600">
          <Layers3Icon size={16} />
        </span>
        <Typography as="strong" variant="ui" className="truncate font-semibold text-slate-700">
          {campaign.name}
        </Typography>
      </span>
      <Typography variant="ui" className="font-mono text-slate-600">#{campaign.id}</Typography>
      <Typography variant="ui">
        {campaign.streams?.length ?? (selected ? selectedStreamCount : "—")}
      </Typography>
      <Typography as="span" variant="caption" className={clsx("hidden items-center gap-1.5 sm:flex", statusClass)}>
        <i className={clsx("size-1.5 rounded-full", statusDotClass)} />
        {active ? "Активна" : campaign.state ? "Выключена" : "—"}
      </Typography>
    </SelectableButton>
  );
}
