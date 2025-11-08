/**
 * @file Orchestrates the critique workflow: frame extraction, agent prompts, and aggregation.
 */

import fs from 'node:fs/promises';
import { buildAgentPrompt, type CritiqueContext } from '../../prompt/critiqueTemplate.js';
import { extractFrames } from '../../utils/videoFrames.js';
import type { CritiqueDimension } from '../../types/scorecard.js';
import { aggregateScores } from './scoreAggregator.js';
import { invokeAgent, type ImagePart } from './geminiAgents.js';
import { defaultSpecialistConfigs } from './agentConfigs.js';

export interface SpecialistAgentConfig {
  dimension: CritiqueDimension;
  systemInstruction: string;
}

export interface CritiqueInput {
  assetPath: string;
  assetUrl: string;
  context: Omit<CritiqueContext, 'assetFrames'>;
  specialistConfigs?: SpecialistAgentConfig[];
  frameSampleCount?: number;
  iterations?: number;
}

export const runCritique = async (
  input: CritiqueInput,
): Promise<ReturnType<typeof aggregateScores>> => {
  const {
    assetPath,
    assetUrl,
    context,
    specialistConfigs = defaultSpecialistConfigs,
    frameSampleCount = 6,
    iterations = 1,
  } = input;

  const { frames, cleanup } = await extractFrames(assetPath, {
    frameCount: frameSampleCount,
    prefix: `critique-${Date.now()}`,
  });

  const imageParts: ImagePart[] = await Promise.all(
    frames.map(async (frame) => ({
      inlineData: {
        data: (await fs.readFile(frame)).toString('base64'),
        mimeType: 'image/png',
      },
    })),
  );

  try {
    const frameLabels = frames.map((_, index) => `Extracted frame ${index + 1}`);

    const fullContext: CritiqueContext = {
      ...context,
      assetFrames: frameLabels,
    };

    const responses = await Promise.all(
      specialistConfigs.map(async (config) => {
        const prompt = buildAgentPrompt(fullContext, {
          systemInstruction: config.systemInstruction,
          dimension: config.dimension,
        });

        return invokeAgent({ prompt, imageParts });
      }),
    );

    return aggregateScores(responses, {
      assetUrl,
      iterations,
      threshold: context.scoreThreshold,
    });
  } finally {
    await cleanup();
  }
};
