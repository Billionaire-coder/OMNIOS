
import { PGlite } from '@electric-sql/pglite';

import { User } from '@/types/designer';

export const AUTH_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT DEFAULT 'viewer',
    created_at BIGINT DEFAULT (extract(epoch from now()) * 1000)
);
`;

export class AuthService {
    private db: PGlite | null = null;

    attach(db: PGlite) {
        this.db = db;
    }

    async init() {
        if (!this.db) return;
        await this.db.exec(AUTH_SCHEMA_SQL);
    }

    async signUp(email: string, password: string): Promise<User> {
        if (!this.db) throw new Error('DB not ready');

        // check if user exists
        const existing = await this.db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            throw new Error('User already exists');
        }

        const salt = this.generateSalt();
        const hash = await this.hashPassword(password, salt);
        const id = crypto.randomUUID();
        const role = 'editor'; // Default to editor for now

        await this.db.query(
            'INSERT INTO users (id, email, password_hash, salt, role) VALUES ($1, $2, $3, $4, $5)',
            [id, email, hash, salt, role]
        );

        return { id, email, role, createdAt: Date.now(), metadata: {} };
    }

    async login(email: string, password: string): Promise<User> {
        if (!this.db) throw new Error('DB not ready');

        const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            throw new Error('Invalid credentials');
        }

        const userRow = result.rows[0] as any;
        const hash = await this.hashPassword(password, userRow.salt);

        if (hash !== userRow.password_hash) {
            throw new Error('Invalid credentials');
        }

        return {
            id: userRow.id,
            email: userRow.email,
            role: userRow.role as any,
            createdAt: Number(userRow.created_at),
            metadata: {}
        };
    }

    private generateSalt(): string {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    private async hashPassword(password: string, salt: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

export const authService = new AuthService();
