import * as SQLite from 'expo-sqlite';
import { getDatabase } from '../sqlite';
import { Wallet, WalletType } from '../../../domain/models';
import { sanitizeParams } from '../../../utils/sqlite-helper';

export const WalletRepository = {
  async getAllByUserId(userId: number): Promise<Wallet[]> {
    try {
      const db = await getDatabase();
      const results = await db.getAllAsync<{
        id: number;
        user_id: number;
        name: string;
        type: string;
        balance_eur_cents: number;
        initial_exchange_rate: number;
      }>('SELECT * FROM wallets WHERE user_id = ?', sanitizeParams([userId]));

      return results.map(row => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        type: row.type as WalletType,
        balanceEur: (row.balance_eur_cents || 0) / 100,
        initialExchangeRate: row.initial_exchange_rate
      }));
    } catch (error) {
      console.error('WalletRepository.getAllByUserId error:', error);
      throw error;
    }
  },

  async create(wallet: Omit<Wallet, 'id'>): Promise<number> {
    try {
      const db = await getDatabase();
      const result = await db.runAsync(
        'INSERT INTO wallets (user_id, name, type, balance_eur_cents, initial_exchange_rate) VALUES (?, ?, ?, ?, ?)',
        sanitizeParams([
          wallet.userId,
          wallet.name,
          wallet.type,
          Math.round((wallet.balanceEur || 0) * 100),
          wallet.initialExchangeRate
        ])
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('WalletRepository.create error:', error);
      throw error;
    }
  },

  async update(id: number, wallet: Omit<Wallet, 'id'>): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        'UPDATE wallets SET name = ?, type = ?, balance_eur_cents = ?, initial_exchange_rate = ? WHERE id = ?',
        sanitizeParams([
          wallet.name,
          wallet.type,
          Math.round((wallet.balanceEur || 0) * 100),
          wallet.initialExchangeRate,
          id
        ])
      );
    } catch (error) {
      console.error('WalletRepository.update error:', error);
      throw error;
    }
  },

  async updateBalance(walletId: number, newBalance: number): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        'UPDATE wallets SET balance_eur_cents = ? WHERE id = ?',
        sanitizeParams([Math.round((newBalance || 0) * 100), walletId])
      );
    } catch (error) {
      console.error('WalletRepository.updateBalance error:', error);
      throw error;
    }
  },

  async delete(walletId: number): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM wallets WHERE id = ?', sanitizeParams([walletId]));
    } catch (error) {
      console.error('WalletRepository.delete error:', error);
      throw error;
    }
  }
};
