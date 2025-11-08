/**
 * @file Type definitions for scorecards, agent outputs, and brand kits.
 */

export type CritiqueDimension = 'BrandFit' | 'VisualQuality' | 'Safety' | 'Clarity';

export type AgentStatus = 'pass' | 'fail';

export interface AgentEvidence {
  /** Human-readable rationale summarizing findings. */
  summary: string;
  /** Optional references to specific frame timestamps or asset identifiers. */
  citations?: string[];
}

export interface AgentScore {
  dimension: CritiqueDimension;
  score: number;
  status: AgentStatus;
  evidence: AgentEvidence;
  metadata?: Record<string, unknown>;
}

export interface Scorecard {
  assetUrl: string;
  iterations: number;
  scores: AgentScore[];
  overallStatus: AgentStatus;
  createdAt: string;
}

export interface BrandKit {
  id: string;
  ownerId: string;
  name: string;
  logoPath?: string;
  paletteAssetPath?: string;
  derivedPaletteHex?: string[];
  toneDescription?: string;
  prohibitedPhrases?: string[];
  targetAudience?: string;
  primaryCallToAction?: string;
  createdAt: string;
}

export interface CampaignBrief {
  id: string;
  brandKitId: string;
  productDescription: string;
  audience: string;
  callToAction: string;
  toneKeywords: string[];
  productImagePath: string;
  additionalAssets?: string[];
  regenLimit: number;
  createdAt: string;
}
