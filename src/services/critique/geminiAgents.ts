/**
 * @file Interfaces with Gemini 2.5 Flash to run specialist critique agents.
 */

import { googleClient } from '../../config/googleClient.js';
import { agentResponseSchema, type AgentResponse } from './scoreAggregator.js';

const AGENT_MODEL = 'gemini-2.5-flash-exp';

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
