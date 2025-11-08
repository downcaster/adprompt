/**
 * @file Bootstraps the Express server that orchestrates generation and critique flows.
 */

import express from 'express';
import path from 'node:path';
import { env } from './config/env.js';
import { router } from './routes/index.js';
import { ensureSchema } from './db/schema.js';

/**
 * Creates a configured Express application.
 */
export const createApp = () => {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  const uploadsPath = path.resolve(process.cwd(), env.uploadDir);
  app.use('/uploads', express.static(uploadsPath));

  app.use('/api', router);

  return app;
};

const bootstrap = async () => {
  await ensureSchema();

  const app = createApp();

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console -- CLI visibility for local dev.
    console.log(`BrandAI critique service listening on port ${env.port}`);
  });
};

void bootstrap();
