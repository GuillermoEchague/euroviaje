import * as SQLite from 'expo-sqlite';
import { dbName } from '../sqlite';

export const SettingsRepository = {
  async set(key: string, value: string): Promise<void> {
    const db = await SQLite.openDatabaseAsync(dbName);
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, value]
    );
  },

  async get(key: string): Promise<string | null> {
    const db = await SQLite.openDatabaseAsync(dbName);
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      [key]
    );
    return result ? result.value : null;
  },

  async getAll(): Promise<Record<string, string>> {
    const db = await SQLite.openDatabaseAsync(dbName);
    const results = await db.getAllAsync<{ key: string; value: string }>(
      'SELECT key, value FROM settings'
    );
    const settings: Record<string, string> = {};
    results.forEach(row => {
      settings[row.key] = row.value;
    });
    return settings;
  }
};
