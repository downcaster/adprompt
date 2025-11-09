/**
 * @file Business logic for creating campaign briefs tied to a brand kit.
 */

import path from 'node:path';
import type { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getBrandKitById } from '../db/brandKits.js';
import { createCampaign, updateCampaign } from '../db/campaigns.js';
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
  campaignId?: string,
): Promise<CampaignBrief> => {
  const { brandKitId, productDescription, audience, callToAction, toneKeywords, regenLimit } =
    request.body ?? {};

  const ownerId = request.headers['x-user-id'];
  if (!ownerId || typeof ownerId !== 'string') {
    throw new Error('Missing required header: X-User-Id');
  }

  // If updating, get the existing campaign to use its brandKitId if not provided
  let existingCampaign: CampaignBrief | null = null;
  if (campaignId) {
    const { getCampaignById } = await import('../db/campaigns.js');
    existingCampaign = await getCampaignById(campaignId);
    if (!existingCampaign) {
      throw new Error('Campaign not found');
    }
  }

  const finalBrandKitId = brandKitId || existingCampaign?.brandKitId;
  if (!finalBrandKitId) {
    throw new Error('brandKitId is required');
  }
  
  const brandKit = await getBrandKitById(ownerId, finalBrandKitId);
  if (!brandKit) {
    throw new Error('Brand kit not found or unauthorized');
  }

  if (!productDescription || !audience || !callToAction) {
    throw new Error('productDescription, audience, and callToAction are required fields');
  }

  const files = request.files as Record<string, Express.Multer.File[]> | undefined;
  const productImage = files?.product?.[0];

  // Product image is required only for new campaigns, optional for updates
  if (!productImage && !campaignId) {
    throw new Error('Product image is required');
  }
  
  // Use existing product image if not uploading a new one
  const productImagePath = productImage 
    ? path.relative(process.cwd(), productImage.path)
    : existingCampaign?.productImagePath;
  
  if (!productImagePath) {
    throw new Error('Product image is required');
  }

  const regen = regenLimit ? Number.parseInt(regenLimit, 10) : env.defaultRegenLimit;
  if (!Number.isFinite(regen) || regen <= 0) {
    throw new Error('regenLimit must be a positive integer');
  }

  const additionalAssets = files?.assets?.map((file) => path.relative(process.cwd(), file.path));

  const campaignData = {
    id: campaignId || uuidv4(),
    brandKitId: finalBrandKitId,
    productDescription,
    audience,
    callToAction,
    toneKeywords: parseToneKeywords(toneKeywords),
    productImagePath,
    additionalAssets,
    regenLimit: regen,
  };

  // If campaignId is provided, update; otherwise create
  if (campaignId) {
    return await updateCampaign(campaignId, campaignData);
  }

  return await createCampaign(campaignData);
};
