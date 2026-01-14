import { Collection, CollectionField } from '@/types/designer';

export class SchemaTranslator {
    static toCreateTable(collection: Collection): string {
        const columns = collection.fields.map(field => {
            let sqlType = 'TEXT';
            if (field.type === 'number') sqlType = 'NUMERIC';
            if (field.type === 'boolean') sqlType = 'BOOLEAN';
            if (field.type === 'date') sqlType = 'TIMESTAMP';
            if (field.type === 'json') sqlType = 'JSONB';
            if (field.type === 'relational') sqlType = 'UUID'; // Foreign key

            const colName = field.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
            let def = `"${colName}" ${sqlType}`;
            if (field.required) def += ' NOT NULL';
            if (field.unique) def += ' UNIQUE';
            // Default values?
            return def;
        });

        // Add standard columns
        columns.unshift('"id" UUID PRIMARY KEY DEFAULT gen_random_uuid()');
        columns.push('"created_at" TIMESTAMP DEFAULT NOW()');
        columns.push('"updated_at" TIMESTAMP DEFAULT NOW()');

        return `CREATE TABLE IF NOT EXISTS "${collection.slug}" (\n  ${columns.join(',\n  ')}\n);`;
    }

    static toAlterTable(collection: Collection, oldCollection: Collection): string[] {
        // TODO: Diff fields and generate ALTER TABLE ADD COLUMN etc.
        return [];
    }
}
