import { useCallback, useEffect, useRef } from "react";
import { CampaignCreateRequest, Stream } from "@/api";
import type { CampaignListQuery } from "@/api";
import {
  addOffer,
  clearError,
  clearNotice,
  createCampaign,
  loadCampaign,
  loadCampaigns,
  loadOverview,
  removeOffer,
} from "@/store/campaignSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function useCampaignPageController() {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector((state) => state.campaigns.selectedId);
  const notice = useAppSelector((state) => state.campaigns.notice);
  const selectedIdRef = useRef(selectedId);

  useEffect(() => {
    void dispatch(loadOverview());
  }, [dispatch]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => dispatch(clearNotice()), 3000);
    return () => window.clearTimeout(timer);
  }, [dispatch, notice]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const refresh = useCallback(async () => {
    const [result] = await Promise.all([
      dispatch(loadOverview()),
      dispatch(loadCampaigns()),
    ]);
    const currentSelectedId = selectedIdRef.current;
    if (loadOverview.fulfilled.match(result) && currentSelectedId !== null) {
      await dispatch(loadCampaign(currentSelectedId));
    }
  }, [dispatch]);

  const queryCampaigns = useCallback(
    (query: CampaignListQuery) => {
      void dispatch(loadCampaigns(query));
    },
    [dispatch],
  );

  const retryCampaign = useCallback(() => {
    const currentSelectedId = selectedIdRef.current;
    if (currentSelectedId !== null) {
      void dispatch(loadCampaign(currentSelectedId));
    }
  }, [dispatch]);

  const create = useCallback(async (input: CampaignCreateRequest) => {
    const result = await dispatch(createCampaign(input));
    if (!createCampaign.fulfilled.match(result)) return false;
    selectedIdRef.current = result.payload.id;
    void dispatch(loadCampaigns());
    return true;
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
    selectedIdRef.current = campaignId;
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
    queryCampaigns,
    retryCampaign,
    refresh,
    removeOffer: remove,
    selectCampaign: select,
  };
}
