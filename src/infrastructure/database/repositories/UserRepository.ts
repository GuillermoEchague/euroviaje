import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { getDatabase } from '../sqlite';
import { User } from '../../../domain/models';
import { sanitizeParams } from '../../../utils/sqlite-helper';

export const UserRepository = {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const db = await getDatabase();
      const result = await db.getFirstAsync<{ id: number; email: string }>(
        'SELECT id, email FROM users WHERE email = ?',
        sanitizeParams([email])
      );
      return result ? { id: result.id, email: result.email } : null;
    } catch (error) {
      console.error('UserRepository.findByEmail error:', error);
      throw error;
    }
  },

  async findById(id: number): Promise<User | null> {
    try {
      const db = await getDatabase();
      const result = await db.getFirstAsync<{ id: number; email: string }>(
        'SELECT id, email FROM users WHERE id = ?',
        sanitizeParams([id])
      );
      return result ? { id: result.id, email: result.email } : null;
    } catch (error) {
      console.error('UserRepository.findById error:', error);
      throw error;
    }
  },

  async create(email: string, password: string): Promise<number> {
    try {
      const db = await getDatabase();
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );
      const result = await db.runAsync(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        sanitizeParams([email, hashedPassword])
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('UserRepository.create error:', error);
      throw error;
    }
  },

  async validatePassword(email: string, password: string): Promise<User | null> {
    try {
      const db = await getDatabase();
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );
      const result = await db.getFirstAsync<{ id: number; email: string }>(
        'SELECT id, email FROM users WHERE email = ? AND password = ?',
        sanitizeParams([email, hashedPassword])
      );
      return result ? { id: result.id, email: result.email } : null;
    } catch (error) {
      console.error('UserRepository.validatePassword error:', error);
      throw error;
    }
  }
};
