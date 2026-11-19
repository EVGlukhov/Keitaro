import { ChangeEvent, useEffect, useMemo, useState } from "react";
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

type CampaignListFilters = {
  search: string;
  statusFilter: CampaignStatusFilter;
  sort: CampaignSort;
};

function readFiltersFromUrl(): CampaignListFilters {
  const params = new URLSearchParams(window.location.search);
  const statusFilter = Object.values(CAMPAIGN_STATUS_FILTER).find(
    (value) => value === params.get("status"),
  );
  const sort = Object.values(CAMPAIGN_SORT).find(
    (value) => value === params.get("sort"),
  );

  return {
    search: params.get("q") ?? "",
    statusFilter: statusFilter ?? CAMPAIGN_STATUS_FILTER.ALL,
    sort: sort ?? CAMPAIGN_SORT.ID_ASC,
  };
}

function writeFiltersToUrl(
  filters: CampaignListFilters,
  mode: "push" | "replace",
) {
  const params = new URLSearchParams(window.location.search);
  if (filters.search) params.set("q", filters.search);
  else params.delete("q");
  if (filters.statusFilter === CAMPAIGN_STATUS_FILTER.ALL) {
    params.delete("status");
  } else {
    params.set("status", filters.statusFilter);
  }
  if (filters.sort === CAMPAIGN_SORT.ID_ASC) params.delete("sort");
  else params.set("sort", filters.sort);

  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  if (mode === "push") window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
}

export function useCampaignList(campaigns: Campaign[]) {
  const [filters, setFilters] = useState(readFiltersFromUrl);
  const { search, statusFilter, sort } = filters;

  useEffect(() => {
    function handlePopState() {
      setFilters(readFiltersFromUrl());
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFilters = { ...filters, search: event.currentTarget.value };
    setFilters(nextFilters);
    writeFiltersToUrl(nextFilters, "replace");
  }

  function handleStatusFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = Object.values(CAMPAIGN_STATUS_FILTER).find(
      (filter) => filter === event.currentTarget.value,
    );
    if (value && value !== statusFilter) {
      const nextFilters = { ...filters, statusFilter: value };
      setFilters(nextFilters);
      writeFiltersToUrl(nextFilters, "push");
    }
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = Object.values(CAMPAIGN_SORT).find(
      (sortOption) => sortOption === event.currentTarget.value,
    );
    if (value && value !== sort) {
      const nextFilters = { ...filters, sort: value };
      setFilters(nextFilters);
      writeFiltersToUrl(nextFilters, "push");
    }
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
