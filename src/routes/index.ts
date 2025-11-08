/**
 * @file Aggregates Express route registrations.
 */

import { Router } from 'express';
import { registerSystemRoutes } from './system.js';
import { brandRouter } from './brand.js';
import { campaignRouter } from './campaign.js';
import { generationRouter } from './generation.js';
import { scorecardRouter } from './scorecards.js';
import { publishLogRouter } from './publishLogs.js';

export const router = Router();

registerSystemRoutes(router);
router.use('/brand-kits', brandRouter);
router.use('/campaigns', campaignRouter);
router.use('/generation', generationRouter);
router.use('/scorecards', scorecardRouter);
router.use('/publish-logs', publishLogRouter);
