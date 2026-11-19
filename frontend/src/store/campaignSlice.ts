import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import {
  api,
  Campaign,
  CampaignCreateRequest,
} from "@/api";
import type {
  CampaignListQuery,
  CampaignListResponse,
  Metadata,
  Stream,
} from "@/api";

type AsyncConfig = {
  rejectValue: string;
  state: { campaigns: CampaignState };
};

type CampaignState = {
  campaigns: Campaign[];
  campaignCount: number;
  filteredCampaignCount: number;
  listQuery: CampaignListQuery;
  listLoading: boolean;
  listRequestId: string | null;
  metadata: Metadata | null;
  selectedId: number | null;
  selectedCampaign: Campaign | null;
  loading: boolean;
  detailLoading: boolean;
  detailError: string;
  connected: boolean | null;
  saving: boolean;
  error: string;
  notice: string;
  overviewRequestId: string | null;
  detailRequestId: string | null;
};

const initialState: CampaignState = {
  campaigns: [],
  campaignCount: 0,
  filteredCampaignCount: 0,
  listQuery: {
    q: "",
    status: "all",
    sort: "id-asc",
    offset: 0,
    limit: 25,
  },
  listLoading: true,
  listRequestId: null,
  metadata: null,
  selectedId: null,
  selectedCampaign: null,
  loading: true,
  detailLoading: false,
  detailError: "",
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
  Metadata,
  void,
  AsyncConfig
>("campaigns/loadOverview", async (_, { rejectWithValue }) => {
  try {
    return await api.metadata();
  } catch (reason) {
    return rejectWithValue(errorMessage(reason, "Не удалось загрузить данные"));
  }
});

export const loadCampaigns = createAsyncThunk<
  CampaignListResponse,
  CampaignListQuery | undefined,
  AsyncConfig
>(
  "campaigns/loadCampaigns",
  async (query, { getState, rejectWithValue }) => {
    try {
      return await api.campaigns(query ?? getState().campaigns.listQuery);
    } catch (reason) {
      return rejectWithValue(errorMessage(reason, "Не удалось загрузить кампании"));
    }
  },
);

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
  if (index !== -1) state.campaigns[index] = campaign;
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
        state.metadata = action.payload;
      })
      .addCase(loadOverview.rejected, (state, action) => {
        if (action.meta.requestId !== state.overviewRequestId) return;
        state.overviewRequestId = null;
        state.loading = false;
        state.connected = false;
        state.error = action.payload ?? action.error.message ?? "Не удалось загрузить данные";
      })
      .addCase(loadCampaigns.pending, (state, action) => {
        state.listRequestId = action.meta.requestId;
        if (action.meta.arg) state.listQuery = action.meta.arg;
        state.listLoading = true;
        state.error = "";
      })
      .addCase(loadCampaigns.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.listRequestId) return;
        state.listRequestId = null;
        state.listLoading = false;
        state.campaigns = action.payload.items;
        state.filteredCampaignCount = action.payload.total;
        state.campaignCount = action.payload.campaign_count;
      })
      .addCase(loadCampaigns.rejected, (state, action) => {
        if (action.meta.requestId !== state.listRequestId) return;
        state.listRequestId = null;
        state.listLoading = false;
        state.error = action.payload ?? action.error.message ?? "Не удалось загрузить кампании";
      })
      .addCase(loadCampaign.pending, (state, action) => {
        state.detailRequestId = action.meta.requestId;
        state.selectedId = action.meta.arg;
        state.selectedCampaign = null;
        state.detailLoading = true;
        state.detailError = "";
      })
      .addCase(loadCampaign.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.detailRequestId) return;
        state.detailRequestId = null;
        state.detailLoading = false;
        state.detailError = "";
        state.selectedId = action.payload.id;
        state.selectedCampaign = action.payload;
        const index = state.campaigns.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.campaigns[index] = action.payload;
      })
      .addCase(loadCampaign.rejected, (state, action) => {
        if (action.meta.requestId !== state.detailRequestId) return;
        state.detailRequestId = null;
        state.detailLoading = false;
        state.detailError =
          action.payload ?? action.error.message ?? "Не удалось открыть кампанию";
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
