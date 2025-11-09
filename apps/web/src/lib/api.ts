import { BrandKit, CampaignBrief, PublishLogRecord, ScorecardRecord } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";
const DEMO_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "demo-user";
const DEMO_USER_EMAIL = process.env.NEXT_PUBLIC_DEMO_USER_EMAIL ?? `${DEMO_USER_ID}@adprompt.local`;

const defaultHeaders: HeadersInit = {
  "X-User-Id": DEMO_USER_ID,
  "X-User-Email": DEMO_USER_EMAIL,
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unexpected API error");
  }
  return (await response.json()) as T;
}

export async function listBrandKits(): Promise<BrandKit[]> {
  const response = await fetch(`${API_BASE_URL}/brand-kits`, {
    headers: defaultHeaders,
    cache: "no-store",
  });
  return handleResponse<BrandKit[]>(response);
}

export async function createBrandKit(formData: FormData): Promise<BrandKit> {
  const response = await fetch(`${API_BASE_URL}/brand-kits`, {
    method: "POST",
    headers: defaultHeaders,
    body: formData,
  });
  return handleResponse<BrandKit>(response);
}

export async function listCampaigns(brandKitId: string): Promise<CampaignBrief[]> {
  const response = await fetch(`${API_BASE_URL}/campaigns?brandKitId=${brandKitId}`, {
    headers: defaultHeaders,
    cache: "no-store",
  });
  return handleResponse<CampaignBrief[]>(response);
}

export async function createCampaign(formData: FormData): Promise<CampaignBrief> {
  const response = await fetch(`${API_BASE_URL}/campaigns`, {
    method: "POST",
    headers: defaultHeaders,
    body: formData,
  });
  return handleResponse<CampaignBrief>(response);
}

export interface GeneratePayload {
  brandKitId: string;
  campaignId: string;
  caption?: string;
  regenLimit?: number;
  scoreThreshold?: number;
}

export interface GenerationResultPayload {
  iteration: number;
  jobId?: string;
  videoPath: string;
  videoUrl: string;
  scorecard?: ScorecardRecord["scorecard"] | null;
  scorecardRecord?: ScorecardRecord | null;
  passed: boolean;
  rawGeneration: unknown;
}

export interface GenerationLoopPayload {
  final: GenerationResultPayload;
  history: GenerationResultPayload[];
}

export async function generateOnce(payload: GeneratePayload): Promise<GenerationResultPayload> {
  const response = await fetch(`${API_BASE_URL}/generation/generate`, {
    method: "POST",
    headers: {
      ...defaultHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<GenerationResultPayload>(response);
}

export async function generateAndCritique(payload: GeneratePayload): Promise<GenerationLoopPayload> {
  const response = await fetch(`${API_BASE_URL}/generation/generate-and-critique`, {
    method: "POST",
    headers: {
      ...defaultHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<GenerationLoopPayload>(response);
}

export async function listScorecardsByCampaign(campaignId: string): Promise<ScorecardRecord[]> {
  const response = await fetch(`${API_BASE_URL}/scorecards?campaignId=${campaignId}`, {
    headers: defaultHeaders,
    cache: "no-store",
  });
  return handleResponse<ScorecardRecord[]>(response);
}

export async function listPublishLogs(campaignId: string): Promise<PublishLogRecord[]> {
  const response = await fetch(`${API_BASE_URL}/publish-logs?campaignId=${campaignId}`, {
    headers: defaultHeaders,
    cache: "no-store",
  });
  return handleResponse<PublishLogRecord[]>(response);
}

export async function createPublishLogEntry(payload: {
  brandKitId: string;
  campaignId: string;
  scorecardId?: string;
  platform: string;
  status: string;
  externalId?: string;
  externalUrl?: string;
  metadata?: Record<string, unknown>;
}): Promise<PublishLogRecord> {
  const response = await fetch(`${API_BASE_URL}/publish-logs`, {
    method: "POST",
    headers: {
      ...defaultHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<PublishLogRecord>(response);
}
