/**
 * @file Wraps Veo generation calls and handles asset preparation/decoding using Google Gen AI SDK.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';
import { buildVeoPrompt, type GenerationContext } from '../../prompt/generationTemplate.js';
import { env } from '../../config/env.js';
import { ensureUploadsDir } from '../../utils/uploads.js';

export interface GenerateVideoResult {
  videoPath: string;
  operationName: string;
  done: boolean;
}

export const generateVideo = async (
  context: GenerationContext,
): Promise<GenerateVideoResult> => {
  const ai = new GoogleGenAI({ apiKey: env.veoApiKey });
  const prompt = buildVeoPrompt(context);

  console.log('\n=== VEO GENERATION REQUEST ===');
  console.log(`Iteration: ${context.iteration}`);
  console.log(`Prompt:\n${prompt}`);
  console.log('==============================\n');

  // Initiate video generation
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-generate-preview',
    prompt: prompt,
  });

  console.log(`Veo operation started: ${operation.name}`);

  // Poll until the video is ready
  while (!operation.done) {
    console.log('Waiting for video generation to complete...');
    await new Promise((resolve) => setTimeout(resolve, 10000)); // 10s poll interval
    operation = await ai.operations.getVideosOperation({
      operation: operation,
    });
  }

  console.log('Video generation complete!');

  // Validate response structure
  if (!operation.response?.generatedVideos?.[0]?.video) {
    throw new Error('Veo operation completed but no video was generated');
  }

  // Download the generated video
  const uploadsDir = ensureUploadsDir();
  const generatedDir = path.join(uploadsDir, 'generated');
  await fs.mkdir(generatedDir, { recursive: true });
  
  const filename = `veo-${Date.now()}-${Math.round(Math.random() * 1e9)}.mp4`;
  const targetPath = path.join(generatedDir, filename);

  await ai.files.download({
    file: operation.response.generatedVideos[0].video,
    downloadPath: targetPath,
  });

  console.log(`Generated video saved to ${targetPath}`);

  return {
    videoPath: targetPath,
    operationName: operation.name ?? 'unknown',
    done: operation.done ?? false,
  };
};
