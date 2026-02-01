import * as SQLite from 'expo-sqlite';
import { getDatabase } from '../sqlite';
import { Expense } from '../../../domain/models';
import { sanitizeParams } from '../../../utils/sqlite-helper';

export const ExpenseRepository = {
  async getAllByUserId(userId: number): Promise<Expense[]> {
    try {
      const db = await getDatabase();
      const results = await db.getAllAsync<{
        id: number;
        user_id: number;
        wallet_id: number;
        title: string;
        description: string | null;
        amount_eur_cents: number;
        amount_clp_cents: number;
        category: string;
        exchange_rate: number;
        date: string;
      }>('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC', sanitizeParams([userId]));

      return results.map(row => ({
        id: row.id,
        userId: row.user_id,
        walletId: row.wallet_id,
        title: row.title,
        description: row.description || undefined,
        amountEur: (row.amount_eur_cents || 0) / 100,
        amountClp: (row.amount_clp_cents || 0) / 100,
        category: row.category,
        exchangeRate: row.exchange_rate,
        date: row.date
      }));
    } catch (error) {
      console.error('ExpenseRepository.getAllByUserId error:', error);
      throw error;
    }
  },

  async create(expense: Omit<Expense, 'id'>): Promise<number> {
    try {
      const db = await getDatabase();
      const result = await db.runAsync(
        'INSERT INTO expenses (user_id, wallet_id, title, description, amount_eur_cents, amount_clp_cents, category, exchange_rate, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        sanitizeParams([
          expense.userId,
          expense.walletId,
          expense.title,
          expense.description || null,
          Math.round((expense.amountEur || 0) * 100),
          Math.round((expense.amountClp || 0) * 100),
          expense.category,
          expense.exchangeRate,
          expense.date
        ])
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('ExpenseRepository.create error:', error);
      throw error;
    }
  },

  async delete(expenseId: number): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM expenses WHERE id = ?', sanitizeParams([expenseId]));
    } catch (error) {
      console.error('ExpenseRepository.delete error:', error);
      throw error;
    }
  },

  async getByCategory(userId: number): Promise<{ category: string; total_eur: number }[]> {
    try {
      const db = await getDatabase();
      const results = await db.getAllAsync<{ category: string; total_eur_cents: number }>(
        'SELECT category, SUM(amount_eur_cents) as total_eur_cents FROM expenses WHERE user_id = ? GROUP BY category',
        sanitizeParams([userId])
      );
      return results.map(row => ({
        category: row.category,
        total_eur: (row.total_eur_cents || 0) / 100
      }));
    } catch (error) {
      console.error('ExpenseRepository.getByCategory error:', error);
      throw error;
    }
  }
};
