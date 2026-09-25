// Описание функций и beautify сделано при помощи ChatGPT
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
 *
 * Пример:
 * const revision = await createRevision({
 *     chapter_id: 10,
 *     content_md: "Текст главы до изменений",
 *     note: "Перед большой правкой",
 * });
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
 *
 * Пример:
 * const revision = await getRevisionById(5);
 */
export async function getRevisionById(id) {
    const sql = `SELECT * FROM revisions WHERE id = ?`;
    return await get(sql, [id]);
}

/**
 * Получить все ревизии по chapter_id.
 *
 * options:
 * { order?: "ASC" | "DESC" }
 *
 * По умолчанию order = "DESC" — новые ревизии сверху.
 *
 * Пример:
 * const revisions = await getRevisionsByChapterId(10);
 *
 * Пример в старом порядке:
 * const revisions = await getRevisionsByChapterId(10, {
 *     order: "ASC",
 * });
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
 *
 * Пример:
 * const deleted = await deleteRevision(5);
 */
export async function deleteRevision(id) {
    const sql = `DELETE FROM revisions WHERE id = ?`;
    const { rowsAffected } = await run(sql, [id]);
    return rowsAffected > 0;
}

/**
 * Удалить все ревизии главы (жёстко).
 * Возвращает количество удалённых строк.
 *
 * Пример:
 * const deletedCount = await deleteRevisionsByChapterId(10);
 */
export async function deleteRevisionsByChapterId(chapterId) {
    const sql = `DELETE FROM revisions WHERE chapter_id = ?`;
    const { rowsAffected } = await run(sql, [chapterId]);
    return rowsAffected ?? 0;
}

/**
 * Изменить заметку ревизии.
 * Возвращает обновлённую ревизию или null, если ревизия не найдена.
 *
 * Пример:
 * const revision = await updateRevisionNote(
 *     5,
 *     "Версия перед переписыванием финала"
 * );
 */
export async function updateRevisionNote(id, note) {
    const sql = `
    UPDATE revisions
    SET note = ?
    WHERE id = ?
  `;

    const { rowsAffected } = await run(sql, [note, id]);
    if (rowsAffected === 0) return null;

    return await getRevisionById(id);
}

/**
 * Создать ревизию из текущего состояния главы.
 *
 * Берёт content_md из таблицы chapters по chapter_id
 * и сохраняет его как новую ревизию.
 *
 * options: { note?: string }
 *
 * Возвращает созданную ревизию или null, если главы нет.
 *
 * Пример:
 * const revision = await createRevisionFromChapter(10, {
 *     note: "Автосохранение перед редактированием",
 * });
 */
export async function createRevisionFromChapter(chapterId, options = {}) {
    const { note = null } = options;

    const chapter = await get(
        `SELECT id, content_md FROM chapters WHERE id = ?`,
        [chapterId]
    );

    if (!chapter) {
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
