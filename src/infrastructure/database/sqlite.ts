import * as SQLite from "expo-sqlite";

export const dbName = "euroviaje.db";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(dbName);
  }
  return dbInstance;
};

export const initDatabase = async () => {
  const db = await getDatabase();

  // Enable foreign keys
  await db.execAsync("PRAGMA foreign_keys = ON;");

  // Create tables in sequence
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'EUR',
      balance_cents INTEGER NOT NULL DEFAULT 0,
      initial_exchange_rate REAL NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // Migration for wallets if needed
  try {
    await db.execAsync(
      'ALTER TABLE wallets ADD COLUMN currency TEXT NOT NULL DEFAULT "EUR";'
    );
  } catch (e) {}
  try {
    await db.execAsync(
      "ALTER TABLE wallets RENAME COLUMN balance_eur_cents TO balance_cents;"
    );
  } catch (e) {}

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      wallet_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      amount_original_cents INTEGER NOT NULL DEFAULT 0,
      amount_eur_cents INTEGER NOT NULL,
      amount_clp_cents INTEGER NOT NULL,
      category TEXT NOT NULL,
      exchange_rate REAL NOT NULL,
      date TEXT NOT NULL,
      is_pre_trip INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE CASCADE
    );
  `);

  // Migration for expenses if needed
  try {
    await db.execAsync(
      "ALTER TABLE expenses ADD COLUMN amount_original_cents INTEGER NOT NULL DEFAULT 0;"
    );
  } catch (e) {}
  try {
    await db.execAsync(
      "ALTER TABLE expenses ADD COLUMN is_pre_trip INTEGER DEFAULT 0;"
    );
  } catch (e) {}

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exchange_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rate REAL NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return db;
};
