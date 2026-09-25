// Описание функций и beautify сделано при помощи ChatGPT
import { run, query, get } from "../db/database";

/**
 * Структура записи книги в БД:
 * id                    INTEGER PRIMARY KEY
 * book_name             TEXT UNIQUE
 * description           TEXT
 * created_at            TEXT (ISO-строка)
 * updated_at            TEXT (ISO-строка)
 * last_activity_at      TEXT (ISO-строка)
 * target_word_count     INTEGER
 * target_chapter_count  INTEGER
 * cover_image           TEXT
 */

function nowIso() {
    return new Date().toISOString();
}

/**
 * Создать книгу.
 * data: { book_name, description?, target_word_count?, target_chapter_count?, cover_image? }
 *
 * Возвращает созданную книгу (строку из БД).
 *
 * Пример:
 * const book = await createBook({
 *     book_name: "Моя книга",
 *     description: "Черновик романа",
 *     target_word_count: 80000,
 *     target_chapter_count: 25,
 * });
 */
export async function createBook(data) {
    const {
        book_name,
        description = null,
        target_word_count = null,
        target_chapter_count = null,
        cover_image = null,
    } = data;

    const createdAt = nowIso();
    const updatedAt = createdAt;
    const lastActivityAt = createdAt;

    const sql = `
    INSERT INTO books (
      book_name,
      description,
      created_at,
      updated_at,
      last_activity_at,
      target_word_count,
      target_chapter_count,
      cover_image
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const params = [
        book_name,
        description,
        createdAt,
        updatedAt,
        lastActivityAt,
        target_word_count,
        target_chapter_count,
        cover_image,
    ];

    const { insertId } = await run(sql, params);

    return await getBookById(insertId);
}

/**
 * Получить книгу по id.
 * Возвращает объект книги или null.
 *
 * Пример:
 * const book = await getBookById(1);
 */
export async function getBookById(id) {
    const sql = `SELECT * FROM books WHERE id = ?`;
    return await get(sql, [id]);
}

/**
 * Получить книгу по имени (book_name).
 * Возвращает объект книги или null.
 *
 * Пример:
 * const book = await getBookByName("Моя книга");
 */
export async function getBookByName(bookName) {
    const sql = `SELECT * FROM books WHERE book_name = ?`;
    return await get(sql, [bookName]);
}

/**
 * Получить все книги.
 * Возвращает массив объектов.
 *
 * Пример:
 * const books = await getAllBooks();
 */
export async function getAllBooks() {
    const sql = `SELECT * FROM books ORDER BY created_at DESC`;
    const result = await query(sql);
    return result.rows._array;
}

/**
 * Получить книгу, над которой работали последней.
 * Учитывается реальная работа над содержанием глав,
 * а не изменение метаданных книги.
 *
 * Возвращает объект книги или null.
 *
 * Пример:
 * const book = await getLastActiveBook();
 */
export async function getLastActiveBook() {
    const sql = `
      SELECT *
      FROM books
      ORDER BY last_activity_at DESC
      LIMIT 1
    `;

    return await get(sql);
}

/**
 * Обновить книгу.
 * id — обязательный.
 *
 * fields могут содержать:
 * { book_name?, description?, target_word_count?, target_chapter_count?, cover_image? }
 *
 * updated_at обновляется автоматически.
 * Чтобы очистить цель, можно передать null.
 *
 * Возвращает обновлённую книгу или null, если книги нет.
 *
 * Пример:
 * const book = await updateBook(1, {
 *     target_word_count: 90000,
 *     target_chapter_count: 30,
 * });
 */
export async function updateBook(id, fields) {
    if (!fields || Object.keys(fields).length === 0) {
        return await getBookById(id);
    }

    const allowedFields = [
        "book_name",
        "description",
        "target_word_count",
        "target_chapter_count",
        "cover_image",
    ];

    const setPieces = [];
    const params = [];

    for (const key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(fields, key)) {
            setPieces.push(`${key} = ?`);
            params.push(fields[key]);
        }
    }

    if (setPieces.length === 0) {
        return await getBookById(id);
    }

    setPieces.push("updated_at = ?");
    params.push(nowIso());

    const sql = `
    UPDATE books
    SET ${setPieces.join(", ")}
    WHERE id = ?
  `;

    params.push(id);

    const { rowsAffected } = await run(sql, params);

    if (rowsAffected === 0) {
        return null;
    }

    return await getBookById(id);
}

/**
 * Удалить книгу по id (жёсткое удаление).
 * Возвращает true, если книга удалена, иначе false.
 *
 * Пример:
 * const deleted = await deleteBook(1);
 */
export async function deleteBook(id) {
    const sql = `DELETE FROM books WHERE id = ?`;
    const { rowsAffected } = await run(sql, [id]);
    return rowsAffected > 0;
}

/**
 * Обновить время последней активности книги.
 * Обычно вызывается из chaptersRepository после изменения содержимого главы.
 *
 * timestamp можно не передавать — будет использовано текущее время.
 * Возвращает true/false.
 *
 * Пример:
 * await touchBookActivity(1);
 *
 * Пример с конкретным временем:
 * await touchBookActivity(1, new Date().toISOString());
 */
export async function touchBookActivity(bookId, timestamp = nowIso()) {
    const sql = `
      UPDATE books
      SET last_activity_at = ?
      WHERE id = ?
    `;

    const { rowsAffected } = await run(sql, [timestamp, bookId]);
    return rowsAffected > 0;
}

/**
 * Получить статистику книги и данные для автоматической цели главы.
 *
 * word_count — фактическое количество слов во всех не удалённых главах.
 * target_word_count — глобальная цель книги.
 * target_chapter_count — планируемое количество глав.
 * chapter_count — текущее количество не удалённых глав.
 * manual_target_word_count — сумма индивидуальных целей глав.
 * manual_target_chapter_count — количество глав с индивидуальной целью.
 * auto_chapter_target_word_count — автоматическая цель для главы без своей цели.
 *
 * Для расчёта количества глав используется большее значение из:
 * - планируемого количества глав;
 * - фактически созданного количества глав.
 *
 * Автоматическая цель считается так:
 * (target_word_count - сумма индивидуальных целей)
 * / (effective_chapter_count - количество глав с индивидуальной целью)
 *
 * Если сумма индивидуальных целей превышает цель книги,
 * оставшееся количество слов считается равным 0.
 *
 * Если данных недостаточно или глав без индивидуальной цели не осталось,
 * auto_chapter_target_word_count будет null.
 *
 * Возвращает объект статистики или null, если книга не найдена.
 *
 * Пример:
 * const stats = await getBookWordStats(1);
 * console.log(stats.word_count);
 * console.log(stats.auto_chapter_target_word_count);
 */
export async function getBookWordStats(bookId) {
    const sql = `
        SELECT
            b.target_word_count,
            b.target_chapter_count,
            COALESCE(SUM(c.word_count), 0) AS word_count,
            COUNT(c.id) AS chapter_count,
            COALESCE(
                    SUM(
                            CASE
                                WHEN c.target_word_count IS NOT NULL
                                    THEN c.target_word_count
                                ELSE 0
                                END
                    ),
                    0
            ) AS manual_target_word_count,
            COALESCE(
                    SUM(
                            CASE
                                WHEN c.target_word_count IS NOT NULL
                                    THEN 1
                                ELSE 0
                                END
                    ),
                    0
            ) AS manual_target_chapter_count
        FROM books b
                 LEFT JOIN chapters c
                           ON c.book_id = b.id
                               AND c.is_deleted = 0
        WHERE b.id = ?
        GROUP BY
            b.id,
            b.target_word_count,
            b.target_chapter_count
    `;

    const stats = await get(sql, [bookId]);

    if (!stats) {
        return null;
    }

    let autoChapterTargetWordCount = null;

    if (
        stats.target_word_count != null &&
        stats.target_chapter_count != null
    ) {
        const effectiveChapterCount = Math.max(
            stats.target_chapter_count,
            stats.chapter_count
        );

        const remainingWords = Math.max(
            0,
            stats.target_word_count -
            stats.manual_target_word_count
        );

        const remainingChapters =
            effectiveChapterCount -
            stats.manual_target_chapter_count;

        if (remainingChapters > 0) {
            autoChapterTargetWordCount = Math.round(
                remainingWords / remainingChapters
            );
        }
    }

    return {
        ...stats,
        auto_chapter_target_word_count: autoChapterTargetWordCount,
    };
}

/**
 * Быстрый поиск книг по части названия.
 * Возвращает массив книг.
 *
 * Пример:
 * const books = await searchBooksByName("роман");
 */
export async function searchBooksByName(search) {
    const sql = `
    SELECT *
    FROM books
    WHERE book_name LIKE ?
    ORDER BY created_at DESC
  `;

    const like = `%${search}%`;
    const result = await query(sql, [like]);
    return result.rows._array;
}

const booksRepository = {
    createBook,
    getBookById,
    getBookByName,
    getAllBooks,
    getLastActiveBook,
    updateBook,
    deleteBook,
    searchBooksByName,
    touchBookActivity,
    getBookWordStats,
};

export default booksRepository;
