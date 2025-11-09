/**
 * @file Aggregates agent outputs and auxiliary heuristics into a canonical scorecard.
 */

import { z } from 'zod';
import type { AgentScore, Scorecard } from '../../types/scorecard.js';

export const agentScoreSchema = z.object({
  dimension: z.enum(['BrandFit', 'VisualQuality', 'Safety', 'Clarity', 'TextAccuracy', 'ProductPresence']),
  score: z.number().min(0).max(1),
  status: z.enum(['pass', 'fail']),
  evidence: z.object({
    summary: z.string(),
    citations: z.array(z.string()).optional(),
  }),
  metadata: z.record(z.unknown()).optional(),
});

export const agentResponseSchema = z.object({
  agent: z.string(),
  output: agentScoreSchema,
});

export type AgentResponse = z.infer<typeof agentResponseSchema>;

export interface AggregateOptions {
  assetUrl: string;
  iterations: number;
  threshold: number;
}

export const aggregateScores = (
  responses: AgentResponse[],
  options: AggregateOptions,
): Scorecard => {
  const parsed = responses.map((response) => agentResponseSchema.parse(response));

  const scores: AgentScore[] = parsed.map(({ agent, output }) => {
    const adjustedStatus = output.score >= options.threshold ? 'pass' : 'fail';
    return {
      ...output,
      status: adjustedStatus,
      metadata: { ...(output.metadata ?? {}), agent },
    };
  });

  const overallStatus = scores.every((score) => score.status === 'pass')
    ? 'pass'
    : 'fail';

  return {
    assetUrl: options.assetUrl,
    iterations: options.iterations,
    scores,
    overallStatus,
    createdAt: new Date().toISOString(),
  };
};
