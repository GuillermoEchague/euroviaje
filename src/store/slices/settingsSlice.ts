import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  exchangeRate: number;
  tripStartDate: string | null;
  initialBudgetEur: number;
}

const initialState: SettingsState = {
  exchangeRate: 1000, // Default value, will be updated by user
  tripStartDate: null,
  initialBudgetEur: 0,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setExchangeRate: (state, action: PayloadAction<number>) => {
      state.exchangeRate = action.payload;
    },
    setTripStartDate: (state, action: PayloadAction<string | null>) => {
      state.tripStartDate = action.payload;
    },
    setInitialBudgetEur: (state, action: PayloadAction<number>) => {
      state.initialBudgetEur = action.payload;
    },
    setSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setExchangeRate, setTripStartDate, setInitialBudgetEur, setSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
