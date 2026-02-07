import * as SQLite from 'expo-sqlite';

interface Migration {
  version: number;
  up: string[];
}

const migrations: Migration[] = [
  {
    version: 1,
    up: [
      `CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS food_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        calories INTEGER NOT NULL,
        quantity REAL DEFAULT 1.0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        conversation_id INTEGER,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
      );`,
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'insight',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS search_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL UNIQUE,
        results TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL
      );`,
      `INSERT OR IGNORE INTO settings (key, value) VALUES ('calorie_target', '2000');`,
      `INSERT OR IGNORE INTO settings (key, value) VALUES ('active_model', '');`,
    ],
  },
  {
    version: 2,
    up: [
      `CREATE TABLE IF NOT EXISTS messages_v2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'tool_call')),
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      );`,
      `INSERT INTO messages_v2 (id, conversation_id, role, content, timestamp)
        SELECT id, conversation_id, role, content, timestamp FROM messages;`,
      `DROP TABLE messages;`,
      `ALTER TABLE messages_v2 RENAME TO messages;`,
    ],
  },
];

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY
    );`
  );

  const result = await db.getFirstAsync<{ version: number }>(
    'SELECT MAX(version) as version FROM schema_version'
  );
  const currentVersion = result?.version ?? 0;

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      for (const sql of migration.up) {
        await db.execAsync(sql);
      }
      await db.runAsync(
        'INSERT INTO schema_version (version) VALUES (?)',
        migration.version
      );
    }
  }
}
