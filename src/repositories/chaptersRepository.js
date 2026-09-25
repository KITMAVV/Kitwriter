// Описание функций и beautify сделано при помощи ChatGPT
import { run, query, get, transaction } from "../db/database";

import { touchBookActivity, getBookWordStats, } from "./booksRepository";

/**
 * Структура таблицы chapters:
 *  id                 INTEGER PRIMARY KEY
 *  book_id            INTEGER
 *  title              TEXT
 *  order_index        INTEGER
 *  content_md         TEXT
 *  created_at         TEXT NOT NULL
 *  updated_at         TEXT NOT NULL
 *  word_count         INTEGER
 *  target_word_count  INTEGER
 *  is_deleted         INTEGER NOT NULL DEFAULT 0
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
 * data: { book_id, title?, content_md?, order_index?, word_count?, target_word_count? }
 *
 * Если order_index не передан:
 * order_index = MAX(order_index) среди не удалённых глав книги + 1.
 *
 * target_word_count = null означает, что глава использует автоматическую цель книги.
 *
 * Возвращает созданную главу.
 *
 * Пример:
 * const chapter = await createChapter({
 *     book_id: 1,
 *     title: "Глава 1",
 *     content_md: "",
 *     target_word_count: 3500,
 * });
 */
export async function createChapter(data) {
    const {
        book_id,
        title = "",
        content_md = "",
        order_index = null,
        word_count = null,
        target_word_count = null,
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
        target_word_count,
        is_deleted
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;

        const params = [
            book_id,
            title,
            finalOrderIndex,
            content_md,
            createdAt,
            updatedAt,
            wc,
            target_word_count,
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
 *
 * По умолчанию удалённые главы не возвращаются.
 *
 * Пример:
 * const chapter = await getChapterById(10);
 *
 * Пример с удалёнными:
 * const chapter = await getChapterById(10, { includeDeleted: true });
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
 * Получить цель по словам для конкретной главы.
 *
 * Если у главы есть индивидуальная цель — возвращает её.
 * Иначе используется автоматически рассчитанная цель книги.
 *
 * Пример:
 * const target = await getChapterWordTarget(10);
 *
 * // {
 * //     manualTarget: null,
 * //     autoTarget: 3200,
 * //     effectiveTarget: 3200,
 * //     source: "auto"
 * // }
 */
export async function getChapterWordTarget(chapterId) {
    const chapter = await getChapterById(chapterId);

    if (!chapter) return null;

    const stats = await getBookWordStats(chapter.book_id);

    const manualTarget = chapter.target_word_count ?? null;
    const autoTarget =
        stats?.auto_chapter_target_word_count ?? null;

    return {
        manualTarget,
        autoTarget,
        effectiveTarget: manualTarget ?? autoTarget,
        source:
            manualTarget != null
                ? "manual"
                : autoTarget != null
                    ? "auto"
                    : "none",
    };
}

/**
 * Получить все главы книги.
 * options: { includeDeleted?: boolean }
 *
 * Вместо полного текста главы возвращает обрезанный preview.
 * Главы сортируются по order_index ASC.
 *
 * Возвращает массив глав.
 *
 * Пример:
 * const chapters = await getChaptersByBookId(1);
 *
 * Пример с удалёнными:
 * const chapters = await getChaptersByBookId(1, { includeDeleted: true });
 */
export async function getChaptersByBookId(bookId, options = {}) {
    const { includeDeleted = false } = options;

    let sql = `
        SELECT
            id,
            book_id,
            title,
            word_count,
            target_word_count,
            order_index,
            created_at,
            updated_at,
            substr(content_md, 1, 100) AS preview
        FROM chapters
        WHERE book_id = ?
    `;

    const params = [bookId];

    if (!includeDeleted) {
        sql += ` AND is_deleted = 0`;
    }

    sql += ` ORDER BY order_index ASC, created_at ASC`;

    const result = await query(sql, params);

    return result.rows._array.map((chapter) => ({
        ...chapter,
        preview: chapter.preview
            ? chapter.preview.replace(/\n/g, " ").trim()
            : "",
    }));
}

/**
 * Обновить главу.
 * id — обязательный.
 *
 * fields могут содержать:
 * { title?, content_md?, order_index?, word_count?, target_word_count?, is_deleted? }
 *
 * updated_at обновляется автоматически.
 * Если content_md меняется, а word_count не передан — word_count пересчитывается.
 * target_word_count = null сбрасывает индивидуальную цель главы на автоматическую.
 *
 * Возвращает обновлённую главу или null, если главы нет.
 *
 * Пример изменения названия:
 * const chapter = await updateChapter(10, {
 *     title: "Новое название",
 * });
 *
 * Пример индивидуальной цели:
 * const chapter = await updateChapter(10, {
 *     target_word_count: 4500,
 * });
 *
 * Пример возврата к автоматической цели:
 * const chapter = await updateChapter(10, {
 *     target_word_count: null,
 * });
 */
export async function updateChapter(id, fields) {
    const existing = await getChapterById(id, { includeDeleted: true });
    if (!existing) return null;

    if (!fields || Object.keys(fields).length === 0) {
        return await getChapterById(id, { includeDeleted: true });
    }

    const allowedFields = [
        "title",
        "content_md",
        "order_index",
        "word_count",
        "target_word_count",
        "is_deleted",
    ];

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
        return await getChapterById(id, { includeDeleted: true });
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
 * Изменить индивидуальную цель главы.
 * targetWordCount = null возвращает главу к автоматической цели книги.
 *
 * Возвращает обновлённую главу или null.
 *
 * Пример:
 * const chapter = await updateChapterTargetWordCount(10, 4000);
 *
 * Пример сброса индивидуальной цели:
 * const chapter = await updateChapterTargetWordCount(10, null);
 */
export async function updateChapterTargetWordCount(id, targetWordCount) {
    return await updateChapter(id, {
        target_word_count: targetWordCount,
    });
}

/**
 * Soft delete главы — ставит is_deleted = 1.
 * Возвращает обновлённую главу или null.
 *
 * Пример:
 * const chapter = await softDeleteChapter(10);
 */
export async function softDeleteChapter(id) {
    return await updateChapter(id, { is_deleted: 1 });
}

/**
 * Восстановить soft-deleted главу — ставит is_deleted = 0.
 * Возвращает обновлённую главу или null.
 *
 * Пример:
 * const chapter = await restoreChapter(10);
 */
export async function restoreChapter(id) {
    return await updateChapter(id, { is_deleted: 0 });
}

/**
 * Жёстко удалить главу.
 * Возвращает true/false.
 *
 * Пример:
 * const deleted = await deleteChapterHard(10);
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
 * await reorderChapters(1, [10, 12, 11]);
 *
 * Для book_id = 1 получится:
 * id=10 -> order_index=1
 * id=12 -> order_index=2
 * id=11 -> order_index=3
 *
 * Возвращает обновлённый массив глав книги.
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
 *
 * Вместо полного текста главы возвращает обрезанный preview.
 * Главы сортируются по дате изменения, сначала новые.
 *
 * Возвращает массив удалённых глав.
 *
 * Пример:
 * const deletedChapters = await getDeletedChaptersByBookId(1);
 */
export async function getDeletedChaptersByBookId(bookId) {
    const sql = `
        SELECT
            id,
            book_id,
            title,
            word_count,
            target_word_count,
            order_index,
            created_at,
            updated_at,
            substr(content_md, 1, 50) AS preview
        FROM chapters
        WHERE book_id = ? AND is_deleted = 1
        ORDER BY updated_at DESC
    `;

    const result = await query(sql, [bookId]);

    return result.rows._array.map((chapter) => ({
        ...chapter,
        preview: chapter.preview
            ? chapter.preview.replace(/\n/g, " ").trim()
            : "",
    }));
}

const chaptersRepository = {
    createChapter,
    getChapterById,
    getChapterWordTarget,
    getChaptersByBookId,
    updateChapter,
    updateChapterTargetWordCount,
    softDeleteChapter,
    restoreChapter,
    deleteChapterHard,
    reorderChapters,
    getDeletedChaptersByBookId,
};

export default chaptersRepository;
