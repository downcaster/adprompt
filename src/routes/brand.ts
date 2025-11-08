/**
 * @file Routes for managing brand kit ingestion and retrieval.
 */

import express from 'express';
import { listBrandKitsByOwner, getBrandKitById } from '../db/brandKits.js';
import { buildBrandKitPayload } from '../services/brandKitService.js';
import { createDiskUpload } from '../utils/uploads.js';

export const brandRouter = express.Router();
const upload = createDiskUpload();

brandRouter.get('/', async (request, response, next) => {
  try {
    const ownerId = request.headers['x-user-id'];
    if (!ownerId || typeof ownerId !== 'string') {
      response.status(400).json({ error: 'Missing required header: X-User-Id' });
      return;
    }

    const kits = await listBrandKitsByOwner(ownerId);
    response.json(kits);
  } catch (error) {
    next(error);
  }
});

brandRouter.get('/:brandKitId', async (request, response, next) => {
  try {
    const ownerId = request.headers['x-user-id'];
    if (!ownerId || typeof ownerId !== 'string') {
      response.status(400).json({ error: 'Missing required header: X-User-Id' });
      return;
    }

    const { brandKitId } = request.params;
    const kit = await getBrandKitById(ownerId, brandKitId);
    if (!kit) {
      response.status(404).json({ error: 'Brand kit not found' });
      return;
    }

    response.json(kit);
  } catch (error) {
    next(error);
  }
});

brandRouter.post(
  '/',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'palette', maxCount: 1 },
  ]),
  async (request, response, next) => {
    try {
      const brandKit = await buildBrandKitPayload(request);
      response.status(201).json(brandKit);
    } catch (error) {
      next(error);
    }
  },
);
