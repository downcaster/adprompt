/**
 * @file Data helpers for user persistence.
 */

import { pool } from './index.js';

export const ensureUser = async (
  id: string,
  email: string,
): Promise<void> => {
  await pool.query(
    `INSERT INTO users (id, email)
     VALUES ($1, $2)
     ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email`,
    [id, email],
  );
};
