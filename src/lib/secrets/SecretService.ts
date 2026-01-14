
import { PGlite } from '@electric-sql/pglite';
import { Environment, Secret } from '../../types/designer';

export const SECRETS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS environments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    projects TEXT,
    created_at BIGINT DEFAULT (extract(epoch from now()) * 1000)
);

CREATE TABLE IF NOT EXISTS secrets (
    id TEXT PRIMARY KEY,
    env_id TEXT NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    encrypted_value TEXT NOT NULL,
    iv TEXT NOT NULL,
    created_at BIGINT DEFAULT (extract(epoch from now()) * 1000),
    UNIQUE(env_id, key_name)
);
`;

export class SecretService {
    private db: PGlite | null = null;
    private masterKey: CryptoKey | null = null;

    attach(db: PGlite) {
        this.db = db;
    }

    async init() {
        if (!this.db) return;
        await this.db.exec(SECRETS_SCHEMA_SQL);
        // Ensure default 'dev' environment
        const existing = await this.db.query("SELECT id FROM environments WHERE slug = 'dev'");
        if (existing.rows.length === 0) {
            await this.createEnvironment('Development', 'dev');
        }
        await this.initMasterKey(); // In production, this would come from UserAuth
    }

    // Temporary Master Key Generation (Persisted for Client Session)
    // In real implementation, this should be derived from persistent user credentials
    private async initMasterKey() {
        const storedKey = localStorage.getItem('omnios_mk');
        if (storedKey) {
            const jwk = JSON.parse(storedKey);
            this.masterKey = await crypto.subtle.importKey(
                'jwk',
                jwk,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
        } else {
            this.masterKey = await crypto.subtle.generateKey(
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
            const jwk = await crypto.subtle.exportKey('jwk', this.masterKey);
            localStorage.setItem('omnios_mk', JSON.stringify(jwk));
        }
    }

    async createEnvironment(name: string, slug: string): Promise<Environment> {
        if (!this.db) throw new Error('DB not ready');
        const id = crypto.randomUUID();
        await this.db.query(
            'INSERT INTO environments (id, name, slug) VALUES ($1, $2, $3)',
            [id, name, slug]
        );
        return { id, name, slug };
    }

    async getEnvironments(): Promise<Environment[]> {
        if (!this.db) return [];
        const res = await this.db.query('SELECT * FROM environments ORDER BY created_at ASC');
        return res.rows.map((row: any) => ({
            id: row.id,
            name: row.name,
            slug: row.slug
        }));
    }

    async setSecret(envId: string, keyName: string, value: string) {
        if (!this.db || !this.masterKey) throw new Error('Not ready');

        const encoder = new TextEncoder();
        const data = encoder.encode(value);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            this.masterKey,
            data
        );

        const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
        const encryptedHex = Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('');

        const id = crypto.randomUUID();
        await this.db.query(`
            INSERT INTO secrets (id, env_id, key_name, encrypted_value, iv)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (env_id, key_name) 
            DO UPDATE SET encrypted_value = EXCLUDED.encrypted_value, iv = EXCLUDED.iv
        `, [id, envId, keyName, encryptedHex, ivHex]);
    }

    async getSecret(envId: string, keyName: string): Promise<string | null> {
        if (!this.db || !this.masterKey) return null;

        const res = await this.db.query(
            'SELECT encrypted_value, iv FROM secrets WHERE env_id = $1 AND key_name = $2',
            [envId, keyName]
        );

        if (res.rows.length === 0) return null;
        const row = res.rows[0] as any;

        const iv = new Uint8Array(row.iv.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
        const encrypted = new Uint8Array(row.encrypted_value.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));

        try {
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                this.masterKey,
                encrypted
            );
            return new TextDecoder().decode(decrypted);
        } catch (e) {
            console.error("Failed to decrypt", keyName);
            return null;
        }
    }

    async listSecrets(envId: string): Promise<Secret[]> {
        if (!this.db) return [];
        const res = await this.db.query('SELECT id, env_id, key_name, created_at FROM secrets WHERE env_id = $1', [envId]);
        return res.rows.map((row: any) => ({
            id: row.id,
            envId: row.env_id,
            keyName: row.key_name,
            createdAt: Number(row.created_at)
        }));
    }
}

export const secretService = new SecretService();
