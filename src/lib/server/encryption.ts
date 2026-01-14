import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Server-side encryption utility.
 * Requires process.env.MASTER_KEY to be set (32-byte hex string).
 */
export class EncryptionService {
    private static getKey(): Buffer {
        const masterKey = process.env.MASTER_KEY;
        if (!masterKey) {
            throw new Error('FATAL: MASTER_KEY is not set in environment variables.');
        }
        if (masterKey.length !== 64) { // 32 bytes = 64 hex chars
            // Fallback for dev if user put a short string, but warn
            if (process.env.NODE_ENV === 'development') {
                console.warn('[Security] MASTER_KEY is not 32 bytes. Padding for dev.');
                return crypto.scryptSync(masterKey, 'salt', 32);
            }
            throw new Error('FATAL: MASTER_KEY must be a 64-character hex string (32 bytes).');
        }
        return Buffer.from(masterKey, 'hex');
    }

    static encrypt(text: string): string {
        const key = this.getKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const tag = cipher.getAuthTag();

        // Format: iv:tag:encrypted
        return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
    }

    static decrypt(encryptedText: string): string {
        const key = this.getKey();
        const [ivHex, tagHex, contentHex] = encryptedText.split(':');

        if (!ivHex || !tagHex || !contentHex) {
            throw new Error('Invalid encrypted format');
        }

        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

        decipher.setAuthTag(tag);

        let decrypted = decipher.update(contentHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}
