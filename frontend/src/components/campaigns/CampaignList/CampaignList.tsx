import { useMemo, useState } from "react";
import clsx from "clsx";
import { Layers3 as Layers3Icon, LoaderCircle as LoaderCircleIcon } from "lucide-react";
import { Campaign } from "@/api";
import { SelectInput, SelectableButton, TextInput, Typography } from "@/components/ui";
import { isCampaignActive } from "@/utils/campaign";

type CampaignStatusFilter = "all" | "active" | "inactive" | "unknown";
type CampaignSort = "id-asc" | "id-desc" | "name";

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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatusFilter>("all");
  const [sort, setSort] = useState<CampaignSort>("id-asc");
  const visibleCampaigns = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return campaigns
      .filter((campaign) => {
        const matchesSearch =
          !query ||
          campaign.name.toLocaleLowerCase().includes(query) ||
          String(campaign.id).includes(query);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && isCampaignActive(campaign)) ||
          (statusFilter === "inactive" &&
            Boolean(campaign.state) &&
            !isCampaignActive(campaign)) ||
          (statusFilter === "unknown" && !campaign.state);

        return matchesSearch && matchesStatus;
      })
      .sort((left, right) => {
        if (sort === "name") {
          return left.name.localeCompare(right.name);
        }
        return sort === "id-asc"
          ? left.id - right.id
          : right.id - left.id;
      });
  }, [campaigns, search, sort, statusFilter]);

  return (
    <div className="min-h-56 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="grid gap-3 border-b border-slate-100 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
        <label className="block">
          <Typography as="span" variant="label">Поиск кампаний</Typography>
          <TextInput
            aria-label="Поиск кампаний"
            className="mt-1.5"
            placeholder="Название или ID"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className="block">
          <Typography as="span" variant="label">Статус</Typography>
          <SelectInput
            aria-label="Фильтр по статусу"
            className="mt-1.5 sm:w-36"
            value={statusFilter}
            onChange={(event) => {
              const { value } = event.target;
              if (
                value === "all" ||
                value === "active" ||
                value === "inactive" ||
                value === "unknown"
              ) {
                setStatusFilter(value);
              }
            }}
          >
            <Typography as="option" variant="inherit" value="all">Все</Typography>
            <Typography as="option" variant="inherit" value="active">Активные</Typography>
            <Typography as="option" variant="inherit" value="inactive">Выключенные</Typography>
            <Typography as="option" variant="inherit" value="unknown">Без статуса</Typography>
          </SelectInput>
        </label>
        <label className="block">
          <Typography as="span" variant="label">Сортировка</Typography>
          <SelectInput
            aria-label="Сортировка кампаний"
            className="mt-1.5 sm:w-44"
            value={sort}
            onChange={(event) => {
              const { value } = event.target;
              if (value === "id-asc" || value === "id-desc" || value === "name") {
                setSort(value);
              }
            }}
          >
            <Typography as="option" variant="inherit" value="id-asc">ID по возрастанию</Typography>
            <Typography as="option" variant="inherit" value="id-desc">ID по убыванию</Typography>
            <Typography as="option" variant="inherit" value="name">По названию</Typography>
          </SelectInput>
        </label>
      </div>
      <div className="grid h-10 grid-cols-campaign items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 sm:grid-cols-campaign-wide sm:gap-3 sm:px-4">
        <Typography variant="micro" className="font-bold tracking-wider text-slate-400">КАМПАНИЯ</Typography>
        <Typography variant="micro" className="font-bold tracking-wider text-slate-400">ID</Typography>
        <Typography variant="micro" className="font-bold tracking-wider text-slate-400">ПОТОКИ</Typography>
        <Typography variant="micro" className="hidden font-bold tracking-wider text-slate-400 sm:block">СТАТУС</Typography>
      </div>
      {loading && campaigns.length === 0 ? (
        <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-slate-400">
          <LoaderCircleIcon className="animate-spin" size={22} />
          <Typography variant="uiSmall">Загружаем кампании…</Typography>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-slate-400">
          <Layers3Icon size={22} />
          <Typography variant="uiSmall">Кампаний пока нет. Создайте первую.</Typography>
        </div>
      ) : visibleCampaigns.length === 0 ? (
        <div className="flex min-h-44 items-center justify-center text-slate-400">
          <Typography variant="uiSmall">Кампании не найдены.</Typography>
        </div>
      ) : visibleCampaigns.map((campaign) => {
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
          <SelectableButton
            selected={selectedId === campaign.id}
            key={campaign.id}
            className="grid min-h-13 w-full grid-cols-campaign items-center gap-2 border-b border-slate-100 px-3 text-left text-slate-500 last:border-0 sm:grid-cols-campaign-wide sm:gap-3 sm:px-4"
            onClick={() => onSelect(campaign.id)}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-violet-50 text-violet-600">
                <Layers3Icon size={16} />
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
          </SelectableButton>
        );
      })}
    </div>
  );
}
