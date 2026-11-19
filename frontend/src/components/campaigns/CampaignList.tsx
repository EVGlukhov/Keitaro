import clsx from "clsx";
import { Layers3, LoaderCircle } from "lucide-react";
import { Campaign } from "@/api";
import { Typography } from "@/components/ui";
import { isCampaignActive } from "@/utils/campaign";
import { CampaignListButton } from "./CampaignListButton";

type CampaignListProps = {
  campaigns: Campaign[];
  loading: boolean;
  selectedId: number | null;
  selectedStreamCount: number;
  onSelect: (id: number) => void;
};

export function CampaignList({
  campaigns,
  loading,
  selectedId,
  selectedStreamCount,
  onSelect,
}: CampaignListProps) {
  return (
    <div className="min-h-56 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="grid h-10 grid-cols-campaign items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 sm:grid-cols-campaign-wide sm:gap-3 sm:px-4">
        <Typography variant="micro" className="font-bold tracking-wider text-slate-400">КАМПАНИЯ</Typography>
        <Typography variant="micro" className="font-bold tracking-wider text-slate-400">ID</Typography>
        <Typography variant="micro" className="font-bold tracking-wider text-slate-400">ПОТОКИ</Typography>
        <Typography variant="micro" className="hidden font-bold tracking-wider text-slate-400 sm:block">СТАТУС</Typography>
      </div>
      {loading && campaigns.length === 0 ? (
        <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-slate-400">
          <LoaderCircle className="animate-spin" size={22} />
          <Typography variant="uiSmall">Загружаем кампании…</Typography>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-slate-400">
          <Layers3 size={22} />
          <Typography variant="uiSmall">Кампаний пока нет. Создайте первую.</Typography>
        </div>
      ) : campaigns.map((campaign) => {
        const active = isCampaignActive(campaign);
        const statusClass = clsx({
          "text-emerald-600": Boolean(campaign.state) && active,
          "text-slate-400": !campaign.state || !active,
        });
        const statusDotClass = clsx({
          "bg-emerald-500": Boolean(campaign.state) && active,
          "bg-slate-400": Boolean(campaign.state) && !active,
          "bg-transparent": !campaign.state,
        });

        return (
          <CampaignListButton
            selected={selectedId === campaign.id}
            key={campaign.id}
            onClick={() => onSelect(campaign.id)}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-violet-50 text-violet-600">
                <Layers3 size={16} />
              </span>
              <Typography as="strong" variant="ui" className="truncate font-semibold text-slate-700">
                {campaign.name}
              </Typography>
            </span>
            <Typography variant="ui" className="font-mono text-slate-400">#{campaign.id}</Typography>
            <Typography variant="ui">
              {campaign.streams?.length ?? (selectedId === campaign.id ? selectedStreamCount : "—")}
            </Typography>
            <Typography as="span" variant="caption" className={clsx("hidden items-center gap-1.5 sm:flex", statusClass)}>
              <i className={clsx("size-1.5 rounded-full", statusDotClass)} />
              {active ? "Активна" : campaign.state ? "Выключена" : "—"}
            </Typography>
          </CampaignListButton>
        );
      })}
    </div>
  );
}
