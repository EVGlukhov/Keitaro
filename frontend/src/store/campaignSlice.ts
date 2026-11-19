import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import {
  api,
  Campaign,
  CampaignCreateRequest,
  Metadata,
  Stream,
} from "@/api";

type AsyncConfig = {
  rejectValue: string;
  state: { campaigns: CampaignState };
};

type CampaignState = {
  campaigns: Campaign[];
  metadata: Metadata | null;
  selectedId: number | null;
  selectedCampaign: Campaign | null;
  loading: boolean;
  detailLoading: boolean;
  connected: boolean | null;
  saving: boolean;
  error: string;
  notice: string;
  overviewRequestId: string | null;
  detailRequestId: string | null;
};

const initialState: CampaignState = {
  campaigns: [],
  metadata: null,
  selectedId: null,
  selectedCampaign: null,
  loading: true,
  detailLoading: false,
  connected: null,
  saving: false,
  error: "",
  notice: "",
  overviewRequestId: null,
  detailRequestId: null,
};

function errorMessage(reason: unknown, fallback: string) {
  return reason instanceof Error ? reason.message : fallback;
}

export const loadOverview = createAsyncThunk<
  { metadata: Metadata; campaigns: Campaign[] },
  void,
  AsyncConfig
>("campaigns/loadOverview", async (_, { rejectWithValue }) => {
  try {
    const [metadata, campaigns] = await Promise.all([
      api.metadata(),
      api.campaigns(),
    ]);
    return { metadata, campaigns };
  } catch (reason) {
    return rejectWithValue(errorMessage(reason, "Не удалось загрузить данные"));
  }
});

export const loadCampaign = createAsyncThunk<Campaign, number, AsyncConfig>(
  "campaigns/loadCampaign",
  async (campaignId, { rejectWithValue }) => {
    try {
      return await api.campaign(campaignId);
    } catch (reason) {
      return rejectWithValue(errorMessage(reason, "Не удалось открыть кампанию"));
    }
  },
);

export const createCampaign = createAsyncThunk<
  Campaign,
  CampaignCreateRequest,
  AsyncConfig
>(
  "campaigns/createCampaign",
  async (input, { rejectWithValue }) => {
    try {
      return await api.createCampaign(input);
    } catch (reason) {
      return rejectWithValue(errorMessage(reason, "Не удалось создать кампанию"));
    }
  },
  { condition: (_, { getState }) => !getState().campaigns.saving },
);

export const addOffer = createAsyncThunk<
  Campaign,
  { campaignId: number; offerId: number },
  AsyncConfig
>(
  "campaigns/addOffer",
  async ({ campaignId, offerId }, { rejectWithValue }) => {
    try {
      await api.addOffer(campaignId, offerId);
      return await api.campaign(campaignId);
    } catch (reason) {
      return rejectWithValue(errorMessage(reason, "Не удалось добавить оффер"));
    }
  },
  { condition: (_, { getState }) => !getState().campaigns.saving },
);

export const removeOffer = createAsyncThunk<
  Campaign,
  { campaignId: number; stream: Stream },
  AsyncConfig
>(
  "campaigns/removeOffer",
  async ({ campaignId, stream }, { rejectWithValue }) => {
    try {
      await api.deleteOffer(campaignId, stream.id);
      return await api.campaign(campaignId);
    } catch (reason) {
      return rejectWithValue(errorMessage(reason, "Не удалось удалить оффер"));
    }
  },
  { condition: (_, { getState }) => !getState().campaigns.saving },
);

function saveCampaign(
  state: CampaignState,
  campaign: Campaign,
  notice: string,
  select = true,
) {
  if (select) {
    state.selectedId = campaign.id;
    state.selectedCampaign = campaign;
  } else if (state.selectedId === campaign.id) {
    state.selectedCampaign = campaign;
  }
  const index = state.campaigns.findIndex((item) => item.id === campaign.id);
  if (index === -1) state.campaigns.unshift(campaign);
  else state.campaigns[index] = campaign;
  state.notice = notice;
  state.error = "";
}

const campaignSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {
    clearError(state) {
      state.error = "";
    },
    clearNotice(state) {
      state.notice = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOverview.pending, (state, action) => {
        state.overviewRequestId = action.meta.requestId;
        state.loading = true;
        state.error = "";
      })
      .addCase(loadOverview.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.overviewRequestId) return;
        state.overviewRequestId = null;
        state.loading = false;
        state.connected = true;
        state.metadata = action.payload.metadata;
        state.campaigns = action.payload.campaigns;
      })
      .addCase(loadOverview.rejected, (state, action) => {
        if (action.meta.requestId !== state.overviewRequestId) return;
        state.overviewRequestId = null;
        state.loading = false;
        state.connected = false;
        state.error = action.payload ?? action.error.message ?? "Не удалось загрузить данные";
      })
      .addCase(loadCampaign.pending, (state, action) => {
        state.detailRequestId = action.meta.requestId;
        state.selectedId = action.meta.arg;
        state.selectedCampaign = null;
        state.detailLoading = true;
        state.error = "";
      })
      .addCase(loadCampaign.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.detailRequestId) return;
        state.detailRequestId = null;
        state.detailLoading = false;
        state.selectedId = action.payload.id;
        state.selectedCampaign = action.payload;
        const index = state.campaigns.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.campaigns[index] = action.payload;
      })
      .addCase(loadCampaign.rejected, (state, action) => {
        if (action.meta.requestId !== state.detailRequestId) return;
        state.detailRequestId = null;
        state.detailLoading = false;
        state.error = action.payload ?? action.error.message ?? "Не удалось открыть кампанию";
      })
      .addCase(createCampaign.pending, (state) => {
        state.saving = true;
        state.error = "";
      })
      .addCase(addOffer.pending, (state) => {
        state.saving = true;
        state.error = "";
      })
      .addCase(removeOffer.pending, (state) => {
        state.saving = true;
        state.error = "";
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.saving = false;
        saveCampaign(state, action.payload, "Кампания и два потока созданы");
      })
      .addCase(addOffer.fulfilled, (state, action) => {
        state.saving = false;
        saveCampaign(state, action.payload, "Оффер добавлен", false);
      })
      .addCase(removeOffer.fulfilled, (state, action) => {
        state.saving = false;
        saveCampaign(state, action.payload, "Оффер удалён", false);
      })
      .addMatcher(
        isAnyOf(createCampaign.rejected, addOffer.rejected, removeOffer.rejected),
        (state, action) => {
          state.saving = false;
          state.error = action.payload ?? action.error.message ?? "Не удалось выполнить операцию";
        },
      );
  },
});

export const { clearError, clearNotice } = campaignSlice.actions;
export default campaignSlice.reducer;
