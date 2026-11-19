import { ChangeEvent, useMemo, useState } from "react";
import { Campaign } from "@/api";
import type { SelectInputOption } from "@/components/ui";
import {
  CAMPAIGN_SORT,
  CAMPAIGN_STATUS_FILTER,
} from "@/constants/campaign";
import type { CampaignSort, CampaignStatusFilter } from "@/constants/campaign";
import { isCampaignActive } from "@/utils/campaign";

const statusFilterOptions: readonly SelectInputOption[] = [
  { value: CAMPAIGN_STATUS_FILTER.ALL, label: "Все" },
  { value: CAMPAIGN_STATUS_FILTER.ACTIVE, label: "Активные" },
  { value: CAMPAIGN_STATUS_FILTER.INACTIVE, label: "Выключенные" },
  { value: CAMPAIGN_STATUS_FILTER.UNKNOWN, label: "Без статуса" },
];

const sortOptions: readonly SelectInputOption[] = [
  { value: CAMPAIGN_SORT.ID_ASC, label: "ID по возрастанию" },
  { value: CAMPAIGN_SORT.ID_DESC, label: "ID по убыванию" },
  { value: CAMPAIGN_SORT.NAME, label: "По названию" },
];

export function useCampaignList(campaigns: Campaign[]) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatusFilter>(
    CAMPAIGN_STATUS_FILTER.ALL,
  );
  const [sort, setSort] = useState<CampaignSort>(CAMPAIGN_SORT.ID_ASC);

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.currentTarget.value);
  }

  function handleStatusFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = Object.values(CAMPAIGN_STATUS_FILTER).find(
      (filter) => filter === event.currentTarget.value,
    );
    if (value) setStatusFilter(value);
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = Object.values(CAMPAIGN_SORT).find(
      (sortOption) => sortOption === event.currentTarget.value,
    );
    if (value) setSort(value);
  }

  const visibleCampaigns = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return campaigns
      .filter((campaign) => {
        const matchesSearch =
          !query ||
          campaign.name.toLocaleLowerCase().includes(query) ||
          String(campaign.id).includes(query);
        const matchesStatus =
          statusFilter === CAMPAIGN_STATUS_FILTER.ALL ||
          (statusFilter === CAMPAIGN_STATUS_FILTER.ACTIVE &&
            isCampaignActive(campaign)) ||
          (statusFilter === CAMPAIGN_STATUS_FILTER.INACTIVE &&
            Boolean(campaign.state) &&
            !isCampaignActive(campaign)) ||
          (statusFilter === CAMPAIGN_STATUS_FILTER.UNKNOWN && !campaign.state);

        return matchesSearch && matchesStatus;
      })
      .sort((left, right) => {
        if (sort === CAMPAIGN_SORT.NAME) {
          return left.name.localeCompare(right.name);
        }
        return sort === CAMPAIGN_SORT.ID_ASC
          ? left.id - right.id
          : right.id - left.id;
      });
  }, [campaigns, search, sort, statusFilter]);

  return {
    handleSearchChange,
    handleSortChange,
    handleStatusFilterChange,
    search,
    sort,
    sortOptions,
    statusFilter,
    statusFilterOptions,
    visibleCampaigns,
  };
}
