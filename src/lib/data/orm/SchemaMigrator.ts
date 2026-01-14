
import { Collection, CollectionField } from '@/types/designer';
import { SchemaTranslator } from './SchemaTranslator';
import { getTriggerSQL } from '@/lib/data/sync/schema';

export class SchemaMigrator {
    /**
     * Synchronizes the PGLite database schema with the current OMNIOS Collection definitions.
     * Handles table creation and column additions.
     * Does NOT destructively drop columns or tables to prevent data loss during design.
     */
    static async migrate(db: any, collections: Collection[]) {
        if (!db) return;

        console.log('[SchemaMigrator] Starting migration...');

        // 1. Get existing tables
        const existingTablesRes = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        const existingTables = new Set(existingTablesRes.rows.map((r: any) => r.table_name));

        const queries: string[] = [];
        const triggerQueries: { tableName: string, sql: string }[] = [];

        for (const collection of collections) {
            const tableName = collection.slug || collection.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();

            if (!existingTables.has(tableName)) {
                // Table doesn't exist? Create it fully.
                console.log(`[SchemaMigrator] Creating new table: ${tableName}`);
                queries.push(SchemaTranslator.toCreateTable(collection));

                // Add Trigger
                triggerQueries.push({ tableName, sql: getTriggerSQL(tableName) });
            } else {
                // Table exists? Check columns.
                console.log(`[SchemaMigrator] Checking table: ${tableName}`);
                // Always ensure trigger is present even for existing tables (Batch 8.3)
                triggerQueries.push({ tableName, sql: getTriggerSQL(tableName) });

                const existingColumnsRes = await db.query(`
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = '${tableName}'
                `);
                const existingColumns = new Set(existingColumnsRes.rows.map((r: any) => r.column_name));

                for (const field of collection.fields) {
                    const fieldName = field.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
                    if (!existingColumns.has(fieldName)) {
                        console.log(`[SchemaMigrator] Adding column: ${fieldName} to ${tableName}`);
                        const sqlType = this.mapTypeToSQL(field.type);
                        queries.push(`ALTER TABLE "${tableName}" ADD COLUMN "${fieldName}" ${sqlType};`);

                        if (field.type === 'reference' && field.referenceCollectionId) {
                            const targetCollection = collections.find(c => c.id === field.referenceCollectionId);
                            if (targetCollection) {
                                const targetTable = targetCollection.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
                                const constraintName = `fk_${tableName}_${fieldName}`;
                                queries.push(`ALTER TABLE "${tableName}" ADD CONSTRAINT "${constraintName}" FOREIGN KEY ("${fieldName}") REFERENCES "${targetTable}" ("id");`);
                            }
                        }
                    }
                }
            }
        }

        // Execute DDL queries
        for (const queryGroup of queries) {
            try {
                const statements = queryGroup.split(';').map(s => s.trim()).filter(s => s.length > 0);
                for (const statement of statements) {
                    console.debug('[SchemaMigrator] Executing DDL:', statement);
                    await db.query(statement);
                }
            } catch (e) {
                console.error('[SchemaMigrator] DDL Migration Failed:', queryGroup, e);
            }
        }

        // Execute Trigger queries (Batch 8.3)
        for (const trigger of triggerQueries) {
            try {
                // Triggers drop/create often use semicolons
                const statements = trigger.sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
                for (const statement of statements) {
                    console.debug(`[SchemaMigrator] Ensuring trigger for ${trigger.tableName}`);
                    await db.exec(statement);
                }
            } catch (e) {
                console.error(`[SchemaMigrator] Trigger Config Failed for ${trigger.tableName}:`, e);
            }
        }

        console.log('[SchemaMigrator] Migration complete.');
    }

    private static mapTypeToSQL(omniosType: string): string {
        switch (omniosType) {
            case 'text':
            case 'rich-text':
            case 'url':
            case 'email':
                return 'TEXT';
            case 'number':
                return 'NUMERIC';
            case 'boolean':
                return 'BOOLEAN';
            case 'date':
                return 'TIMESTAMP WITH TIME ZONE';
            case 'json':
            case 'image':
            case 'file':
                return 'JSONB';
            case 'reference':
                return 'UUID';
            case 'relation':
                return 'TEXT';
            default:
                return 'TEXT';
        }
    }
}
