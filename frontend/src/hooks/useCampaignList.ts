import { ChangeEvent, useEffect, useState } from "react";
import type { CampaignListQuery } from "@/api";
import type { SelectInputOption } from "@/components/ui";
import {
  CAMPAIGN_SORT,
  CAMPAIGN_STATUS_FILTER,
} from "@/constants/campaign";
import type { CampaignSort, CampaignStatusFilter } from "@/constants/campaign";

const PAGE_SIZE = 25;

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
  page: number;
};

function readFiltersFromUrl(): CampaignListFilters {
  const params = new URLSearchParams(window.location.search);
  const statusFilter = Object.values(CAMPAIGN_STATUS_FILTER).find(
    (value) => value === params.get("status"),
  );
  const sort = Object.values(CAMPAIGN_SORT).find(
    (value) => value === params.get("sort"),
  );
  const parsedPage = Number(params.get("page"));

  return {
    search: params.get("q") ?? "",
    statusFilter: statusFilter ?? CAMPAIGN_STATUS_FILTER.ALL,
    sort: sort ?? CAMPAIGN_SORT.ID_ASC,
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
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
  if (filters.page === 1) params.delete("page");
  else params.set("page", String(filters.page));

  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  if (mode === "push") window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
}

export function useCampaignList(
  onQueryChange: (query: CampaignListQuery) => void,
  total: number,
) {
  const [filters, setFilters] = useState(readFiltersFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const { search, statusFilter, sort, page } = filters;

  useEffect(() => {
    function handlePopState() {
      setFilters(readFiltersFromUrl());
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    onQueryChange({
      q: debouncedSearch.trim() || undefined,
      status: statusFilter,
      sort,
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    });
  }, [debouncedSearch, onQueryChange, page, sort, statusFilter]);

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFilters = {
      ...filters,
      search: event.currentTarget.value,
      page: 1,
    };
    setFilters(nextFilters);
    writeFiltersToUrl(nextFilters, "replace");
  }

  function handleStatusFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = Object.values(CAMPAIGN_STATUS_FILTER).find(
      (filter) => filter === event.currentTarget.value,
    );
    if (value && value !== statusFilter) {
      const nextFilters = { ...filters, statusFilter: value, page: 1 };
      setFilters(nextFilters);
      writeFiltersToUrl(nextFilters, "push");
    }
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = Object.values(CAMPAIGN_SORT).find(
      (sortOption) => sortOption === event.currentTarget.value,
    );
    if (value && value !== sort) {
      const nextFilters = { ...filters, sort: value, page: 1 };
      setFilters(nextFilters);
      writeFiltersToUrl(nextFilters, "push");
    }
  }

  function handlePageChange(nextPage: number) {
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (!Number.isInteger(nextPage) || nextPage < 1 || nextPage > pageCount) return;
    const nextFilters = { ...filters, page: nextPage };
    setFilters(nextFilters);
    writeFiltersToUrl(nextFilters, "push");
  }

  return {
    handleSearchChange,
    handleSortChange,
    handleStatusFilterChange,
    handlePageChange,
    search,
    sort,
    sortOptions,
    statusFilter,
    statusFilterOptions,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    pageSize: PAGE_SIZE,
  };
}
