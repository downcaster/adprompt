/**
 * @file Routes for retrieving persisted critique scorecards.
 */

import express from 'express';
import { getBrandKitById } from '../db/brandKits.js';
import { getCampaignById } from '../db/campaigns.js';
import {
  getScorecardById,
  listScorecardsByBrand,
  listScorecardsByCampaign,
} from '../db/scorecards.js';

export const scorecardRouter = express.Router();

scorecardRouter.get('/', async (request, response, next) => {
  try {
    const ownerId = request.headers['x-user-id'];
    if (!ownerId || typeof ownerId !== 'string') {
      response.status(400).json({ error: 'Missing required header: X-User-Id' });
      return;
    }

    const { brandKitId, campaignId } = request.query;

    if (campaignId && typeof campaignId === 'string') {
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

      const scorecards = await listScorecardsByCampaign(campaignId);
      response.json(scorecards);
      return;
    }

    if (brandKitId && typeof brandKitId === 'string') {
      const brand = await getBrandKitById(ownerId, brandKitId);
      if (!brand) {
        response.status(404).json({ error: 'Brand kit not found' });
        return;
      }

      const scorecards = await listScorecardsByBrand(brandKitId);
      response.json(scorecards);
      return;
    }

    response.status(400).json({ error: 'brandKitId or campaignId query parameter is required' });
  } catch (error) {
    next(error);
  }
});

scorecardRouter.get('/:scorecardId', async (request, response, next) => {
  try {
    const ownerId = request.headers['x-user-id'];
    if (!ownerId || typeof ownerId !== 'string') {
      response.status(400).json({ error: 'Missing required header: X-User-Id' });
      return;
    }

    const { scorecardId } = request.params;
    const scorecard = await getScorecardById(scorecardId);
    if (!scorecard) {
      response.status(404).json({ error: 'Scorecard not found' });
      return;
    }

    const brand = await getBrandKitById(ownerId, scorecard.brandKitId);
    if (!brand) {
      response.status(403).json({ error: 'Forbidden' });
      return;
    }

    response.json(scorecard);
  } catch (error) {
    next(error);
  }
});
