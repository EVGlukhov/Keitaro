import { SelectInput, TextInput, Typography } from "@/components/ui";
import type { SelectInputOption } from "@/components/ui";
import type { CampaignSort, CampaignStatusFilter } from "@/constants/campaign";
import type { ChangeEventHandler } from "react";

type CampaignListFiltersProps = {
  search: string;
  statusFilter: CampaignStatusFilter;
  sort: CampaignSort;
  statusFilterOptions: readonly SelectInputOption[];
  sortOptions: readonly SelectInputOption[];
  onSearchChange: ChangeEventHandler<HTMLInputElement>;
  onStatusFilterChange: ChangeEventHandler<HTMLSelectElement>;
  onSortChange: ChangeEventHandler<HTMLSelectElement>;
};

export function CampaignListFilters({
  search,
  statusFilter,
  sort,
  statusFilterOptions,
  sortOptions,
  onSearchChange,
  onStatusFilterChange,
  onSortChange,
}: CampaignListFiltersProps) {
  return (
    <div className="grid gap-3 border-b border-slate-100 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
      <label className="block">
        <Typography as="span" variant="label">Поиск кампаний</Typography>
        <TextInput
          aria-label="Поиск кампаний"
          className="mt-1.5"
          placeholder="Название или ID"
          type="search"
          value={search}
          onChange={onSearchChange}
        />
      </label>
      <label className="block">
        <Typography as="span" variant="label">Статус</Typography>
        <SelectInput
          aria-label="Фильтр по статусу"
          className="sm:w-36"
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={statusFilterOptions}
        />
      </label>
      <label className="block">
        <Typography as="span" variant="label">Сортировка</Typography>
        <SelectInput
          aria-label="Сортировка кампаний"
          className="sm:w-44"
          value={sort}
          onChange={onSortChange}
          options={sortOptions}
        />
      </label>
    </div>
  );
}
