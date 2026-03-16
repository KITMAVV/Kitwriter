// chaptersRepository.js
import { run, query, get, transaction} from "../db/database";

import { touchBookActivity } from "./booksRepository";

/**
 * Структура таблицы chapters:
 *  id           INTEGER PRIMARY KEY
 *  book_id      INTEGER
 *  title        TEXT
 *  order_index  INTEGER
 *  content_md   TEXT
 *  created_at   TEXT NOT NULL
 *  updated_at   TEXT NOT NULL
 *  word_count   INTEGER
 *  is_deleted   INTEGER NOT NULL DEFAULT 0
 */

function nowIso() {
    return new Date().toISOString();
}

function calcWordCount(content_md) {
    if (!content_md) return 0;
    return content_md
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
}

/**
 * Создать главу.
 * data: { book_id, title?, content_md?, order_index?, word_count? }
 *
 * Если order_index не передан, то:
 *   order_index = (MAX(order_index) для book_id среди не удалённых) + 1
 *
 * Возвращает созданную главу.
 */
export async function createChapter(data) {
    const {
        book_id,
        title = "",
        content_md = "",
        order_index = null,
        word_count = null,
    } = data;

    const createdAt = nowIso();
    const updatedAt = createdAt;

    let newChapterId = null;

    await transaction(async (tx) => {
        let finalOrderIndex = order_index;

        if (finalOrderIndex == null) {
            const row = await tx.getFirstAsync(
                `SELECT MAX(order_index) AS maxOrder
         FROM chapters
         WHERE book_id = ? AND is_deleted = 0`,
                [book_id]
            );
            const maxOrder = row?.maxOrder ?? 0;
            finalOrderIndex = maxOrder + 1;
        }

        const wc = word_count ?? calcWordCount(content_md);

        const sql = `
      INSERT INTO chapters (
        book_id,
        title,
        order_index,
        content_md,
        created_at,
        updated_at,
        word_count,
        is_deleted
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `;

        const params = [
            book_id,
            title,
            finalOrderIndex,
            content_md,
            createdAt,
            updatedAt,
            wc,
        ];

        const res = await tx.runAsync(sql, params);
        newChapterId = res.lastInsertRowId ?? null;
    });

    if (!newChapterId) return null;
    await touchBookActivity(book_id, updatedAt);
    return await getChapterById(newChapterId);
}

/**
 * Получить главу по id.
 * options: { includeDeleted?: boolean }
 */
export async function getChapterById(id, options = {}) {
    const { includeDeleted = false } = options;

    let sql = `SELECT * FROM chapters WHERE id = ?`;
    const params = [id];

    if (!includeDeleted) {
        sql += ` AND is_deleted = 0`;
    }

    return await get(sql, params);
}

/**
 * Получить все главы книги.
 * options: { includeDeleted?: boolean }
 * Возвращает массив глав, отсортированных по order_index ASC.
 */
export async function getChaptersByBookId(bookId, options = {}) {
    const { includeDeleted = false } = options;

    let sql = `
    SELECT *
    FROM chapters
    WHERE book_id = ?
  `;
    const params = [bookId];

    if (!includeDeleted) {
        sql += ` AND is_deleted = 0`;
    }

    sql += ` ORDER BY order_index ASC, created_at ASC`;

    const result = await query(sql, params);
    return result.rows._array;
}

/**
 * Обновить главу.
 * id — обязательный
 * fields могут содержать:
 *   { book_id?, title?, content_md?, order_index?, word_count?, is_deleted? }
 *
 * updated_at всегда обновляется.
 * Если content_md меняется, а word_count не передан — word_count пересчитывается.
 *
 * Возвращает обновлённую главу или null, если ничего не обновлено.
 */
export async function updateChapter(id, fields) {
    const existing = await getChapterById(id, { includeDeleted: true });
    if (!existing) return null;

    if (!fields || Object.keys(fields).length === 0) {
        return await getChapterById(id);
    }

    const allowedFields = [
        "title",
        "content_md",
        "order_index",
        "word_count",
        "is_deleted",
    ];

    // Если content_md есть, а word_count нет — пересчитаем
    if (
        Object.prototype.hasOwnProperty.call(fields, "content_md") &&
        !Object.prototype.hasOwnProperty.call(fields, "word_count")
    ) {
        fields.word_count = calcWordCount(fields.content_md);
    }

    const setPieces = [];
    const params = [];

    for (const key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(fields, key)) {
            setPieces.push(`${key} = ?`);
            params.push(fields[key]);
        }
    }

    if (setPieces.length === 0) {
        return await getChapterById(id);
    }

    setPieces.push("updated_at = ?");
    params.push(nowIso());

    const sql = `
    UPDATE chapters
    SET ${setPieces.join(", ")}
    WHERE id = ?
  `;
    params.push(id);

    const { rowsAffected } = await run(sql, params);
    if (rowsAffected === 0) return null;

    await touchBookActivity(existing.book_id);
    return await getChapterById(id, { includeDeleted: true });
}

/**
 * Soft delete главы — ставим is_deleted = 1.
 * Возвращает обновлённую главу или null.
 */
export async function softDeleteChapter(id) {
    return await updateChapter(id, { is_deleted: 1 });
}

/**
 * Восстановить soft-deleted главу — is_deleted = 0.
 * Возвращает обновлённую главу или null.
 */
export async function restoreChapter(id) {
    return await updateChapter(id, { is_deleted: 0 });
}

/**
 * Жёсткое удаление главы.
 * Возвращает true/false.
 */
export async function deleteChapterHard(id) {
    const existing = await getChapterById(id, { includeDeleted: true });

    if (!existing) return false;

    const sql = `DELETE FROM chapters WHERE id = ?`;
    const { rowsAffected } = await run(sql, [id]);

    if (rowsAffected > 0) {
        await touchBookActivity(existing.book_id);
        return true;
    }

    return false;
}

/**
 * Переупорядочить главы книги.
 * newOrderIds — массив id глав в нужном порядке.
 *
 * Пример:
 *   await reorderChapters(1, [10, 12, 11]);
 *   // для book_id=1:
 *   //  id=10 -> order_index=1
 *   //  id=12 -> order_index=2
 *   //  id=11 -> order_index=3
 */
export async function reorderChapters(bookId, newOrderIds) {
    await transaction(async (tx) => {
        for (let i = 0; i < newOrderIds.length; i++) {
            const chapterId = newOrderIds[i];
            await tx.runAsync(
                `
          UPDATE chapters
          SET order_index = ?, updated_at = ?
          WHERE id = ? AND book_id = ?
        `,
                [i + 1, nowIso(), chapterId, bookId]
            );
        }
    });
    
    await touchBookActivity(bookId);
    return await getChaptersByBookId(bookId);
}

/**
 * Получить все удалённые главы книги (корзина).
 */
export async function getDeletedChaptersByBookId(bookId) {
    const sql = `
    SELECT *
    FROM chapters
    WHERE book_id = ? AND is_deleted = 1
    ORDER BY updated_at DESC
  `;
    const result = await query(sql, [bookId]);
    return result.rows._array;
}

const chaptersRepository = {
    createChapter,
    getChapterById,
    getChaptersByBookId,
    updateChapter,
    softDeleteChapter,
    restoreChapter,
    deleteChapterHard,
    reorderChapters,
    getDeletedChaptersByBookId,
};

export default chaptersRepository;
