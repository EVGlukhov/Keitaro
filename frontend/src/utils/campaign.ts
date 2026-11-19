import { Campaign, Option, Stream } from "@/api";
import { CAMPAIGN_STATE } from "@/constants/campaign";

export function optionLabel(option: Option) {
  return option.name || String(option.id);
}

export function offerId(stream: Stream): number | undefined {
  const streamOfferId = stream.offers?.[0]?.offer_id;
  if (typeof streamOfferId === "number") return streamOfferId;

  const value = stream.action_options?.offer_id;
  return typeof value === "number" ? value : undefined;
}

export function isOfferStream(stream: Stream) {
  return stream.action_type === "offer" || Boolean(stream.offers?.length);
}

export function countOffers(streams: Stream[]) {
  return streams.reduce(
    (count, stream) =>
      count + (stream.offers?.length || (stream.action_type === "offer" ? 1 : 0)),
    0,
  );
}

export function isCampaignActive(campaign: Campaign) {
  return campaign.state?.toLowerCase() === CAMPAIGN_STATE.ACTIVE;
}
