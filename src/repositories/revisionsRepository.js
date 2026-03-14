// revisionsRepository.js
import { run, query, get } from "../db/database";

/**
 * Таблица revisions:
 *  id          INTEGER PRIMARY KEY
 *  chapter_id  INTEGER NOT NULL
 *  created_at  TEXT NOT NULL
 *  content_md  TEXT NOT NULL
 *  note        TEXT
 */

function nowIso() {
    return new Date().toISOString();
}

/**
 * Создать ревизию.
 * data: { chapter_id, content_md, note? }
 *
 * Возвращает созданную ревизию.
 */
export async function createRevision(data) {
    const { chapter_id, content_md, note = null } = data;

    const createdAt = nowIso();

    const sql = `
    INSERT INTO revisions (
      chapter_id,
      created_at,
      content_md,
      note
    )
    VALUES (?, ?, ?, ?)
  `;

    const params = [chapter_id, createdAt, content_md, note];

    const { insertId } = await run(sql, params);
    if (!insertId) return null;

    return await getRevisionById(insertId);
}

/**
 * Получить ревизию по id.
 * Возвращает объект или null.
 */
export async function getRevisionById(id) {
    const sql = `SELECT * FROM revisions WHERE id = ?`;
    return await get(sql, [id]);
}

/**
 * Получить все ревизии по chapter_id.
 *
 * options:
 *  - order: "ASC" | "DESC" (по умолчанию "DESC" — новые сверху)
 */
export async function getRevisionsByChapterId(chapterId, options = {}) {
    const { order = "DESC" } = options;
    const normalizedOrder =
        order && order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const sql = `
    SELECT *
    FROM revisions
    WHERE chapter_id = ?
    ORDER BY datetime(created_at) ${normalizedOrder}
  `;

    const result = await query(sql, [chapterId]);
    return result.rows._array;
}

/**
 * Удалить одну ревизию (жёстко).
 * Возвращает true/false.
 */
export async function deleteRevision(id) {
    const sql = `DELETE FROM revisions WHERE id = ?`;
    const { rowsAffected } = await run(sql, [id]);
    return rowsAffected > 0;
}

/**
 * Удалить все ревизии главы (жёстко).
 * Возвращает количество удалённых строк.
 */
export async function deleteRevisionsByChapterId(chapterId) {
    const sql = `DELETE FROM revisions WHERE chapter_id = ?`;
    const { rowsAffected } = await run(sql, [chapterId]);
    return rowsAffected ?? 0;
}

export async function updateRevisionNote(id, note) {
    const sql = `
    UPDATE revisions
    SET note = ?
    WHERE id = ?
  `;
    const { rowsAffected } = await run(sql, [note, id]);
    if (rowsAffected === 0) return null;

    // Вернём обновлённую ревизию
    return await get(`SELECT * FROM revisions WHERE id = ?`, [id]);
}

/**
 * Создать ревизию из текущего состояния главы.
 *
 * Берёт content_md из таблицы chapters по chapter_id и
 * сохраняет как ревизию.
 *
 * options: { note?: string }
 *
 * Возвращает созданную ревизию или null, если главы нет.
 */
export async function createRevisionFromChapter(chapterId, options = {}) {
    const { note = null } = options;

    // Забираем текущий текст главы
    const chapter = await get(
        `SELECT id, content_md FROM chapters WHERE id = ?`,
        [chapterId]
    );

    if (!chapter) {
        // главы нет — нечего сохранять
        return null;
    }

    return await createRevision({
        chapter_id: chapter.id,
        content_md: chapter.content_md ?? "",
        note,
    });
}

const revisionsRepository = {
    createRevision,
    getRevisionById,
    getRevisionsByChapterId,
    deleteRevision,
    deleteRevisionsByChapterId,
    createRevisionFromChapter,
    updateRevisionNote,
};

export default revisionsRepository;
