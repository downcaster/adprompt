/**
 * @file Exposes thin wrappers around Google AI Studio endpoints (Gemini 2.5 Flash, Veo) with
 *       centralized authentication and error handling.
 */

import { env } from './env.js';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const VEO_BASE_URL = 'https://videogen.googleapis.com/v1beta';

type GoogleRequestOptions = {
  path: string;
  body: unknown;
};

/**
 * Minimal client for interacting with Google AI Studio REST endpoints.
 */
export class GoogleAIClient {
  public constructor(private readonly apiKey: string = env.googleApiKey) {}

  private async post<T>({ path, body }: GoogleRequestOptions): Promise<T> {
    const response = await fetch(`${path}&key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Google AI request failed (${response.status}): ${text}`);
    }

    return (await response.json()) as T;
  }

  /**
   * Calls a Gemini model (e.g., `models/gemini-2.5-flash`) with a provided payload.
   */
  public async callGeminiModel<TResponse>(
    model: string,
    payload: unknown,
  ): Promise<TResponse> {
    const path = `${GEMINI_BASE_URL}/models/${model}:generateContent?alt=json`;
    return this.post<TResponse>({ path, body: payload });
  }

  /**
   * Calls Veo video generation endpoint with the supplied prompt payload.
   */
  public async callVeo<TResponse>(payload: unknown): Promise<TResponse> {
    const path = `${VEO_BASE_URL}/videos:generate?alt=json`;
    return this.post<TResponse>({ path, body: payload });
  }
}

/**
 * Shared singleton instance to be reused across the application.
 */
export const googleClient = new GoogleAIClient();
