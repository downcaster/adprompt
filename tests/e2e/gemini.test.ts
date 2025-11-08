/**
 * @file End-to-end tests for Gemini 2.5 Flash integration using real API keys.
 *       These tests hit the actual Google AI Studio API without mocking.
 */

import { describe, it, expect } from 'vitest';
import { GoogleAIClient } from '../../src/config/googleClient.js';

describe('Gemini 2.5 Flash E2E', () => {
  it('should successfully call Gemini model with a simple prompt', async () => {
    const client = new GoogleAIClient();
    
    const payload = {
      contents: [
        {
          parts: [
            {
              text: 'Respond with a single word: "WORKING"'
            }
          ]
        }
      ]
    };

    const response = await client.callGeminiModel<{
      candidates: Array<{
        content: {
          parts: Array<{ text: string }>;
        };
      }>;
    }>('gemini-2.5-flash', payload);

    expect(response).toBeDefined();
    expect(response.candidates).toBeDefined();
    expect(response.candidates.length).toBeGreaterThan(0);
    expect(response.candidates[0].content.parts[0].text).toContain('WORKING');
  }, 30000); // 30s timeout for API call

  it('should successfully call Gemini with structured critique prompt', async () => {
    const client = new GoogleAIClient();
    
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `You are a brand safety specialist. Analyze the following and respond in JSON format with fields: status (PASS/FAIL), score (0-100), rationale (string).
              
              Scenario: A shoe ad showing a runner on a beach at sunset.
              
              Return ONLY valid JSON.`
            }
          ]
        }
      ]
    };

    const response = await client.callGeminiModel<{
      candidates: Array<{
        content: {
          parts: Array<{ text: string }>;
        };
      }>;
    }>('gemini-2.5-flash', payload);

    expect(response).toBeDefined();
    expect(response.candidates).toBeDefined();
    
    const textResponse = response.candidates[0].content.parts[0].text;
    
    // Try to parse as JSON
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    expect(jsonMatch).toBeTruthy();
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      expect(parsed).toHaveProperty('status');
      expect(parsed).toHaveProperty('score');
      expect(parsed).toHaveProperty('rationale');
      expect(['PASS', 'FAIL']).toContain(parsed.status);
      expect(typeof parsed.score).toBe('number');
      expect(parsed.score).toBeGreaterThanOrEqual(0);
      expect(parsed.score).toBeLessThanOrEqual(100);
    }
  }, 30000);
});

