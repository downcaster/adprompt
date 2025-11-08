/**
 * @file Prompt builder for Gemini 2.5 Flash specialist agents.
 */

import type { AgentScore } from '../types/scorecard.js';

export interface CritiqueContext {
  brandName: string;
  brandTone?: string;
  targetAudience?: string;
  callToAction?: string;
  prohibitedPhrases?: string[];
  derivedPaletteHex?: string[];
  scoreThreshold: number;
  assetFrames: string[];
  caption?: string;
}

export interface AgentPromptConfig {
  systemInstruction: string;
  dimension: AgentScore['dimension'];
}

export const buildAgentPrompt = (
  context: CritiqueContext,
  config: AgentPromptConfig,
): string => {
  const paletteSection = context.derivedPaletteHex?.length
    ? `Brand palette HEX: ${context.derivedPaletteHex.join(', ')}`
    : 'Brand palette not provided; use brand assets to infer.';

  const prohibitedSection = context.prohibitedPhrases?.length
    ? `Prohibited phrases: ${context.prohibitedPhrases.join(', ')}`
    : 'Prohibited phrases: none provided.';

  const frameOverview = context.assetFrames.length
    ? `You are provided with ${context.assetFrames.length} chronological frame image(s) from the candidate ad.`
    : 'No frames were extracted; rely on textual context only.';

  const framesSection = context.assetFrames.length
    ? context.assetFrames.map((frame, index) => `Frame ${index + 1}: ${frame}`).join('\n')
    : 'N/A';

  return `You are a specialist agent focused on ${config.dimension}.
Brand: ${context.brandName}
Tone guidance: ${context.brandTone ?? 'None provided'}
Target audience: ${context.targetAudience ?? 'General'}
Call to action: ${context.callToAction ?? 'None provided'}
${paletteSection}
${prohibitedSection}
Score threshold for passing: ${context.scoreThreshold}
Caption/transcript: ${context.caption ?? 'N/A'}

${frameOverview}
Frames for review:
${framesSection}

Return JSON strictly matching this schema:
{
  "dimension": "${config.dimension}",
  "score": number between 0 and 1,
  "status": "pass" | "fail",
  "evidence": {
    "summary": string,
    "citations"?: string[]
  }
}
${config.systemInstruction}`;
};
