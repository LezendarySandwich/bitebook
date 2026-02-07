import { getDatabase } from '../database';
import { Note } from '../../types/database';

export async function createNote(
  content: string,
  type: string = 'insight'
): Promise<Note> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO notes (content, type) VALUES (?, ?)',
    content,
    type
  );
  const note = await db.getFirstAsync<Note>(
    'SELECT * FROM notes WHERE id = ?',
    result.lastInsertRowId
  );
  return note!;
}

export async function getNotes(type?: string): Promise<Note[]> {
  const db = await getDatabase();
  if (type) {
    return db.getAllAsync<Note>(
      'SELECT * FROM notes WHERE type = ? ORDER BY created_at DESC',
      type
    );
  }
  return db.getAllAsync<Note>(
    'SELECT * FROM notes ORDER BY created_at DESC'
  );
}

export async function deleteNote(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM notes WHERE id = ?', id);
}
