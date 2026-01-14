export const SYNC_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS _oplog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    row_id TEXT NOT NULL,
    op_type TEXT NOT NULL,
    changes JSONB NOT NULL,
    timestamp BIGINT NOT NULL,
    synced BOOLEAN DEFAULT FALSE
);

CREATE OR REPLACE FUNCTION log_change() RETURNS TRIGGER AS $$
DECLARE
    row_data JSONB;
    pk_value TEXT;
BEGIN
    -- Determine operation type and data
    IF (TG_OP = 'DELETE') THEN
        row_data := to_jsonb(OLD);
    ELSE
        row_data := to_jsonb(NEW);
    END IF;

    -- Assumption: id is the primary key and is text or uuid castable to text
    -- In OMNIOS, we use 'id' UUID/TEXT for everything.
    pk_value := row_data->>'id';

    INSERT INTO _oplog (table_name, row_id, op_type, changes, timestamp)
    VALUES (TG_TABLE_NAME, pk_value, TG_OP, row_data, (extract(epoch from now()) * 1000)::bigint);

    RETURN NULL; -- Result is ignored since this is an AFTER trigger
END;
$$ LANGUAGE plpgsql;
`;

export const getTriggerSQL = (tableName: string) => `
    DROP TRIGGER IF EXISTS trigger_log_change_${tableName} ON "${tableName}";
    CREATE TRIGGER trigger_log_change_${tableName}
    AFTER INSERT OR UPDATE OR DELETE ON "${tableName}"
    FOR EACH ROW EXECUTE FUNCTION log_change();
`;
