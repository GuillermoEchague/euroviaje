export interface User {
  id: number;
  email: string;
}

export type WalletType = 'cash' | 'card' | 'virtual_card' | 'credit';

export interface Wallet {
  id: number;
  userId: number;
  name: string;
  type: WalletType;
  balanceEur: number;
  initialExchangeRate: number;
}

export interface Expense {
  id: number;
  userId: number;
  walletId: number;
  title: string;
  description?: string;
  amountEur: number;
  amountClp: number;
  category: string;
  exchangeRate: number;
  date: string;
}

export interface ExchangeRate {
  rate: number;
  updatedAt: string;
}
