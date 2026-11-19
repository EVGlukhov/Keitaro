import { Campaign, Option, Stream } from "@/api";
import { CAMPAIGN_STATE } from "@/constants/campaign";

export function optionLabel(option: Option) {
  return option.name || String(option.id);
}

export function offerId(stream: Stream): number | undefined {
  const value = stream.action_options?.offer_id;
  return typeof value === "number" ? value : undefined;
}

export function isCampaignActive(campaign: Campaign) {
  return campaign.state?.toLowerCase() === CAMPAIGN_STATE.ACTIVE;
}
