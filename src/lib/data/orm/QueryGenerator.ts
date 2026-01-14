
import { Collection } from '@/types/designer';

export interface QueryFilter {
    field: string;
    operator: 'equals' | 'contains' | 'gt' | 'lt' | 'in';
    value: any;
}

export interface QuerySort {
    field: string;
    direction: 'asc' | 'desc';
}

export interface QueryOptions {
    filters?: QueryFilter[];
    sort?: QuerySort;
    limit?: number;
    offset?: number;
    include?: string[]; // Batch 2.5: Relations to fetch (field names)
}

export class QueryGenerator {
    /**
     * Generates a safe SQL SELECT statement based on the provided options.
     */
    static generateQuery(collection: Collection, allCollections: Collection[], options: QueryOptions = {}): string {
        const tableName = this.sanitizeIdentifier(collection.name);
        const mainAlias = 't1';

        // Build Select Fields
        let selectFields = [`${mainAlias}.* `];
        const joinClauses: string[] = [];

        // Handle Includes (Joins)
        if (options.include && options.include.length > 0) {
            options.include.forEach((includeField, index) => {
                // Find the field definition
                const fieldDef = collection.fields.find(f => f.name === includeField);
                if (!fieldDef || fieldDef.type !== 'reference' || !fieldDef.referenceCollectionId) return;

                const targetCollection = allCollections.find(c => c.id === fieldDef.referenceCollectionId);
                if (!targetCollection) return;

                const targetTableName = this.sanitizeIdentifier(targetCollection.name);
                const aliasName = this.sanitizeIdentifier(includeField);

                // Batch 2.8: M:N Support
                if (fieldDef.relationType === 'many-to-many') {
                    // Subquery approach:
                    // (SELECT json_agg(t) FROM (SELECT * FROM target JOIN junction ON target.id = junction.target_id WHERE junction.source_id = main.id) t) as fieldName

                    const junctionTable = `junction_${tableName}_${targetTableName}_${this.sanitizeIdentifier(fieldDef.name)}`;
                    // Assuming columns: source_id, target_id.
                    // But naming convention in SchemaTranslator was: tableName_id, targetTableName_id
                    const sourceCol = `${tableName}_id`;
                    const targetCol = `${targetTableName}_id`;

                    const subQuery = `
                        (SELECT json_agg(sub) 
                         FROM (
                            SELECT t.* 
                            FROM "${targetTableName}" t
                            JOIN "${junctionTable}" j ON t.id = j."${targetCol}"
                            WHERE j."${sourceCol}" = ${mainAlias}.id
                         ) sub
                        ) as "${aliasName}"
                     `;
                    selectFields.push(subQuery);

                } else {
                    // One-to-One / One-to-Many (Single Reference)
                    const alias = `j${index}`;
                    const fkColumn = this.sanitizeIdentifier(fieldDef.name); // foreign key in t1 (e.g., author_id)

                    // Add Join
                    joinClauses.push(`LEFT JOIN "${targetTableName}" ${alias} ON ${mainAlias}."${fkColumn}" = ${alias}.id`);

                    // Add to Select as nested JSON
                    selectFields.push(`row_to_json(${alias}.*) as "${aliasName}"`);
                }
            });
        }

        let query = `SELECT ${selectFields.join(', ')} FROM "${tableName}" ${mainAlias} `;

        if (joinClauses.length > 0) {
            query += ` ${joinClauses.join(' ')} `;
        }

        if (options.filters && options.filters.length > 0) {
            const filterClauses = options.filters.map(f => {
                const field = this.sanitizeIdentifier(f.field);
                const val = this.escapeValue(f.value);

                // TODO: Support filtering on joined fields (e.g. author.name)
                // For now, assume filters are on main table

                switch (f.operator) {
                    case 'equals': return `${mainAlias}."${field}" = ${val} `;
                    case 'contains':
                        return `${mainAlias}."${field}" ILIKE '%${String(f.value).replace(/'/g, "''")}%'`;
                    case 'gt': return `${mainAlias}."${field}" > ${val}`;
                    case 'lt': return `${mainAlias}."${field}" < ${val}`;
                    case 'in':
                        if (Array.isArray(f.value)) {
                            const vals = f.value.map(v => this.escapeValue(v)).join(', ');
                            return `${mainAlias}."${field}" IN (${vals})`;
                        }
                        return '1=1';
                    default: return '1=1';
                }
            });
            query += ` WHERE ${filterClauses.join(' AND ')}`;
        }

        if (options.sort) {
            const field = this.sanitizeIdentifier(options.sort.field);
            const dir = options.sort.direction === 'desc' ? 'DESC' : 'ASC';
            query += ` ORDER BY ${mainAlias}."${field}" ${dir}`;
        }

        if (options.limit && options.limit > 0) {
            query += ` LIMIT ${Number(options.limit)}`;
        }

        if (options.offset && options.offset >= 0) {
            query += ` OFFSET ${Number(options.offset)}`;
        }

        return query + ';';
    }

    /**
     * Sanitizes table and column names to prevent injection.
     */
    private static sanitizeIdentifier(name: string): string {
        return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    }

    /**
     * Escapes values to prevent SQL injection.
     */
    private static escapeValue(value: any): string {
        if (value === null || value === undefined) return 'NULL';
        if (typeof value === 'number') return String(value);
        if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
        return `'${String(value).replace(/'/g, "''")}'`;
    }
}

