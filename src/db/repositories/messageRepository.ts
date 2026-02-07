import { getDatabase } from '../database';
import { Message } from '../../types/database';

export async function createMessage(
  conversationId: number,
  role: 'user' | 'assistant',
  content: string
): Promise<Message> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
    conversationId,
    role,
    content
  );
  const message = await db.getFirstAsync<Message>(
    'SELECT * FROM messages WHERE id = ?',
    result.lastInsertRowId
  );
  return message!;
}

export async function getMessagesForConversation(
  conversationId: number,
  limit: number = 50
): Promise<Message[]> {
  const db = await getDatabase();
  return db.getAllAsync<Message>(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC LIMIT ?',
    conversationId,
    limit
  );
}

export async function getRecentMessages(
  conversationId: number,
  limit: number = 20
): Promise<Message[]> {
  const db = await getDatabase();
  const messages = await db.getAllAsync<Message>(
    `SELECT * FROM (
      SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp DESC LIMIT ?
    ) ORDER BY timestamp ASC`,
    conversationId,
    limit
  );
  return messages;
}

export async function deleteMessagesForConversation(
  conversationId: number
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM messages WHERE conversation_id = ?',
    conversationId
  );
}
