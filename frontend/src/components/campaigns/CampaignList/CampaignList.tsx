import { Campaign } from "@/api";
import { Layers3 as Layers3Icon, LoaderCircle as LoaderCircleIcon } from "lucide-react";
import { Typography } from "@/components/ui";
import { CampaignListFilters } from "@/components/campaigns/CampaignList/CampaignListFilters";
import { CampaignRow } from "@/components/campaigns/CampaignList/CampaignRow";
import { CampaignListState } from "@/components/campaigns/CampaignList/CampaignListState";
import { useCampaignList } from "@/hooks/useCampaignList";

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
  const {
    handleSearchChange,
    handleSortChange,
    handleStatusFilterChange,
    search,
    sort,
    sortOptions,
    statusFilter,
    statusFilterOptions,
    visibleCampaigns,
  } = useCampaignList(campaigns);

  return (
    <div className="min-h-56 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <CampaignListFilters
        search={search}
        statusFilter={statusFilter}
        sort={sort}
        statusFilterOptions={statusFilterOptions}
        sortOptions={sortOptions}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onSortChange={handleSortChange}
      />
      <div className="grid h-10 grid-cols-campaign items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 sm:grid-cols-campaign-wide sm:gap-3 sm:px-4">
        <Typography variant="micro" className="font-bold tracking-wider text-slate-400">КАМПАНИЯ</Typography>
        <Typography variant="micro" className="font-bold tracking-wider text-slate-400">ID</Typography>
        <Typography variant="micro" className="font-bold tracking-wider text-slate-400">ПОТОКИ</Typography>
        <Typography variant="micro" className="hidden font-bold tracking-wider text-slate-400 sm:block">СТАТУС</Typography>
      </div>
      {loading && campaigns.length === 0 ? (
        <CampaignListState
          icon={<LoaderCircleIcon className="animate-spin" size={22} />}
          message="Загружаем кампании…"
        />
      ) : campaigns.length === 0 ? (
        <CampaignListState
          icon={<Layers3Icon size={22} />}
          message="Кампаний пока нет. Создайте первую."
        />
      ) : visibleCampaigns.length === 0 ? (
        <CampaignListState message="Кампании не найдены." />
      ) : visibleCampaigns.map((campaign) => (
        <CampaignRow
          key={campaign.id}
          campaign={campaign}
          selected={selectedId === campaign.id}
          selectedStreamCount={selectedStreamCount}
          onSelect={() => onSelect(campaign.id)}
        />
      ))}
    </div>
  );
}
