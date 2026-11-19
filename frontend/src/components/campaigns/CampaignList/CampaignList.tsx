import { Layers3 as Layers3Icon, LoaderCircle as LoaderCircleIcon } from "lucide-react";
import type { Campaign, CampaignListQuery } from "@/api";
import { Button, Typography } from "@/components/ui";
import { CampaignListFilters } from "@/components/campaigns/CampaignList/CampaignListFilters";
import { CampaignRow } from "@/components/campaigns/CampaignList/CampaignRow";
import { CampaignListState } from "@/components/campaigns/CampaignList/CampaignListState";
import { useCampaignList } from "@/hooks/useCampaignList";

type CampaignListProps = {
  campaigns: Campaign[];
  loading: boolean;
  campaignCount: number;
  total: number;
  onQueryChange: (query: CampaignListQuery) => void;
  selectedId: number | null;
  selectedStreamCount: number;
  onSelect: (id: number) => void;
};

export function CampaignList({
  campaigns,
  loading,
  campaignCount,
  total,
  onQueryChange,
  selectedId,
  selectedStreamCount,
  onSelect,
}: CampaignListProps) {
  const {
    handleSearchChange,
    handleSortChange,
    handleStatusFilterChange,
    handlePageChange,
    search,
    page,
    pageCount,
    pageSize,
    sort,
    sortOptions,
    statusFilter,
    statusFilterOptions,
  } = useCampaignList(onQueryChange, total);

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
      ) : campaigns.length === 0 && campaignCount === 0 && total === 0 ? (
        <CampaignListState
          icon={<Layers3Icon size={22} />}
          message="Кампаний пока нет. Создайте первую."
        />
      ) : campaigns.length === 0 ? (
        <CampaignListState message="Кампании не найдены." />
      ) : campaigns.map((campaign) => (
        <CampaignRow
          key={campaign.id}
          campaign={campaign}
          selected={selectedId === campaign.id}
          selectedStreamCount={selectedStreamCount}
          onSelect={() => onSelect(campaign.id)}
        />
      ))}
      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-3 py-2.5">
          <Typography variant="caption" className="text-slate-500">
            {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, total)} из {total}
          </Typography>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="small"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Назад
            </Button>
            <Button
              variant="secondary"
              size="small"
              disabled={page >= pageCount}
              onClick={() => handlePageChange(page + 1)}
            >
              Далее
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
