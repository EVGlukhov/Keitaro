import { describe, expect, it } from "vitest";
import { Campaign, Metadata } from "@/api";
import campaignReducer, {
  addOffer,
  loadCampaign,
  loadOverview,
} from "@/store/campaignSlice";

const metadata: Metadata = {
  domains: [],
  groups: [],
  traffic_sources: [],
  offers: [],
};

const firstCampaign: Campaign = { id: 1, name: "First campaign" };
const secondCampaign: Campaign = { id: 2, name: "Second campaign" };

describe("campaign request ordering", () => {
  it("ignores stale overview responses", () => {
    let state = campaignReducer(undefined, loadOverview.pending("first", undefined));
    state = campaignReducer(state, loadOverview.pending("second", undefined));
    state = campaignReducer(
      state,
      loadOverview.fulfilled(
        { metadata, campaigns: [secondCampaign] },
        "second",
        undefined,
      ),
    );
    state = campaignReducer(
      state,
      loadOverview.fulfilled(
        { metadata, campaigns: [firstCampaign] },
        "first",
        undefined,
      ),
    );

    expect(state.campaigns).toEqual([secondCampaign]);
    expect(state.loading).toBe(false);
  });

  it("ignores stale campaign details after a newer selection", () => {
    let state = campaignReducer(undefined, loadCampaign.pending("first", 1));
    state = campaignReducer(state, loadCampaign.pending("second", 2));
    state = campaignReducer(
      state,
      loadCampaign.fulfilled(secondCampaign, "second", 2),
    );
    state = campaignReducer(
      state,
      loadCampaign.fulfilled(firstCampaign, "first", 1),
    );

    expect(state.selectedId).toBe(2);
    expect(state.selectedCampaign).toEqual(secondCampaign);
    expect(state.detailLoading).toBe(false);
  });

  it("does not reselect a campaign when its offer mutation finishes late", () => {
    const updatedFirstCampaign = {
      ...firstCampaign,
      streams: [{ id: 8, action_type: "offer" }],
    };
    let state = campaignReducer(undefined, loadCampaign.pending("first", 1));
    state = campaignReducer(
      state,
      loadCampaign.fulfilled(firstCampaign, "first", 1),
    );
    state = campaignReducer(
      state,
      addOffer.pending("add-offer", { campaignId: 1, offerId: 8 }),
    );
    state = campaignReducer(state, loadCampaign.pending("second", 2));
    state = campaignReducer(
      state,
      addOffer.fulfilled(updatedFirstCampaign, "add-offer", {
        campaignId: 1,
        offerId: 8,
      }),
    );

    expect(state.selectedId).toBe(2);
    expect(state.selectedCampaign).toBeNull();
    expect(state.campaigns).toEqual([updatedFirstCampaign]);
  });
});
