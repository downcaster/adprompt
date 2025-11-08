/**
 * @file Data-access helpers for campaign brief persistence.
 */

import { pool } from './index.js';
import type { CampaignBrief } from '../types/scorecard.js';

const mapRowToCampaign = (row: any): CampaignBrief => ({
  id: row.id,
  brandKitId: row.brand_kit_id,
  productDescription: row.product_description,
  audience: row.audience,
  callToAction: row.call_to_action,
  toneKeywords: row.tone_keywords ?? [],
  productImagePath: row.product_image_path,
  additionalAssets: row.additional_assets ?? undefined,
  regenLimit: row.regen_limit,
  createdAt: row.created_at.toISOString(),
});

export interface CreateCampaignInput {
  id: string;
  brandKitId: string;
  productDescription: string;
  audience: string;
  callToAction: string;
  toneKeywords: string[];
  productImagePath: string;
  additionalAssets?: string[];
  regenLimit: number;
}

export const createCampaign = async (
  input: CreateCampaignInput,
): Promise<CampaignBrief> => {
  const {
    id,
    brandKitId,
    productDescription,
    audience,
    callToAction,
    toneKeywords,
    productImagePath,
    additionalAssets,
    regenLimit,
  } = input;

  const { rows } = await pool.query(
    `INSERT INTO campaign_briefs (
      id,
      brand_kit_id,
      product_description,
      audience,
      call_to_action,
      tone_keywords,
      product_image_path,
      additional_assets,
      regen_limit
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *`,
    [
      id,
      brandKitId,
      productDescription,
      audience,
      callToAction,
      toneKeywords,
      productImagePath,
      additionalAssets ?? null,
      regenLimit,
    ],
  );

  return mapRowToCampaign(rows[0]);
};

export const listCampaignsForBrand = async (
  brandKitId: string,
): Promise<CampaignBrief[]> => {
  const { rows } = await pool.query(
    'SELECT * FROM campaign_briefs WHERE brand_kit_id = $1 ORDER BY created_at DESC',
    [brandKitId],
  );

  return rows.map(mapRowToCampaign);
};

export const getCampaignById = async (
  id: string,
): Promise<CampaignBrief | null> => {
  const { rows } = await pool.query(
    'SELECT * FROM campaign_briefs WHERE id = $1 LIMIT 1',
    [id],
  );

  if (rows.length === 0) {
    return null;
  }

  return mapRowToCampaign(rows[0]);
};
