/**
 * @file Provides environment configuration loading and validation for the BrandAI stack.
 */

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z
    .string()
    .default('3000')
    .transform((value) => {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error('PORT must be a positive integer');
      }
      return parsed;
    }),
  GOOGLE_API_KEY: z.string().min(1, { message: 'GOOGLE_API_KEY is required' }),
  DATABASE_URL: z.string().min(1, { message: 'DATABASE_URL is required' }),
  UPLOAD_DIR: z.string().default('uploads'),
  TEMP_DIR: z.string().default('tmp'),
  DEFAULT_REGEN_LIMIT: z
    .string()
    .default('5')
    .transform((value) => {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error('DEFAULT_REGEN_LIMIT must be a positive integer');
      }
      return parsed;
    }),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const messages = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Environment configuration invalid:\n${messages}`);
}

/**
 * Strongly typed and validated environment variables for the application.
 */
export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  googleApiKey: parsed.data.GOOGLE_API_KEY,
  databaseUrl: parsed.data.DATABASE_URL,
  uploadDir: parsed.data.UPLOAD_DIR,
  tempDir: parsed.data.TEMP_DIR,
  defaultRegenLimit: parsed.data.DEFAULT_REGEN_LIMIT,
};
