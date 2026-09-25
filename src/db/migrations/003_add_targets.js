async function columnExists(
    db,
    tableName,
    columnName
) {
    const columns = await db.getAllAsync(
        `PRAGMA table_info(${tableName});`
    );

    return columns.some(
        column => column.name === columnName
    );
}


async function up(db) {
    const hasTargetChapterCount = await columnExists(
        db,
        "books",
        "target_chapter_count"
    );


    if (!hasTargetChapterCount) {
        await db.execAsync(`
            ALTER TABLE books
            ADD COLUMN target_chapter_count INTEGER;
        `);
    }


    const hasTargetWordCount = await columnExists(
        db,
        "chapters",
        "target_word_count"
    );


    if (!hasTargetWordCount) {
        await db.execAsync(`
            ALTER TABLE chapters
            ADD COLUMN target_word_count INTEGER;
        `);
    }
}


export default {
    version: 3,
    name: "add book and chapter targets",
    up,
};
