/**
 * @file Exposes a singleton Postgres connection pool for persistence.
 */

import { Pool } from 'pg';
import { env } from '../config/env.js';

export const pool = new Pool({ connectionString: env.databaseUrl });

/**
 * Gracefully closes the pool, useful for tests or shutdown hooks.
 */
export const disconnect = async (): Promise<void> => {
  await pool.end();
};
