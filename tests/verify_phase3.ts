import { PGlite } from '@electric-sql/pglite';

// MOCK DatabaseService for Node Environment
class DatabaseService {
    private static instance: DatabaseService;
    private db: PGlite | null = null;

    public static getInstance() {
        if (!DatabaseService.instance) DatabaseService.instance = new DatabaseService();
        return DatabaseService.instance;
    }

    public async init() {
        if (this.db) return;
        // Use in-memory for testing
        this.db = new PGlite();
        await this.applyMigrations();
    }

    public getDB() { return this.db!; }

    public async query(sql: string, params?: any[]) {
        await this.init();
        const res = await this.db!.query(sql, params);
        return res.rows;
    }

    private async applyMigrations() {
        await this.db!.query(`
            CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT, updated_at TIMESTAMP, version INTEGER);
            CREATE TABLE IF NOT EXISTS pages (id TEXT PRIMARY KEY, project_id TEXT, slug TEXT, title TEXT, root_element_id TEXT);
            CREATE TABLE IF NOT EXISTS elements (id TEXT PRIMARY KEY, page_id TEXT, type TEXT, parent_id TEXT, props JSONB, styles JSONB, text_content TEXT);
            CREATE TABLE IF NOT EXISTS sync_queue (id TEXT PRIMARY KEY DEFAULT 'uuid', table_name TEXT, row_id TEXT, operation TEXT, payload JSONB, created_at TIMESTAMP);
        `);
    }
}

// MOCK SyncManager 
const mockDb = DatabaseService.getInstance();
const syncManager = {
    captureChange: async (table: string, id: string, op: string, payload: any) => {
        console.log(`[Sync] Captured: ${op} ${table} ${id}`);
        await mockDb.query(`INSERT INTO sync_queue (table_name, row_id, operation, payload) VALUES ($1, $2, $3, $4)`, [table, id, op, JSON.stringify(payload)]);
    }
}

// MOCK DB Data
const mockProject = {
    id: 'test-project-1',
    name: 'Verification Project',
    pages: [{ id: 'page-1', slug: '/', name: 'Home', rootElementId: 'root-1' }],
    elements: {
        'root-1': { id: 'root-1', type: 'page', props: {}, styles: {}, parentId: null, content: '' },
        'btn-1': { id: 'btn-1', type: 'button', props: { label: 'Click Me' }, styles: { color: 'red' }, parentId: 'root-1', content: 'Click Me' }
    }
};

async function runTest() {
    console.log("Starting Phase 3 Verification...");

    // 1. Save Project Logic (Simplified from DataLoader)
    console.log("Step 1: Saving Project...");
    await mockDb.query("INSERT INTO projects (id, name) VALUES ($1, $2)", [mockProject.id, mockProject.name]);
    await syncManager.captureChange('projects', mockProject.id, 'UPDATE', { name: mockProject.name });

    for (const page of mockProject.pages) {
        await mockDb.query("INSERT INTO pages (id, project_id, slug, title) VALUES ($1, $2, $3, $4)", [page.id, mockProject.id, page.slug, page.name]);
        await syncManager.captureChange('pages', page.id, 'UPDATE', { title: page.name });
    }

    for (const el of Object.values(mockProject.elements)) {
        await mockDb.query("INSERT INTO elements (id, type, props, styles) VALUES ($1, $2, $3, $4)", [el.id, el.type, JSON.stringify(el.props), JSON.stringify(el.styles)]);
        await syncManager.captureChange('elements', el.id, 'UPDATE', el);
    }

    // 2. Verify Data
    console.log("\nStep 2: Verifying Tables...");
    const projects = await mockDb.query("SELECT * FROM projects");
    console.log(`- Projects: ${projects.length} (Expected 1)`);
    if (projects.length !== 1) throw new Error("Project not saved");

    const elements = await mockDb.query("SELECT * FROM elements");
    console.log(`- Elements: ${elements.length} (Expected 2)`);
    if (elements.length !== 2) throw new Error("Elements not saved");

    // 3. Verify Sync Queue
    console.log("\nStep 3: Verifying Sync Queue...");
    const queue = await mockDb.query("SELECT * FROM sync_queue");
    console.log(`- Queue Items: ${queue.length} (Expected 4: 1 Proj + 1 Page + 2 Elements)`);
    if (queue.length !== 4) throw new Error("Sync Queue incomplete");

    console.log("\n✅ Phase 3 Verification PASSED!");
}

runTest().catch(e => {
    console.error("❌ Verification FAILED:", e);
    process.exit(1);
});
