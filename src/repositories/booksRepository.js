// booksRepository.js
import { run, query, get} from "../db/database";

/**
 * Структура записи книги в БД:
 * id                 INTEGER PRIMARY KEY
 * book_name          TEXT UNIQUE
 * description        TEXT
 * created_at         TEXT (ISO-строка)
 * updated_at         TEXT (ISO-строка)
 * last_activity_at   TEXT (ISO-строка)
 * target_word_count  INTEGER
 * cover_image        TEXT
 */

/**
 * Утилита: текущее время в ISO-формате
 */
function nowIso() {
    return new Date().toISOString();
}

/**
 * Создать книгу.
 * data: { book_name, description?, target_word_count?, cover_image? }
 * Возвращает созданную книгу (строку из БД).
 */
export async function createBook(data) {
    const {
        book_name,
        description = null,
        target_word_count = null,
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
      cover_image
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

    const params = [
        book_name,
        description,
        createdAt,
        updatedAt,
        lastActivityAt,
        target_word_count,
        cover_image,
    ];

    const { insertId } = await run(sql, params);

    // Вернём полную запись из БД
    return await getBookById(insertId);
}

/**
 * Получить книгу по id.
 * Возвращает объект книги или null.
 */
export async function getBookById(id) {
    const sql = `SELECT * FROM books WHERE id = ?`;
    return await get(sql, [id]); // get уже возвращает либо объект, либо null
}

/**
 * Получить книгу по имени (book_name).
 * Возвращает объект книги или null.
 */
export async function getBookByName(bookName) {
    const sql = `SELECT * FROM books WHERE book_name = ?`;
    return await get(sql, [bookName]);
}

/**
 * Получить все книги.
 * Возвращает массив объектов.
 */
export async function getAllBooks() {
    const sql = `SELECT * FROM books ORDER BY created_at DESC`;
    const result = await query(sql);
    // query возвращает { rows: { _array, length, item(i) } }
    return result.rows._array;
}

/**
 * Получить книгу, над которой работали последней.
 * Учитывается реальная работа над содержанием (главы),
 * НЕ ИЗМЕНЕНИЕ МЕТАДАННЫХ!
 * 
 * Возвращает объект книги или null.
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
 * id — обязательный, fields — объект с любыми полями для обновления:
 * { book_name?, description?, target_word_count?, cover_image? }
 * updated_at обновляется автоматически.
 *
 * Возвращает обновлённую книгу или null, если ничего не обновлено.
 */
export async function updateBook(id, fields) {
    if (!fields || Object.keys(fields).length === 0) {
        // Нечего обновлять — просто вернуть текущую запись
        return await getBookById(id);
    }

    // Собираем части SET динамически
    const allowedFields = [
        "book_name",
        "description",
        "target_word_count",
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

    // Если ни одно поле не разрешено/не передано — выходим
    if (setPieces.length === 0) {
        return await getBookById(id);
    }

    // updated_at выставляем всегда
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
        return null; // книги с таким id нет
    }

    return await getBookById(id);
}

/**
 * Удалить книгу по id (жёсткое удаление).
 * Возвращает true, если что-то удалилось, иначе false.
 */
export async function deleteBook(id) {
    const sql = `DELETE FROM books WHERE id = ?`;
    const { rowsAffected } = await run(sql, [id]);
    return rowsAffected > 0;
}

//  Дает возможность обновить последнюю активность из Chapters
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
 * (Опционально) Быстрый поиск по части названия.
 * Возвращает массив книг.
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

// Можно также экспортировать объект-репозиторий по умолчанию
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
};

export default booksRepository;
