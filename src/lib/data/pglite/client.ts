import { PGlite } from '@electric-sql/pglite';
import { db as databaseService } from '../../db/database';

export async function getDB(): Promise<PGlite> {
    await databaseService.init();
    return databaseService.getDB();
}
