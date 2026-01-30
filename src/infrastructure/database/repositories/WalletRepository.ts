import * as SQLite from 'expo-sqlite';
import { dbName } from '../sqlite';
import { Wallet, WalletType } from '../../../domain/models';

export const WalletRepository = {
  async getAllByUserId(userId: number): Promise<Wallet[]> {
    const db = await SQLite.openDatabaseAsync(dbName);
    const results = await db.getAllAsync<{
      id: number;
      user_id: number;
      name: string;
      type: string;
      balance_eur_cents: number;
      initial_exchange_rate: number;
    }>('SELECT * FROM wallets WHERE user_id = ?', [userId]);

    return results.map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      type: row.type as WalletType,
      balanceEur: row.balance_eur_cents / 100,
      initialExchangeRate: row.initial_exchange_rate
    }));
  },

  async create(wallet: Omit<Wallet, 'id'>): Promise<number> {
    const db = await SQLite.openDatabaseAsync(dbName);
    const result = await db.runAsync(
      'INSERT INTO wallets (user_id, name, type, balance_eur_cents, initial_exchange_rate) VALUES (?, ?, ?, ?, ?)',
      [
        wallet.userId,
        wallet.name,
        wallet.type,
        Math.round(wallet.balanceEur * 100),
        wallet.initialExchangeRate
      ]
    );
    return result.lastInsertRowId;
  },

  async updateBalance(walletId: number, newBalance: number): Promise<void> {
    const db = await SQLite.openDatabaseAsync(dbName);
    await db.runAsync(
      'UPDATE wallets SET balance_eur_cents = ? WHERE id = ?',
      [Math.round(newBalance * 100), walletId]
    );
  },

  async delete(walletId: number): Promise<void> {
    const db = await SQLite.openDatabaseAsync(dbName);
    await db.runAsync('DELETE FROM wallets WHERE id = ?', [walletId]);
  }
};
