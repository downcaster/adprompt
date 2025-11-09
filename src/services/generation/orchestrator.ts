/**
 * @file Orchestrates Veo generation with optional critique feedback loop.
 */

import type { BrandKit, CampaignBrief, Scorecard, ScorecardRecord } from '../../types/scorecard.js';
import { generateVideo } from './generationProxy.js';
import { runCritique } from '../critique/index.js';
import type { CritiqueContext } from '../../prompt/critiqueTemplate.js';
import { defaultSpecialistConfigs } from '../critique/agentConfigs.js';
import { createScorecardRecord } from '../../db/scorecards.js';
import { buildPublicUploadUrl, toUploadsRelativePath } from '../../utils/uploads.js';

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
  productDescription: campaign.productDescription,
});

export interface GenerationResult {
  iteration: number;
  videoPath: string;
  operationName?: string;
  scorecard?: Scorecard;
  scorecardRecord?: ScorecardRecord;
  passed: boolean;
}

export interface GenerateOptions {
  brand: BrandKit;
  campaign: CampaignBrief;
  caption?: string;
  regenLimit?: number;
  scoreThreshold?: number;
  previousScorecard?: Scorecard;
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
  let previousScorecard: Scorecard | undefined = options.previousScorecard;

  for (let iteration = 1; iteration <= regenLimit; iteration += 1) {
    const generation = await generateVideo({
      brand: options.brand,
      campaign: options.campaign,
      iteration,
      previousScorecard,
      caption: options.caption,
    });

    const videoPublicUrl = buildPublicUploadUrl(generation.videoPath);
    const uploadsRelativePath = toUploadsRelativePath(generation.videoPath);

    // Extract and save frames permanently
    const { extractAndSaveFrames } = await import('../../utils/videoFrames.js');
    const framePaths = await extractAndSaveFrames(generation.videoPath, 6);

    const critique = await runCritique({
      assetPath: generation.videoPath,
      assetUrl: videoPublicUrl,
      context: contextBase,
      specialistConfigs: defaultSpecialistConfigs,
      frameSampleCount: 6,
      iterations: iteration,
    });

    const passed = critique.overallStatus === 'pass';

    const scorecardRecord = await createScorecardRecord({
      brandKitId: options.brand.id,
      campaignId: options.campaign.id,
      iteration,
      overallStatus: critique.overallStatus,
      scorecard: critique,
      videoPath: uploadsRelativePath,
      videoUrl: videoPublicUrl,
      caption: options.caption,
      framePaths,
    });

    const result: GenerationResult = {
      iteration,
      videoPath: uploadsRelativePath,
      operationName: generation.operationName,
      scorecard: critique,
      scorecardRecord,
      passed,
    };

    results.push(result);

    // Log critique scores for this iteration
    console.log(`\n=== CRITIQUE SCORES - Iteration ${iteration} ===`);
    console.log(`Overall Status: ${critique.overallStatus.toUpperCase()}`);
    critique.scores.forEach((score) => {
      console.log(
        `  ${score.dimension}: ${score.score.toFixed(2)} (${score.status}) - ${score.evidence.summary}`
      );
    });
    console.log(`Passed threshold: ${passed ? 'YES ✓' : 'NO ✗'}`);
    console.log('==========================================\n');

    if (passed) {
      return { results, final: result };
    }

    // Update previousScorecard for next iteration's prompt
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
    caption: options.caption,
  });

  return {
    iteration: 1,
    videoPath: toUploadsRelativePath(generation.videoPath),
    operationName: generation.operationName,
    passed: false,
  };
};
