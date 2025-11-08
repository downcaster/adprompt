/**
 * @file Business logic for creating campaign briefs tied to a brand kit.
 */

import path from 'node:path';
import type { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getBrandKitById } from '../db/brandKits.js';
import { createCampaign } from '../db/campaigns.js';
import type { CampaignBrief } from '../types/scorecard.js';
import { env } from '../config/env.js';

const parseToneKeywords = (raw?: string): string[] => {
  if (!raw) {
    return [];
  }

  return raw
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);
};

export const createCampaignBrief = async (
  request: Request,
): Promise<CampaignBrief> => {
  const { brandKitId, productDescription, audience, callToAction, toneKeywords, regenLimit } =
    request.body ?? {};

  const ownerId = request.headers['x-user-id'];
  if (!ownerId || typeof ownerId !== 'string') {
    throw new Error('Missing required header: X-User-Id');
  }

  if (!brandKitId) {
    throw new Error('brandKitId is required');
  }
  const brandKit = await getBrandKitById(ownerId, brandKitId);
  if (!brandKit) {
    throw new Error('Brand kit not found or unauthorized');
  }

  if (!productDescription || !audience || !callToAction) {
    throw new Error('productDescription, audience, and callToAction are required fields');
  }

  const files = request.files as Record<string, Express.Multer.File[]> | undefined;
  const productImage = files?.product?.[0];

  if (!productImage) {
    throw new Error('Product image is required');
  }

  const regen = regenLimit ? Number.parseInt(regenLimit, 10) : env.defaultRegenLimit;
  if (!Number.isFinite(regen) || regen <= 0) {
    throw new Error('regenLimit must be a positive integer');
  }

  const additionalAssets = files?.assets?.map((file) => path.relative(process.cwd(), file.path));

  const campaign = await createCampaign({
    id: uuidv4(),
    brandKitId,
    productDescription,
    audience,
    callToAction,
    toneKeywords: parseToneKeywords(toneKeywords),
    productImagePath: path.relative(process.cwd(), productImage.path),
    additionalAssets,
    regenLimit: regen,
  });

  return campaign;
};
