/**
 * @file Routes for managing campaign briefs.
 */

import express from 'express';
import { getBrandKitById } from '../db/brandKits.js';
import { listCampaignsForBrand, getCampaignById } from '../db/campaigns.js';
import { createCampaignBrief } from '../services/campaignService.js';
import { createDiskUpload } from '../utils/uploads.js';

export const campaignRouter = express.Router();
const upload = createDiskUpload();

campaignRouter.get('/', async (request, response, next) => {
  try {
    const { brandKitId } = request.query;
    if (!brandKitId || typeof brandKitId !== 'string') {
      response.status(400).json({ error: 'brandKitId query parameter is required' });
      return;
    }

    const ownerId = request.headers['x-user-id'];
    if (!ownerId || typeof ownerId !== 'string') {
      response.status(400).json({ error: 'Missing required header: X-User-Id' });
      return;
    }

    const kit = await getBrandKitById(ownerId, brandKitId);
    if (!kit) {
      response.status(404).json({ error: 'Brand kit not found' });
      return;
    }

    const campaigns = await listCampaignsForBrand(brandKitId);
    response.json(campaigns);
  } catch (error) {
    next(error);
  }
});

campaignRouter.get('/:campaignId', async (request, response, next) => {
  try {
    const { campaignId } = request.params;
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      response.status(404).json({ error: 'Campaign not found' });
      return;
    }

    response.json(campaign);
  } catch (error) {
    next(error);
  }
});

campaignRouter.post(
  '/',
  upload.fields([
    { name: 'product', maxCount: 1 },
    { name: 'assets', maxCount: 5 },
  ]),
  async (request, response, next) => {
    try {
      const campaign = await createCampaignBrief(request);
      response.status(201).json(campaign);
    } catch (error) {
      next(error);
    }
  },
);
