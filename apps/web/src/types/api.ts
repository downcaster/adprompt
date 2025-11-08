export type AgentStatus = "pass" | "fail";

export interface AgentScore {
  dimension: "BrandFit" | "VisualQuality" | "Safety" | "Clarity";
  score: number;
  status: AgentStatus;
  evidence: {
    summary: string;
    citations?: string[];
  };
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

export interface ScorecardRecord {
  id: string;
  brandKitId: string;
  campaignId: string;
  iteration: number;
  overallStatus: AgentStatus;
  scorecard: Scorecard;
  videoPath: string;
  videoUrl: string;
  createdAt: string;
}

export interface PublishLogRecord {
  id: string;
  brandKitId: string;
  campaignId: string;
  scorecardId?: string;
  platform: string;
  status: string;
  externalId?: string;
  externalUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
