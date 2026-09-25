// ChatGPT использовался для отдельных подсказок в процессе разработки
import * as SQLite from "expo-sqlite";

import { runMigrations } from "./migrations";


let dbPromise = null;


export function getDb() {
    if (!dbPromise) {
        dbPromise = (async () => {
            const db = await SQLite.openDatabaseAsync("writer_app.db");

            await db.execAsync(`
                PRAGMA journal_mode = WAL;
            `);

            return db;
        })();
    }

    return dbPromise;
}


export async function query(sql, params = []) {
    const db = await getDb();

    const rowsArray = await db.getAllAsync(sql, params);

    const rows = {
        length: rowsArray.length,
        item: (index) => rowsArray[index],
        _array: rowsArray,
    };

    return { rows };
}


export async function get(sql, params = []) {
    const db = await getDb();

    const row = await db.getFirstAsync(sql, params);

    return row ?? null;
}


export async function run(sql, params = []) {
    const db = await getDb();

    const result = await db.runAsync(sql, params);

    return {
        insertId: result.lastInsertRowId ?? null,
        rowsAffected: result.changes ?? 0,
    };
}


export async function transaction(callback) {
    const db = await getDb();

    await db.withExclusiveTransactionAsync(async (tx) => {
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
            last_activity_at TEXT NOT NULL,
            target_word_count INTEGER,
            target_chapter_count INTEGER,
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
            target_word_count INTEGER,
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


    const db = await getDb();

    await runMigrations(db);

    console.log("Database initialized.");
}
