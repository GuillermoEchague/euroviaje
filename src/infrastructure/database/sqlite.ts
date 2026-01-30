import * as SQLite from 'expo-sqlite';

export const dbName = 'euroviaje.db';

export const initDatabase = async () => {
  const db = await SQLite.openDatabaseAsync(dbName);

  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- cash, card, virtual_card, credit
      balance_eur_cents INTEGER NOT NULL DEFAULT 0,
      initial_exchange_rate REAL NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      wallet_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      amount_eur_cents INTEGER NOT NULL,
      amount_clp_cents INTEGER NOT NULL,
      category TEXT NOT NULL,
      exchange_rate REAL NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exchange_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rate REAL NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return db;
};
