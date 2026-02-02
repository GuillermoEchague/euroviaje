export interface User {
  id: number;
  email: string;
}

export type WalletType = "cash" | "card" | "virtual_card" | "credit";
export type Currency = "EUR" | "USD" | "CLP";

export interface Wallet {
  id: number;
  userId: number;
  name: string;
  type: WalletType;
  currency: Currency;
  balance: number;
  initialExchangeRate: number;
}

export interface Expense {
  id: number;
  userId: number;
  walletId: number;
  title: string;
  description?: string;
  amountOriginal: number;
  amountEur: number;
  amountClp: number;
  category: string;
  exchangeRate: number;
  date: string;
  isPreTrip?: boolean;
}

export interface ExchangeRate {
  rate: number;
  updatedAt: string;
}
