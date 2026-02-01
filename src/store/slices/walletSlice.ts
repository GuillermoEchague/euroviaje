import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Wallet } from '../../domain/models';

interface WalletState {
  wallets: Wallet[];
  isLoading: boolean;
}

const initialState: WalletState = {
  wallets: [],
  isLoading: false,
};

const walletSlice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {
    setWallets: (state, action: PayloadAction<Wallet[]>) => {
      state.wallets = action.payload;
    },
    addWallet: (state, action: PayloadAction<Wallet>) => {
      state.wallets.push(action.payload);
    },
    updateWallet: (state, action: PayloadAction<Wallet>) => {
      const index = state.wallets.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.wallets[index] = action.payload;
      }
    },
    updateWalletBalance: (state, action: PayloadAction<{ id: number; balanceEur: number }>) => {
      const wallet = state.wallets.find(w => w.id === action.payload.id);
      if (wallet) {
        wallet.balanceEur = action.payload.balanceEur;
      }
    },
    removeWallet: (state, action: PayloadAction<number>) => {
      state.wallets = state.wallets.filter(w => w.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setWallets, addWallet, updateWallet, updateWalletBalance, removeWallet, setLoading } = walletSlice.actions;
export default walletSlice.reducer;
