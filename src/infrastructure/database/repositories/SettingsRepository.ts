import * as SQLite from 'expo-sqlite';
import { getDatabase } from '../sqlite';
import { sanitizeParams } from '../../../utils/sqlite-helper';

export const SettingsRepository = {
  async set(key: string, value: string): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        sanitizeParams([key, value])
      );
    } catch (error) {
      console.error('SettingsRepository.set error:', error);
      throw error;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        'DELETE FROM settings WHERE key = ?',
        sanitizeParams([key])
      );
    } catch (error) {
      console.error('SettingsRepository.remove error:', error);
      throw error;
    }
  },

  async get(key: string): Promise<string | null> {
    try {
      const db = await getDatabase();
      const result = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM settings WHERE key = ?',
        sanitizeParams([key])
      );
      return result ? result.value : null;
    } catch (error) {
      console.error('SettingsRepository.get error:', error);
      throw error;
    }
  },

  async getAll(): Promise<Record<string, string>> {
    try {
      const db = await getDatabase();
      const results = await db.getAllAsync<{ key: string; value: string }>(
        'SELECT key, value FROM settings'
      );
      const settings: Record<string, string> = {};
      results.forEach(row => {
        settings[row.key] = row.value;
      });
      return settings;
    } catch (error) {
      console.error('SettingsRepository.getAll error:', error);
      throw error;
    }
  }
};
