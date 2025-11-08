/**
 * @file Wraps Veo generation calls and handles asset preparation/decoding.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { lookup as mimeLookup } from 'mime-types';
import { buildVeoPrompt, type GenerationContext } from '../../prompt/generationTemplate.js';
import { googleClient } from '../../config/googleClient.js';
import { ensureUploadsDir } from '../../utils/uploads.js';

interface InlineDataAsset {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

interface VeoResponse {
  video?: InlineDataAsset;
  videoUri?: string;
  jobId?: string;
  [key: string]: unknown;
}

const readAssetAsInline = async (assetPath: string): Promise<InlineDataAsset> => {
  const absolutePath = path.resolve(process.cwd(), assetPath);
  const buffer = await fs.readFile(absolutePath);
  const mimeType = mimeLookup(absolutePath) || 'application/octet-stream';
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: typeof mimeType === 'string' ? mimeType : 'application/octet-stream',
    },
  };
};

const decodeVideoResponse = async (response: VeoResponse): Promise<{ videoPath: string; jobId?: string }> => {
  const uploadsDir = ensureUploadsDir();
  const generatedDir = path.join(uploadsDir, 'generated');
  await fs.mkdir(generatedDir, { recursive: true });
  const filename = `veo-${Date.now()}-${Math.round(Math.random() * 1e9)}.mp4`;
  const targetPath = path.join(generatedDir, filename);

  if (response.video?.inlineData?.data) {
    const buffer = Buffer.from(response.video.inlineData.data, 'base64');
    await fs.writeFile(targetPath, buffer);
    return { videoPath: targetPath, jobId: response.jobId };
  }

  if (response.videoUri) {
    const res = await fetch(response.videoUri);
    if (!res.ok) {
      throw new Error(`Failed to download Veo video: ${res.status}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    await fs.writeFile(targetPath, Buffer.from(arrayBuffer));
    return { videoPath: targetPath, jobId: response.jobId };
  }

  throw new Error('Veo response did not include video data');
};

export interface GenerateVideoResult {
  videoPath: string;
  jobId?: string;
  rawResponse: VeoResponse;
}

export const generateVideo = async (
  context: GenerationContext,
): Promise<GenerateVideoResult> => {
  const prompt = buildVeoPrompt(context);

  const assets: InlineDataAsset[] = [];
  if (context.brand.logoPath) {
    assets.push(await readAssetAsInline(context.brand.logoPath));
  }
  assets.push(await readAssetAsInline(context.campaign.productImagePath));
  if (context.campaign.additionalAssets?.length) {
    const extras = await Promise.all(
      context.campaign.additionalAssets.map((asset) => readAssetAsInline(asset)),
    );
    assets.push(...extras);
  }

  const payload = {
    prompt,
    assets,
    videoConfig: {
      durationSeconds: 8,
      aspectRatio: '9:16',
      outputFormat: 'mp4',
    },
  };

  const response = await googleClient.callVeo<VeoResponse>(payload);
  const decoded = await decodeVideoResponse(response);

  return {
    videoPath: decoded.videoPath,
    jobId: decoded.jobId,
    rawResponse: response,
  };
};
