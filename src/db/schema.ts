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
    )`,
  `CREATE TABLE IF NOT EXISTS scorecards (
      id UUID PRIMARY KEY,
      brand_kit_id UUID NOT NULL REFERENCES brand_kits(id) ON DELETE CASCADE,
      campaign_id UUID NOT NULL REFERENCES campaign_briefs(id) ON DELETE CASCADE,
      iteration INTEGER NOT NULL,
      overall_status TEXT NOT NULL,
      scorecard JSONB NOT NULL,
      video_path TEXT NOT NULL,
      video_url TEXT NOT NULL,
      caption TEXT,
      frame_paths TEXT[],
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  `CREATE TABLE IF NOT EXISTS publish_logs (
      id UUID PRIMARY KEY,
      brand_kit_id UUID NOT NULL REFERENCES brand_kits(id) ON DELETE CASCADE,
      campaign_id UUID NOT NULL REFERENCES campaign_briefs(id) ON DELETE CASCADE,
      scorecard_id UUID REFERENCES scorecards(id) ON DELETE SET NULL,
      platform TEXT NOT NULL,
      status TEXT NOT NULL,
      external_id TEXT,
      external_url TEXT,
      metadata JSONB,
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
  
  // Add caption column to scorecards if it doesn't exist (migration)
  await pool.query(`
    ALTER TABLE scorecards 
    ADD COLUMN IF NOT EXISTS caption TEXT
  `);
  
  // Add frame_paths column to scorecards if it doesn't exist (migration)
  await pool.query(`
    ALTER TABLE scorecards 
    ADD COLUMN IF NOT EXISTS frame_paths TEXT[]
  `);
};
