import migration003 from "./003_add_targets";


const migrations = [
    migration003,
];


export async function runMigrations(db) {
    const result = await db.getFirstAsync(`
        PRAGMA user_version;
    `);

    let currentVersion = Number(
        result?.user_version ?? 0
    );


    for (const migration of migrations) {
        if (currentVersion >= migration.version) {
            continue;
        }


        console.log(
            `Running migration ${migration.version}: ${migration.name}`
        );


        await db.withExclusiveTransactionAsync(async (tx) => {
            await migration.up(tx);

            await tx.execAsync(`
                PRAGMA user_version = ${migration.version};
            `);
        });


        currentVersion = migration.version;


        console.log(
            `Migration ${migration.version} completed.`
        );
    }
}
