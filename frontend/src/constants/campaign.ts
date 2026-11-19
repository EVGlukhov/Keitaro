export const CAMPAIGN_STATE = {
  ACTIVE: "active",
} as const;

export const CAMPAIGN_STATUS_FILTER = {
  ALL: "all",
  ACTIVE: CAMPAIGN_STATE.ACTIVE,
  INACTIVE: "inactive",
  UNKNOWN: "unknown",
} as const;

export type CampaignStatusFilter =
  (typeof CAMPAIGN_STATUS_FILTER)[keyof typeof CAMPAIGN_STATUS_FILTER];

export const CAMPAIGN_SORT = {
  ID_ASC: "id-asc",
  ID_DESC: "id-desc",
  NAME: "name",
} as const;

export type CampaignSort =
  (typeof CAMPAIGN_SORT)[keyof typeof CAMPAIGN_SORT];
