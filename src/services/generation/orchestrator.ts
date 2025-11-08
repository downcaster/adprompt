/**
 * @file Orchestrates Veo generation with optional critique feedback loop.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type { BrandKit, CampaignBrief, Scorecard } from '../../types/scorecard.js';
import { generateVideo } from './generationProxy.js';
import { runCritique } from '../critique/index.js';
import type { CritiqueContext } from '../../prompt/critiqueTemplate.js';
import { defaultSpecialistConfigs } from '../critique/agentConfigs.js';

const SCORE_THRESHOLD = 0.8;

const buildCritiqueContext = (
  brand: BrandKit,
  campaign: CampaignBrief,
  scoreThreshold: number,
  caption?: string,
): Omit<CritiqueContext, 'assetFrames'> => ({
  brandName: brand.name,
  brandTone: brand.toneDescription,
  targetAudience: campaign.audience,
  callToAction: campaign.callToAction,
  prohibitedPhrases: brand.prohibitedPhrases,
  derivedPaletteHex: brand.derivedPaletteHex,
  scoreThreshold,
  caption,
});

export interface GenerationResult {
  iteration: number;
  videoPath: string;
  jobId?: string;
  scorecard?: Scorecard;
  rawGeneration: unknown;
  passed: boolean;
}

export interface GenerateOptions {
  brand: BrandKit;
  campaign: CampaignBrief;
  caption?: string;
  regenLimit?: number;
  scoreThreshold?: number;
}

export const generateWithCritique = async (
  options: GenerateOptions,
): Promise<{ results: GenerationResult[]; final: GenerationResult }> => {
  const regenLimit = options.regenLimit ?? options.campaign.regenLimit ?? 5;
  const threshold = options.scoreThreshold ?? SCORE_THRESHOLD;

  const contextBase = buildCritiqueContext(
    options.brand,
    options.campaign,
    threshold,
    options.caption,
  );

  const results: GenerationResult[] = [];
  let previousScorecard: Scorecard | undefined;

  for (let iteration = 1; iteration <= regenLimit; iteration += 1) {
    const generation = await generateVideo({
      brand: options.brand,
      campaign: options.campaign,
      iteration,
      previousScorecard,
    });

    const critique = await runCritique({
      assetPath: generation.videoPath,
      assetUrl: path.relative(process.cwd(), generation.videoPath),
      context: contextBase,
      specialistConfigs: defaultSpecialistConfigs,
      frameSampleCount: 6,
      iterations: iteration,
    });

    const passed = critique.overallStatus === 'pass';

    const result: GenerationResult = {
      iteration,
      videoPath: generation.videoPath,
      jobId: generation.jobId,
      scorecard: critique,
      rawGeneration: generation.rawResponse,
      passed,
    };

    results.push(result);

    if (passed) {
      return { results, final: result };
    }

    previousScorecard = critique;
  }

  return { results, final: results[results.length - 1] };
};

export const generateOnly = async (
  options: Omit<GenerateOptions, 'regenLimit' | 'scoreThreshold'>,
): Promise<GenerationResult> => {
  const generation = await generateVideo({
    brand: options.brand,
    campaign: options.campaign,
    iteration: 1,
  });

  return {
    iteration: 1,
    videoPath: generation.videoPath,
    jobId: generation.jobId,
    rawGeneration: generation.rawResponse,
    passed: false,
  };
};
