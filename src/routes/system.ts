/**
 * @file System-level routes such as health checks.
 */

import type { Router } from 'express';

/**
 * Registers system routes for diagnostics and health checks.
 */
export const registerSystemRoutes = (router: Router): void => {
  router.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });
};
