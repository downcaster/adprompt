import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for API integration tests.
 * These tests make real API calls and consume quota.
 */
export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
    },
    // Only include e2e tests
    include: ['tests/e2e/**/*.test.ts'],
  },
});

