import { getDatabase } from '../database';
import { Conversation } from '../../types/database';

export async function createConversation(
  title?: string
): Promise<Conversation> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO conversations (title) VALUES (?)',
    title ?? null
  );
  const conversation = await db.getFirstAsync<Conversation>(
    'SELECT * FROM conversations WHERE id = ?',
    result.lastInsertRowId
  );
  return conversation!;
}

export async function getConversation(
  id: number
): Promise<Conversation | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Conversation>(
    'SELECT * FROM conversations WHERE id = ?',
    id
  );
}

export async function getAllConversations(): Promise<Conversation[]> {
  const db = await getDatabase();
  return db.getAllAsync<Conversation>(
    'SELECT * FROM conversations ORDER BY updated_at DESC'
  );
}

export async function updateConversationTitle(
  id: number,
  title: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    title,
    id
  );
}

export async function touchConversation(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    id
  );
}

export async function deleteConversation(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM conversations WHERE id = ?', id);
}
