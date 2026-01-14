import { PGlite } from '@electric-sql/pglite';

export class DatabaseService {
    private static instance: DatabaseService;
    private db: PGlite | null = null;
    private initPromise: Promise<void> | null = null;

    private constructor() { }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async init() {
        if (this.db) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            console.log('Initializing PGlite Database...');
            try {
                // Use IndexedDB persistence key "omnios-data"
                this.db = await PGlite.create("idb://omnios-data");
                console.log('PGlite Database Initialized.');

                await this.applyMigrations();
            } catch (e) {
                console.error('Failed to initialize PGlite:', e);
                throw e;
            }
        })();

        return this.initPromise;
    }

    public getDB(): PGlite {
        if (!this.db) {
            throw new Error("Database not initialized. Call init() first.");
        }
        return this.db;
    }

    public async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
        await this.init();
        if (!this.db) throw new Error("DB Init failed");

        try {
            const result = await this.db.query(sql, params);
            return result.rows as T[];
        } catch (e) {
            console.error(`SQL Error: ${sql}`, e);
            throw e;
        }
    }

    private async applyMigrations() {
        if (!this.db) return;

        // Basic Migration System
        console.log('Applying Schema Migrations...');

        // 1. Projects Table
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                active_page_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                version INTEGER DEFAULT 1
            );
        `);
        // Batch 4.2 Fix: Ensure columns exist if table was created by older version
        try {
            await this.db.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS active_page_id TEXT;`);
        } catch (e) {
            console.warn('Migration warning (projects):', e);
        }

        // 2. Pages Table
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS pages (
                id TEXT PRIMARY KEY,
                project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
                slug TEXT NOT NULL,
                title TEXT,
                root_element_id TEXT
            );
        `);

        // 3. Elements Table (The Big One)
        // We use JSONB for flexible props/styles storage
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS elements (
                id TEXT PRIMARY KEY,
                page_id TEXT REFERENCES pages(id) ON DELETE CASCADE,
                type TEXT NOT NULL,
                parent_id TEXT,
                index INTEGER, -- For ordering within parent
                props JSONB,
                styles JSONB,
                text_content TEXT,
                
                -- Optimization indices
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. Logic Nodes Table
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS logic_nodes (
                id TEXT PRIMARY KEY,
                project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
                type TEXT NOT NULL,
                data JSONB,
                position JSONB,
                measured JSONB
            );
        `);

        // 5. Logic Edges Table
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS logic_edges (
                id TEXT PRIMARY KEY,
                project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
                source TEXT NOT NULL,
                target TEXT NOT NULL,
                source_handle TEXT,
                target_handle TEXT,
                data JSONB,
                label TEXT,
                type TEXT
            );
        `);

        // 6. Design Tokens Table
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS design_tokens (
                id TEXT PRIMARY KEY,
                project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                value TEXT,
                type TEXT,
                modes JSONB
            );
        `);

        // 7. Serverless Functions Table
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS serverless_functions (
                id TEXT PRIMARY KEY,
                project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                route TEXT NOT NULL,
                code TEXT,
                runtime TEXT DEFAULT 'nodejs',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. Create Index on Parent ID for fast tree traversal
        await this.db.query(`CREATE INDEX IF NOT EXISTS idx_elements_parent ON elements(parent_id);`);
        await this.db.query(`CREATE INDEX IF NOT EXISTS idx_elements_page ON elements(page_id);`);

        console.log('Schema Migrations Applied.');
    }
}

export const db = DatabaseService.getInstance();
