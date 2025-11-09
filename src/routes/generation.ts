/**
 * @file Routes for Veo generation and critique loop orchestration.
 */

import express from "express";
import { getBrandKitById } from "../db/brandKits.js";
import { getCampaignById } from "../db/campaigns.js";
import { getScorecardById } from "../db/scorecards.js";
import {
  generateOnly,
  generateWithCritique,
} from "../services/generation/orchestrator.js";
import { buildPublicUploadUrl } from "../utils/uploads.js";

export const generationRouter = express.Router();

interface GenerateRequestBody {
  brandKitId: string;
  campaignId: string;
  caption?: string;
  regenLimit?: number;
  scoreThreshold?: number;
  scorecardId?: string;
}

const resolveContext = async (
  request: express.Request,
  body: GenerateRequestBody
) => {
  const ownerId = request.headers["x-user-id"];
  if (!ownerId || typeof ownerId !== "string") {
    throw new Error("Missing required header: X-User-Id");
  }

  const brand = await getBrandKitById(ownerId, body.brandKitId);
  if (!brand) {
    throw new Error("Brand kit not found");
  }

  const campaign = await getCampaignById(body.campaignId);
  if (!campaign || campaign.brandKitId !== brand.id) {
    throw new Error("Campaign not found or mismatched brand kit");
  }

  return { brand, campaign };
};

const mapResult = (result: Awaited<ReturnType<typeof generateOnly>>) => ({
  iteration: result.iteration,
  operationName: result.operationName,
  videoPath: result.videoPath,
  videoUrl:
    result.scorecardRecord?.videoUrl ?? buildPublicUploadUrl(result.videoPath),
  scorecard: result.scorecard ?? null,
  scorecardRecord: result.scorecardRecord ?? null,
  passed: result.passed,
});

const mapLoopResults = (
  results: Awaited<ReturnType<typeof generateWithCritique>>
) => ({
  final: mapResult(results.final),
  history: results.results.map(mapResult),
});

const withErrorHandling =
  (
    handler: (
      request: express.Request,
      response: express.Response
    ) => Promise<void>
  ) =>
  async (request: express.Request, response: express.Response) => {
    try {
      await handler(request, response);
    } catch (error) {
      console.error(error);
      response.status(400).json({ error: (error as Error).message });
    }
  };

generationRouter.post(
  "/generate",
  withErrorHandling(async (request, response) => {
    const body = request.body as GenerateRequestBody;
    const { brand, campaign } = await resolveContext(request, body);

    const result = await generateOnly({
      brand,
      campaign,
      caption: body.caption,
    });

    response.status(201).json(mapResult(result));
  })
);

generationRouter.post(
  "/generate-and-critique",
  withErrorHandling(async (request, response) => {
    const body = request.body as GenerateRequestBody;
    const { brand, campaign } = await resolveContext(request, body);

    // If scorecardId is provided, load that scorecard to continue from
    let previousScorecard = undefined;
    if (body.scorecardId) {
      const scorecardRecord = await getScorecardById(body.scorecardId);
      if (scorecardRecord) {
        previousScorecard = scorecardRecord.scorecard;
        console.log(`Continuing from scorecard iteration ${scorecardRecord.iteration}`);
      }
    }

    const results = await generateWithCritique({
      brand,
      campaign,
      caption: body.caption,
      regenLimit: body.regenLimit,
      scoreThreshold: body.scoreThreshold,
      previousScorecard,
    });

    response.status(201).json(mapLoopResults(results));
  })
);

generationRouter.post(
  "/regenerate",
  withErrorHandling(async (request, response) => {
    const body = request.body as GenerateRequestBody;
    const { brand, campaign } = await resolveContext(request, body);

    const results = await generateWithCritique({
      brand,
      campaign,
      caption: body.caption,
      regenLimit: body.regenLimit,
      scoreThreshold: body.scoreThreshold,
    });

    response.status(201).json(mapLoopResults(results));
  })
);
