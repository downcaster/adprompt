/**
 * @file Routes for managing brand kit ingestion and retrieval.
 */

import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import multer from 'multer';
import { env } from '../config/env.js';
import { listBrandKitsByOwner, getBrandKitById } from '../db/brandKits.js';
import { buildBrandKitPayload } from '../services/brandKitService.js';

const ensureDirectory = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const uploadsDir = path.resolve(process.cwd(), env.uploadDir);
ensureDirectory(uploadsDir);

const storage = multer.diskStorage({
  destination: (
    _request: express.Request,
    _file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void,
  ) => {
    callback(null, uploadsDir);
  },
  filename: (
    _request: express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void,
  ) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.dat';
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

export const brandRouter = express.Router();

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
