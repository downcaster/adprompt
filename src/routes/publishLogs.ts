/**
 * @file Routes for recording publish events for generated ads.
 */

import express from 'express';
import { getBrandKitById } from '../db/brandKits.js';
import { getCampaignById } from '../db/campaigns.js';
import { createPublishLog, listPublishLogsForCampaign } from '../db/publishLogs.js';

export const publishLogRouter = express.Router();

publishLogRouter.post('/', async (request, response, next) => {
  try {
    const ownerId = request.headers['x-user-id'];
    if (!ownerId || typeof ownerId !== 'string') {
      response.status(400).json({ error: 'Missing required header: X-User-Id' });
      return;
    }

    const { brandKitId, campaignId, scorecardId, platform, status, externalId, externalUrl, metadata } =
      request.body ?? {};

    if (!brandKitId || !campaignId || !platform || !status) {
      response.status(400).json({ error: 'brandKitId, campaignId, platform, and status are required' });
      return;
    }

    const brand = await getBrandKitById(ownerId, brandKitId);
    if (!brand) {
      response.status(403).json({ error: 'Forbidden' });
      return;
    }

    const campaign = await getCampaignById(campaignId);
    if (!campaign || campaign.brandKitId !== brand.id) {
      response.status(404).json({ error: 'Campaign not found or mismatched brand kit' });
      return;
    }

    const log = await createPublishLog({
      brandKitId,
      campaignId,
      scorecardId,
      platform,
      status,
      externalId,
      externalUrl,
      metadata,
    });

    response.status(201).json(log);
  } catch (error) {
    next(error);
  }
});

publishLogRouter.get('/', async (request, response, next) => {
  try {
    const ownerId = request.headers['x-user-id'];
    if (!ownerId || typeof ownerId !== 'string') {
      response.status(400).json({ error: 'Missing required header: X-User-Id' });
      return;
    }

    const { campaignId } = request.query;
    if (!campaignId || typeof campaignId !== 'string') {
      response.status(400).json({ error: 'campaignId query parameter is required' });
      return;
    }

    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      response.status(404).json({ error: 'Campaign not found' });
      return;
    }

    const brand = await getBrandKitById(ownerId, campaign.brandKitId);
    if (!brand) {
      response.status(403).json({ error: 'Forbidden' });
      return;
    }

    const logs = await listPublishLogsForCampaign(campaignId);
    response.json(logs);
  } catch (error) {
    next(error);
  }
});
