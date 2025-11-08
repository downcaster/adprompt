/**
 * @file Shared helpers for configuring multer storage.
 */

import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env.js';

export const ensureUploadsDir = (): string => {
  const uploadsDir = path.resolve(process.cwd(), env.uploadDir);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

export const createDiskUpload = () => {
  const uploadsDir = ensureUploadsDir();

  const storage = multer.diskStorage({
    destination: (
      _request,
      _file,
      callback: (error: Error | null, destination: string) => void,
    ) => {
      callback(null, uploadsDir);
    },
    filename: (
      _request,
      file,
      callback: (error: Error | null, filename: string) => void,
    ) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname) || '.dat';
      callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });

  return multer({ storage });
};
