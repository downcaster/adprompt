/**
 * @file Database schema bootstrap ensuring required tables exist.
 */

import { pool } from './index.js';

const bootstrapStatements = [
  `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  `CREATE TABLE IF NOT EXISTS brand_kits (
      id UUID PRIMARY KEY,
      owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      logo_path TEXT,
      palette_asset_path TEXT,
      derived_palette_hex TEXT[],
      tone_description TEXT,
      prohibited_phrases TEXT[],
      target_audience TEXT,
      primary_call_to_action TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  `CREATE TABLE IF NOT EXISTS campaign_briefs (
      id UUID PRIMARY KEY,
      brand_kit_id UUID NOT NULL REFERENCES brand_kits(id) ON DELETE CASCADE,
      product_description TEXT NOT NULL,
      audience TEXT NOT NULL,
      call_to_action TEXT NOT NULL,
      tone_keywords TEXT[] NOT NULL,
      product_image_path TEXT NOT NULL,
      additional_assets TEXT[],
      regen_limit INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
];

/**
 * Ensures that core tables exist before processing requests.
 */
export const ensureSchema = async (): Promise<void> => {
  for (const statement of bootstrapStatements) {
    await pool.query(statement);
  }
};
