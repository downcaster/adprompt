/**
 * @file Data-access helpers for brand kit persistence.
 */

import { pool } from './index.js';
import type { BrandKit } from '../types/scorecard.js';

const mapRowToBrandKit = (row: any): BrandKit => ({
  id: row.id,
  ownerId: row.owner_id,
  name: row.name,
  logoPath: row.logo_path ?? undefined,
  paletteAssetPath: row.palette_asset_path ?? undefined,
  derivedPaletteHex: row.derived_palette_hex ?? undefined,
  toneDescription: row.tone_description ?? undefined,
  prohibitedPhrases: row.prohibited_phrases ?? undefined,
  targetAudience: row.target_audience ?? undefined,
  primaryCallToAction: row.primary_call_to_action ?? undefined,
  createdAt: row.created_at.toISOString(),
});

export interface CreateBrandKitInput {
  id: string;
  ownerId: string;
  name: string;
  logoPath?: string;
  paletteAssetPath?: string;
  derivedPaletteHex?: string[];
  toneDescription?: string;
  prohibitedPhrases?: string[];
  targetAudience?: string;
  primaryCallToAction?: string;
}

export const createBrandKit = async (
  input: CreateBrandKitInput,
): Promise<BrandKit> => {
  const {
    id,
    ownerId,
    name,
    logoPath,
    paletteAssetPath,
    derivedPaletteHex,
    toneDescription,
    prohibitedPhrases,
    targetAudience,
    primaryCallToAction,
  } = input;

  const { rows } = await pool.query(
    `INSERT INTO brand_kits (
      id,
      owner_id,
      name,
      logo_path,
      palette_asset_path,
      derived_palette_hex,
      tone_description,
      prohibited_phrases,
      target_audience,
      primary_call_to_action
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *`,
    [
      id,
      ownerId,
      name,
      logoPath ?? null,
      paletteAssetPath ?? null,
      derivedPaletteHex ?? null,
      toneDescription ?? null,
      prohibitedPhrases ?? null,
      targetAudience ?? null,
      primaryCallToAction ?? null,
    ],
  );

  return mapRowToBrandKit(rows[0]);
};

export const listBrandKitsByOwner = async (
  ownerId: string,
): Promise<BrandKit[]> => {
  const { rows } = await pool.query(
    'SELECT * FROM brand_kits WHERE owner_id = $1 ORDER BY created_at DESC',
    [ownerId],
  );
  return rows.map(mapRowToBrandKit);
};

export const getBrandKitById = async (
  ownerId: string,
  id: string,
): Promise<BrandKit | null> => {
  const { rows } = await pool.query(
    'SELECT * FROM brand_kits WHERE id = $1 AND owner_id = $2 LIMIT 1',
    [id, ownerId],
  );

  if (rows.length === 0) {
    return null;
  }

  return mapRowToBrandKit(rows[0]);
};
