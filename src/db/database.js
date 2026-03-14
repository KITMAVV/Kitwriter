// database.js
import * as SQLite from "expo-sqlite";

// Singleton, теперь это Promise<SQLiteDatabase>
let dbPromise = null;

export function getDb() {
    if (!dbPromise) {
        dbPromise = (async () => {
            const db = await SQLite.openDatabaseAsync("writer_app.db");

            // Не обязательно, но полезно для производительности
            await db.execAsync(`PRAGMA journal_mode = WAL;`);

            return db;
        })();
    }
    return dbPromise;
}

/**
 * Выполняет SELECT-запрос.
 * Возвращает объект, совместимый со старым expo-sqlite:
 * { rows: { length, item(i), _array } }
 */
export async function query(sql, params = []) {
    const db = await getDb();

    // getAllAsync возвращает обычный массив объектов-строк :contentReference[oaicite:1]{index=1}
    const rowsArray = await db.getAllAsync(sql, params);

    // Эмулируем старый интерфейс rows
    const rows = {
        length: rowsArray.length,
        item: (index) => rowsArray[index],
        _array: rowsArray,
    };

    return { rows };
}

/**
 * Удобная функция — получить только первую строку или null
 */
export async function get(sql, params = []) {
    const db = await getDb();

    // getFirstAsync возвращает объект строки или undefined :contentReference[oaicite:2]{index=2}
    const row = await db.getFirstAsync(sql, params);
    return row ?? null;
}

/**
 * Выполнить команду (INSERT/UPDATE/DELETE)
 * Возвращает { insertId, rowsAffected }
 */
export async function run(sql, params = []) {
    const db = await getDb();

    // runAsync отдаёт { lastInsertRowId, changes } :contentReference[oaicite:3]{index=3}
    const res = await db.runAsync(sql, params);

    return {
        insertId: res.lastInsertRowId ?? null,
        rowsAffected: res.changes ?? 0,
    };
}

/**
 * Выполнить несколько операций в одной транзакции.
 *
 * Новый API expo-sqlite даёт withExclusiveTransactionAsync().
 * Здесь мы передаём в callback "tx", который по сути является обёрткой над db
 * и даёт методы runAsync/getAllAsync/getFirstAsync.
 *
 * Пример использования:
 *   await transaction(async (tx) => {
 *     await tx.runAsync("INSERT INTO ...", [1, 2, 3]);
 *     const rows = await tx.getAllAsync("SELECT * FROM ...");
 *   });
 */
export async function transaction(callback) {
    const db = await getDb();

    await db.withExclusiveTransactionAsync(async () => {
        // Обёртка, чтобы было удобно использовать внутри транзакции
        const tx = {
            runAsync: (sql, params = []) => db.runAsync(sql, params),
            getAllAsync: (sql, params = []) => db.getAllAsync(sql, params),
            getFirstAsync: (sql, params = []) => db.getFirstAsync(sql, params),
            execAsync: (sql) => db.execAsync(sql),
        };

        // callback может быть async
        await callback(tx);
    });
}

export async function initDb() {
    // BOOKS
    await run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY,
      book_name TEXT UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      target_word_count INTEGER,
      cover_image TEXT
    );
  `);

    // CHAPTERS
    await run(`
    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY,
      book_id INTEGER,
      title TEXT,
      order_index INTEGER,
      content_md TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      word_count INTEGER,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(book_id) REFERENCES books(id)
    );
  `);

    // REVISIONS
    await run(`
    CREATE TABLE IF NOT EXISTS revisions (
      id INTEGER PRIMARY KEY,
      chapter_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      content_md TEXT NOT NULL,
      note TEXT,
      FOREIGN KEY(chapter_id) REFERENCES chapters(id)
    );
  `);

    console.log("Database initialized.");
}
