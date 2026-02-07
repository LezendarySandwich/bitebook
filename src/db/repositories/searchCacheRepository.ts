import { getDatabase } from '../database';
import { SearchCacheEntry } from '../../types/database';

const CACHE_EXPIRY_DAYS = 7;

export async function getCachedSearch(
  query: string
): Promise<string | null> {
  const db = await getDatabase();
  const normalizedQuery = query.toLowerCase().trim();
  const result = await db.getFirstAsync<SearchCacheEntry>(
    'SELECT * FROM search_cache WHERE query = ? AND expires_at > datetime("now")',
    normalizedQuery
  );
  return result?.results ?? null;
}

export async function setCachedSearch(
  query: string,
  results: string
): Promise<void> {
  const db = await getDatabase();
  const normalizedQuery = query.toLowerCase().trim();
  await db.runAsync(
    `INSERT OR REPLACE INTO search_cache (query, results, created_at, expires_at)
     VALUES (?, ?, datetime('now'), datetime('now', '+${CACHE_EXPIRY_DAYS} days'))`,
    normalizedQuery,
    results
  );
}

export async function clearExpiredCache(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM search_cache WHERE expires_at <= datetime("now")'
  );
}

export async function clearAllCache(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM search_cache');
}
