import { PGlite } from '@electric-sql/pglite';
import { SYNC_SCHEMA_SQL, getTriggerSQL } from '../src/lib/data/sync/schema';

async function runTest() {
    console.log("1. Initializing PGlite in-memory...");
    const db = new PGlite();

    console.log("2. Applying Sync Schema...");
    await db.exec(SYNC_SCHEMA_SQL);

    console.log("3. Creating Test Table 'todos'...");
    await db.query(`CREATE TABLE todos (id UUID PRIMARY KEY, title TEXT);`);

    console.log("4. Attaching Sync Trigger...");
    await db.exec(getTriggerSQL('todos'));

    console.log("5. Performing INSERT...");
    await db.query(`INSERT INTO todos (id, title) VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Buy Milk');`);

    console.log("6. Checking _oplog...");
    const res = await db.query(`SELECT * FROM _oplog`);

    if (res.rows.length === 1) {
        const op = res.rows[0] as any;
        console.log("✅ SUCCESS: Oplog captured the change!");
        console.log("   Op Type:", op.op_type); // Should be INSERT
        console.log("   Table:", op.table_name); // Should be todos
        console.log("   Row ID:", op.row_id); // Should be 550e8400-e29b-41d4-a716-446655440000
        console.log("   Changes:", JSON.stringify(op.changes));
    } else {
        console.error("❌ FAILURE: Oplog is empty.");
        process.exit(1);
    }

    console.log("7. Performing UPDATE...");
    await db.query(`UPDATE todos SET title = 'Buy Cookies' WHERE id = '550e8400-e29b-41d4-a716-446655440000';`);

    const res2 = await db.query(`SELECT * FROM _oplog ORDER BY timestamp ASC`);
    if (res2.rows.length === 2) {
        console.log("✅ SUCCESS: Update captured!");
        console.log("   Op Type:", (res2.rows[1] as any).op_type); // Should be UPDATE
    } else {
        console.error("❌ FAILURE: Update not captured.");
        process.exit(1);
    }
}

runTest().catch(e => {
    console.error(e);
    process.exit(1);
});
