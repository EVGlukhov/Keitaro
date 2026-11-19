import { Layers3, LoaderCircle } from "lucide-react";
import { Campaign } from "@/api";
import { isCampaignActive } from "@/utils/campaign";

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
      <div className="grid h-10 grid-cols-campaign items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 text-micro font-bold tracking-wider text-slate-400 sm:grid-cols-campaign-wide sm:gap-3 sm:px-4">
        <span>КАМПАНИЯ</span><span>ID</span><span>ПОТОКИ</span><span className="hidden sm:block">СТАТУС</span>
      </div>
      {loading && campaigns.length === 0 ? (
        <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-ui-sm text-slate-400">
          <LoaderCircle className="animate-spin" size={22} />Загружаем кампании…
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-ui-sm text-slate-400">
          <Layers3 size={22} />Кампаний пока нет. Создайте первую.
        </div>
      ) : campaigns.map((campaign) => {
        const active = isCampaignActive(campaign);
        const statusClass = campaign.state
          ? active ? "text-emerald-600" : "text-slate-400"
          : "text-slate-400";
        const statusDotClass = campaign.state
          ? active ? "bg-emerald-500" : "bg-slate-400"
          : "bg-transparent";

        return (
          <button
            className={`grid min-h-13 w-full grid-cols-campaign items-center gap-2 border-b border-slate-100 px-3 text-left text-ui text-slate-500 transition last:border-0 hover:bg-violet-50/50 sm:grid-cols-campaign-wide sm:gap-3 sm:px-4 ${
              selectedId === campaign.id
                ? "bg-violet-50/70 shadow-selected"
                : "bg-white"
            }`}
            key={campaign.id}
            onClick={() => onSelect(campaign.id)}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-violet-50 text-violet-600">
                <Layers3 size={16} />
              </span>
              <strong className="truncate font-semibold text-slate-700">{campaign.name}</strong>
            </span>
            <span className="font-mono text-ui text-slate-400">#{campaign.id}</span>
            <span>
              {campaign.streams?.length ?? (selectedId === campaign.id ? selectedStreamCount : "—")}
            </span>
            <span className={`hidden items-center gap-1.5 text-caption sm:flex ${statusClass}`}>
              <i className={`size-1.5 rounded-full ${statusDotClass}`} />
              {active ? "Активна" : campaign.state ? "Выключена" : "—"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
