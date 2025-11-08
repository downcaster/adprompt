/**
 * @file Data-access helpers for publish event logging.
 */

import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { pool } from './index.js';
import type { PublishLogRecord } from '../types/scorecard.js';

const publishLogRowSchema = z.object({
  id: z.string().uuid(),
  brand_kit_id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  scorecard_id: z.string().uuid().nullable(),
  platform: z.string(),
  status: z.string(),
  external_id: z.string().nullable(),
  external_url: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  created_at: z.instanceof(Date),
});

const mapRowToPublishLog = (row: unknown): PublishLogRecord => {
  const parsed = publishLogRowSchema.parse(row);
  return {
    id: parsed.id,
    brandKitId: parsed.brand_kit_id,
    campaignId: parsed.campaign_id,
    scorecardId: parsed.scorecard_id ?? undefined,
    platform: parsed.platform,
    status: parsed.status,
    externalId: parsed.external_id ?? undefined,
    externalUrl: parsed.external_url ?? undefined,
    metadata: parsed.metadata ?? undefined,
    createdAt: parsed.created_at.toISOString(),
  };
};

export interface CreatePublishLogInput {
  brandKitId: string;
  campaignId: string;
  scorecardId?: string;
  platform: string;
  status: string;
  externalId?: string;
  externalUrl?: string;
  metadata?: Record<string, unknown>;
}

export const createPublishLog = async (
  input: CreatePublishLogInput,
): Promise<PublishLogRecord> => {
  const id = uuidv4();

  const { rows } = await pool.query(
    `INSERT INTO publish_logs (
      id,
      brand_kit_id,
      campaign_id,
      scorecard_id,
      platform,
      status,
      external_id,
      external_url,
      metadata
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *`,
    [
      id,
      input.brandKitId,
      input.campaignId,
      input.scorecardId ?? null,
      input.platform,
      input.status,
      input.externalId ?? null,
      input.externalUrl ?? null,
      input.metadata ?? null,
    ],
  );

  return mapRowToPublishLog(rows[0]);
};

export const listPublishLogsForCampaign = async (
  campaignId: string,
): Promise<PublishLogRecord[]> => {
  const { rows } = await pool.query(
    'SELECT * FROM publish_logs WHERE campaign_id = $1 ORDER BY created_at DESC',
    [campaignId],
  );

  return rows.map(mapRowToPublishLog);
};
