import { getDatabase } from '../database';
import { FoodEntry } from '../../types/database';
import { getStartOfDay, getEndOfDay, getStartOfWeek, getLastWeekRange } from '../../utils/dates';

export async function logFoodEntry(
  name: string,
  calories: number,
  quantity: number = 1.0,
  conversationId?: number
): Promise<FoodEntry> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO food_entries (name, calories, quantity, conversation_id) VALUES (?, ?, ?, ?)',
    name,
    calories,
    quantity,
    conversationId ?? null
  );
  const entry = await db.getFirstAsync<FoodEntry>(
    'SELECT * FROM food_entries WHERE id = ?',
    result.lastInsertRowId
  );
  return entry!;
}

export async function getTodayEntries(): Promise<FoodEntry[]> {
  const db = await getDatabase();
  const start = getStartOfDay();
  const end = getEndOfDay();
  return db.getAllAsync<FoodEntry>(
    'SELECT * FROM food_entries WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp DESC',
    start,
    end
  );
}

export async function getTodayCalories(): Promise<number> {
  const db = await getDatabase();
  const start = getStartOfDay();
  const end = getEndOfDay();
  const result = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(calories * quantity) as total FROM food_entries WHERE timestamp >= ? AND timestamp <= ?',
    start,
    end
  );
  return result?.total ?? 0;
}

export async function getWeekCalories(): Promise<number> {
  const db = await getDatabase();
  const start = getStartOfWeek();
  const end = getEndOfDay();
  const result = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(calories * quantity) as total FROM food_entries WHERE timestamp >= ? AND timestamp <= ?',
    start,
    end
  );
  return result?.total ?? 0;
}

export async function getLastWeekCalories(): Promise<number> {
  const db = await getDatabase();
  const { start, end } = getLastWeekRange();
  const result = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(calories * quantity) as total FROM food_entries WHERE timestamp >= ? AND timestamp <= ?',
    start,
    end
  );
  return result?.total ?? 0;
}

export async function getCaloriesForPeriod(
  startDate: string,
  endDate: string
): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(calories * quantity) as total FROM food_entries WHERE timestamp >= ? AND timestamp <= ?',
    startDate,
    endDate
  );
  return result?.total ?? 0;
}

export async function getWeekDayCount(): Promise<number> {
  const db = await getDatabase();
  const start = getStartOfWeek();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(DISTINCT date(timestamp)) as count FROM food_entries WHERE timestamp >= ?',
    start
  );
  return result?.count ?? 0;
}

export async function deleteFoodEntry(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM food_entries WHERE id = ?', id);
}
