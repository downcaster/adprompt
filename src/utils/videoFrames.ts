/**
 * @file Utilities for extracting still frames from video assets.
 */

import path from 'node:path';
import fs from 'node:fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { env } from '../config/env.js';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const ensureSessionDir = async (sessionId: string): Promise<string> => {
  const framesRoot = path.resolve(process.cwd(), env.tempDir, 'frames');
  await fs.mkdir(framesRoot, { recursive: true });
  const sessionDir = path.join(framesRoot, sessionId);
  await fs.mkdir(sessionDir, { recursive: true });
  return sessionDir;
};

export interface ExtractFramesOptions {
  frameCount?: number;
  prefix?: string;
}

export interface ExtractFramesResult {
  frames: string[];
  cleanup: () => Promise<void>;
}

/**
 * Extracts a limited number of evenly spaced frames from a video using ffmpeg screenshots.
 */
export const extractFrames = async (
  videoPath: string,
  options: ExtractFramesOptions = {},
): Promise<ExtractFramesResult> => {
  const frameCount = Math.max(1, options.frameCount ?? 6);
  const prefix = options.prefix ?? 'frame';
  const sessionId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const sessionDir = await ensureSessionDir(sessionId);

  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .on('error', (error) => reject(error))
      .on('end', () => resolve())
      .screenshots({
        count: frameCount,
        filename: `${prefix}-%02i.png`,
        folder: sessionDir,
      });
  });

  const files = await fs.readdir(sessionDir);
  const frames = files
    .filter((file) => file.startsWith(prefix))
    .sort()
    .map((file) => path.join(sessionDir, file));

  const cleanup = async () => {
    await fs.rm(sessionDir, { recursive: true, force: true }).catch(() => {});
  };

  return { frames, cleanup };
};

/**
 * Extracts frames and saves them permanently alongside the video
 */
export const extractAndSaveFrames = async (
  videoPath: string,
  frameCount: number = 6,
): Promise<string[]> => {
  const { ensureUploadsDir } = await import('./uploads.js');
  const uploadsDir = ensureUploadsDir();
  const framesDir = path.join(uploadsDir, 'frames');
  await fs.mkdir(framesDir, { recursive: true });

  const videoBasename = path.basename(videoPath, path.extname(videoPath));
  const framePrefix = `${videoBasename}-frame`;
  const targetDir = path.join(framesDir, videoBasename);
  await fs.mkdir(targetDir, { recursive: true });

  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .on('error', (error) => reject(error))
      .on('end', () => resolve())
      .screenshots({
        count: frameCount,
        filename: `${framePrefix}-%02i.png`,
        folder: targetDir,
      });
  });

  const files = await fs.readdir(targetDir);
  const savedFrames = files
    .filter((file) => file.startsWith(framePrefix))
    .sort()
    .map((file) => path.relative(process.cwd(), path.join(targetDir, file)));

  return savedFrames;
};
