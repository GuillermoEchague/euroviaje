import * as SQLite from "expo-sqlite";
import { getDatabase } from "../sqlite";
import { LuggageItem, LuggageType } from "../../../domain/models";
import { sanitizeParams } from "../../../utils/sqlite-helper";

export const LuggageRepository = {
  async getAllByUserId(userId: number): Promise<LuggageItem[]> {
    try {
      const db = await getDatabase();
      const results = await db.getAllAsync<{
        id: number;
        user_id: number;
        name: string;
        type: string;
        clean_quantity: number;
        dirty_quantity: number;
        has_item: number;
      }>(
        "SELECT * FROM luggage_items WHERE user_id = ? ORDER BY type, name",
        sanitizeParams([userId])
      );

      if (results.length === 0) {
        // Seed initial items
        await this.seedInitialItems(userId);
        return this.getAllByUserId(userId);
      }

      return results.map((row) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        type: row.type as LuggageType,
        cleanQuantity: row.clean_quantity,
        dirtyQuantity: row.dirty_quantity,
        hasItem: row.has_item === 1,
      }));
    } catch (error) {
      console.error("LuggageRepository.getAllByUserId error:", error);
      throw error;
    }
  },

  async seedInitialItems(userId: number): Promise<void> {
    const clothing = [
      "Poleras",
      "Jeans",
      "Polerones",
      "Calcetines",
      "Pantalones cortos",
      "Pijamas",
      "Toallas",
      "Calzoncillos",
      "Chaquetas",
    ];
    const toiletries = [
      "Pasta de diente",
      "Cepillo de diente",
      "Shampoo",
      "Jabon",
      "Perfume",
    ];

    const db = await getDatabase();

    for (const name of clothing) {
      await db.runAsync(
        "INSERT INTO luggage_items (user_id, name, type, clean_quantity, dirty_quantity, has_item) VALUES (?, ?, ?, ?, ?, ?)",
        sanitizeParams([userId, name, "clothing", 0, 0, 1])
      );
    }

    for (const name of toiletries) {
      await db.runAsync(
        "INSERT INTO luggage_items (user_id, name, type, clean_quantity, dirty_quantity, has_item) VALUES (?, ?, ?, ?, ?, ?)",
        sanitizeParams([userId, name, "toiletry", 0, 0, 1])
      );
    }
  },

  async create(item: Omit<LuggageItem, "id">): Promise<number> {
    try {
      const db = await getDatabase();
      const result = await db.runAsync(
        "INSERT INTO luggage_items (user_id, name, type, clean_quantity, dirty_quantity, has_item) VALUES (?, ?, ?, ?, ?, ?)",
        sanitizeParams([
          item.userId,
          item.name,
          item.type,
          item.cleanQuantity,
          item.dirtyQuantity,
          item.hasItem ? 1 : 0,
        ])
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error("LuggageRepository.create error:", error);
      throw error;
    }
  },

  async update(id: number, item: Partial<LuggageItem>): Promise<void> {
    try {
      const db = await getDatabase();
      const sets: string[] = [];
      const params: any[] = [];

      if (item.name !== undefined) {
        sets.push("name = ?");
        params.push(item.name);
      }
      if (item.type !== undefined) {
        sets.push("type = ?");
        params.push(item.type);
      }
      if (item.cleanQuantity !== undefined) {
        sets.push("clean_quantity = ?");
        params.push(item.cleanQuantity);
      }
      if (item.dirtyQuantity !== undefined) {
        sets.push("dirty_quantity = ?");
        params.push(item.dirtyQuantity);
      }
      if (item.hasItem !== undefined) {
        sets.push("has_item = ?");
        params.push(item.hasItem ? 1 : 0);
      }

      if (sets.length === 0) return;

      params.push(id);
      await db.runAsync(
        `UPDATE luggage_items SET ${sets.join(", ")} WHERE id = ?`,
        sanitizeParams(params)
      );
    } catch (error) {
      console.error("LuggageRepository.update error:", error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        "DELETE FROM luggage_items WHERE id = ?",
        sanitizeParams([id])
      );
    } catch (error) {
      console.error("LuggageRepository.delete error:", error);
      throw error;
    }
  },

  async washAll(userId: number): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        "UPDATE luggage_items SET clean_quantity = clean_quantity + dirty_quantity, dirty_quantity = 0 WHERE user_id = ? AND type = 'clothing'",
        sanitizeParams([userId])
      );
    } catch (error) {
      console.error("LuggageRepository.washAll error:", error);
      throw error;
    }
  },

  async washByCategory(userId: number, id: number): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        "UPDATE luggage_items SET clean_quantity = clean_quantity + dirty_quantity, dirty_quantity = 0 WHERE user_id = ? AND id = ? AND type = 'clothing'",
        sanitizeParams([userId, id])
      );
    } catch (error) {
      console.error("LuggageRepository.washByCategory error:", error);
      throw error;
    }
  },
};
