/**
 * @file Aggregates Express route registrations.
 */

import { Router } from 'express';
import { registerSystemRoutes } from './system.js';
import { brandRouter } from './brand.js';

export const router = Router();

registerSystemRoutes(router);
router.use('/brand-kits', brandRouter);
