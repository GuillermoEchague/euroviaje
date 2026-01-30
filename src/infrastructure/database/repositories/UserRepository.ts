import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { dbName } from '../sqlite';
import { User } from '../../../domain/models';

export const UserRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const db = await SQLite.openDatabaseAsync(dbName);
    const result = await db.getFirstAsync<{ id: number; email: string }>(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );
    return result ? { id: result.id, email: result.email } : null;
  },

  async create(email: string, password: string): Promise<number> {
    const db = await SQLite.openDatabaseAsync(dbName);
    const hashedPassword = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
    const result = await db.runAsync(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );
    return result.lastInsertRowId;
  },

  async validatePassword(email: string, password: string): Promise<User | null> {
    const db = await SQLite.openDatabaseAsync(dbName);
    const hashedPassword = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
    const result = await db.getFirstAsync<{ id: number; email: string }>(
      'SELECT id, email FROM users WHERE email = ? AND password = ?',
      [email, hashedPassword]
    );
    return result ? { id: result.id, email: result.email } : null;
  }
};
