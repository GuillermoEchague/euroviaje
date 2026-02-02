import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import walletReducer from './slices/walletSlice';
import expenseReducer from './slices/expenseSlice';
import settingsReducer from './slices/settingsSlice';
import luggageReducer from './slices/luggageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wallets: walletReducer,
    expenses: expenseReducer,
    settings: settingsReducer,
    luggage: luggageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
