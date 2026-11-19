import { useCallback, useEffect } from "react";
import { CampaignCreateRequest, Stream } from "@/api";
import {
  addOffer,
  clearError,
  clearNotice,
  createCampaign,
  loadCampaign,
  loadOverview,
  removeOffer,
} from "@/store/campaignSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function useCampaignPageController() {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector((state) => state.campaigns.selectedId);
  const notice = useAppSelector((state) => state.campaigns.notice);

  useEffect(() => {
    void dispatch(loadOverview());
  }, [dispatch]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => dispatch(clearNotice()), 3000);
    return () => window.clearTimeout(timer);
  }, [dispatch, notice]);

  const refresh = useCallback(async () => {
    const result = await dispatch(loadOverview());
    if (loadOverview.fulfilled.match(result) && selectedId !== null) {
      await dispatch(loadCampaign(selectedId));
    }
  }, [dispatch, selectedId]);

  const create = useCallback(async (input: CampaignCreateRequest) => {
    const result = await dispatch(createCampaign(input));
    return createCampaign.fulfilled.match(result);
  }, [dispatch]);

  const add = useCallback(async (offerId: number) => {
    if (selectedId === null) return false;
    const result = await dispatch(addOffer({ campaignId: selectedId, offerId }));
    return addOffer.fulfilled.match(result);
  }, [dispatch, selectedId]);

  const remove = useCallback(async (stream: Stream) => {
    if (selectedId === null) return false;
    const result = await dispatch(removeOffer({ campaignId: selectedId, stream }));
    return removeOffer.fulfilled.match(result);
  }, [dispatch, selectedId]);

  const select = useCallback((campaignId: number) => {
    void dispatch(loadCampaign(campaignId));
  }, [dispatch]);

  const dismissFeedback = useCallback(() => {
    dispatch(clearError());
    dispatch(clearNotice());
  }, [dispatch]);

  return {
    addOffer: add,
    createCampaign: create,
    dismissFeedback,
    refresh,
    removeOffer: remove,
    selectCampaign: select,
  };
}
