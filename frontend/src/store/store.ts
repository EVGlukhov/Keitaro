import { configureStore } from "@reduxjs/toolkit";
import campaignReducer from "@/store/campaignSlice";

export const store = configureStore({
  reducer: {
    campaigns: campaignReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
