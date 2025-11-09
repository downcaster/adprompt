/**
 * @file Interfaces with Gemini 2.5 Flash to run specialist critique agents.
 */

import { googleClient } from '../../config/googleClient.js';
import { agentResponseSchema, type AgentResponse } from './scoreAggregator.js';

const AGENT_MODEL = 'gemini-2.5-flash';

export interface ImagePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export interface InvokeAgentInput {
  prompt: string;
  imageParts?: ImagePart[];
}

type GeminiTextPart = {
  text?: string;
};

type GeminiContent = {
  parts?: GeminiTextPart[];
};

type GeminiCandidate = {
  content?: GeminiContent;
};

type GeminiResponse = {
  candidates?: GeminiCandidate[];
};

export const invokeAgent = async (
  input: InvokeAgentInput,
): Promise<AgentResponse> => {
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          ...(input.imageParts ?? []),
          { text: input.prompt },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  };

  const result = await googleClient.callGeminiModel<GeminiResponse>(
    AGENT_MODEL,
    payload,
  );

  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini agent returned empty response');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error(`Failed to parse agent JSON response: ${text}`);
  }

  return agentResponseSchema.parse({
    agent: AGENT_MODEL,
    output: parsed,
  });
};

/**
 * Convenience wrappers for individual specialist agents (for testing)
 */
import { buildAgentPrompt, type CritiqueContext } from '../../prompt/critiqueTemplate.js';
import { defaultSpecialistConfigs } from './agentConfigs.js';

export const runBrandFitAgent = async (context: CritiqueContext) => {
  const config = defaultSpecialistConfigs.find(c => c.dimension === 'BrandFit');
  if (!config) throw new Error('BrandFit config not found');
  
  const prompt = buildAgentPrompt(context, {
    systemInstruction: config.systemInstruction,
    dimension: config.dimension,
  });
  
  const response = await invokeAgent({ prompt });
  return response.output;
};

export const runVisualQualityAgent = async (context: CritiqueContext) => {
  const config = defaultSpecialistConfigs.find(c => c.dimension === 'VisualQuality');
  if (!config) throw new Error('VisualQuality config not found');
  
  const prompt = buildAgentPrompt(context, {
    systemInstruction: config.systemInstruction,
    dimension: config.dimension,
  });
  
  const response = await invokeAgent({ prompt });
  return response.output;
};

export const runSafetyAgent = async (context: CritiqueContext) => {
  const config = defaultSpecialistConfigs.find(c => c.dimension === 'Safety');
  if (!config) throw new Error('Safety config not found');
  
  const prompt = buildAgentPrompt(context, {
    systemInstruction: config.systemInstruction,
    dimension: config.dimension,
  });
  
  const response = await invokeAgent({ prompt });
  return response.output;
};

export const runClarityAgent = async (context: CritiqueContext) => {
  const config = defaultSpecialistConfigs.find(c => c.dimension === 'Clarity');
  if (!config) throw new Error('Clarity config not found');
  
  const prompt = buildAgentPrompt(context, {
    systemInstruction: config.systemInstruction,
    dimension: config.dimension,
  });
  
  const response = await invokeAgent({ prompt });
  return response.output;
};

export const runTextAccuracyAgent = async (context: CritiqueContext) => {
  const config = defaultSpecialistConfigs.find(c => c.dimension === 'TextAccuracy');
  if (!config) throw new Error('TextAccuracy config not found');
  
  const prompt = buildAgentPrompt(context, {
    systemInstruction: config.systemInstruction,
    dimension: config.dimension,
  });
  
  const response = await invokeAgent({ prompt });
  return response.output;
};

export const runProductPresenceAgent = async (context: CritiqueContext) => {
  const config = defaultSpecialistConfigs.find(c => c.dimension === 'ProductPresence');
  if (!config) throw new Error('ProductPresence config not found');
  
  const prompt = buildAgentPrompt(context, {
    systemInstruction: config.systemInstruction,
    dimension: config.dimension,
  });
  
  const response = await invokeAgent({ prompt });
  return response.output;
};
