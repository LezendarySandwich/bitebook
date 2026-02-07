import { getDatabase } from '../database';
import { Setting } from '../../types/database';

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Setting>(
    'SELECT * FROM settings WHERE key = ?',
    key
  );
  return result?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    key,
    value
  );
}

export async function getCalorieTarget(): Promise<number> {
  const value = await getSetting('calorie_target');
  return value ? parseInt(value, 10) : 2000;
}

export async function setCalorieTarget(target: number): Promise<void> {
  await setSetting('calorie_target', target.toString());
}

export async function getActiveModel(): Promise<string> {
  const value = await getSetting('active_model');
  return value ?? '';
}

export async function setActiveModel(modelId: string): Promise<void> {
  await setSetting('active_model', modelId);
}
