/**
 * @file Data-access helpers for persisted critique scorecards.
 */

import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { pool } from './index.js';
import type { AgentStatus, Scorecard, ScorecardRecord } from '../types/scorecard.js';
import { agentScoreSchema } from '../services/critique/scoreAggregator.js';

const scorecardSchema = z.object({
  assetUrl: z.string(),
  iterations: z.number(),
  scores: z.array(agentScoreSchema),
  overallStatus: z.enum(['pass', 'fail']),
  createdAt: z.string(),
});

const scorecardRowSchema = z.object({
  id: z.string().uuid(),
  brand_kit_id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  iteration: z.number(),
  overall_status: z.enum(['pass', 'fail']),
  scorecard: scorecardSchema,
  video_path: z.string(),
  video_url: z.string(),
  created_at: z.instanceof(Date),
});

const mapRowToScorecardRecord = (row: unknown): ScorecardRecord => {
  const parsed = scorecardRowSchema.parse(row);
  return {
    id: parsed.id,
    brandKitId: parsed.brand_kit_id,
    campaignId: parsed.campaign_id,
    iteration: parsed.iteration,
    overallStatus: parsed.overall_status,
    scorecard: parsed.scorecard,
    videoPath: parsed.video_path,
    videoUrl: parsed.video_url,
    createdAt: parsed.created_at.toISOString(),
  };
};

export interface CreateScorecardRecordInput {
  brandKitId: string;
  campaignId: string;
  iteration: number;
  overallStatus: AgentStatus;
  scorecard: Scorecard;
  videoPath: string;
  videoUrl: string;
}

export const createScorecardRecord = async (
  input: CreateScorecardRecordInput,
): Promise<ScorecardRecord> => {
  const id = uuidv4();

  const { rows } = await pool.query(
    `INSERT INTO scorecards (
      id,
      brand_kit_id,
      campaign_id,
      iteration,
      overall_status,
      scorecard,
      video_path,
      video_url
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *`,
    [
      id,
      input.brandKitId,
      input.campaignId,
      input.iteration,
      input.overallStatus,
      input.scorecard,
      input.videoPath,
      input.videoUrl,
    ],
  );

  return mapRowToScorecardRecord(rows[0]);
};

export const listScorecardsByCampaign = async (
  campaignId: string,
): Promise<ScorecardRecord[]> => {
  const { rows } = await pool.query(
    'SELECT * FROM scorecards WHERE campaign_id = $1 ORDER BY created_at DESC',
    [campaignId],
  );

  return rows.map(mapRowToScorecardRecord);
};

export const listScorecardsByBrand = async (
  brandKitId: string,
): Promise<ScorecardRecord[]> => {
  const { rows } = await pool.query(
    'SELECT * FROM scorecards WHERE brand_kit_id = $1 ORDER BY created_at DESC',
    [brandKitId],
  );

  return rows.map(mapRowToScorecardRecord);
};

export const getScorecardById = async (
  id: string,
): Promise<ScorecardRecord | null> => {
  const { rows } = await pool.query(
    'SELECT * FROM scorecards WHERE id = $1 LIMIT 1',
    [id],
  );

  if (rows.length === 0) {
    return null;
  }

  return mapRowToScorecardRecord(rows[0]);
};
