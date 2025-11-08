/**
 * @file Full integration test simulating the critique workflow with real Gemini calls.
 */

import { describe, it, expect } from 'vitest';
import { runBrandFitAgent, runVisualQualityAgent, runSafetyAgent, runClarityAgent } from '../../src/services/critique/geminiAgents.js';
import type { CritiqueContext } from '../../src/prompt/critiqueTemplate.js';

describe('Critique Workflow Integration E2E', () => {
  const mockContext: CritiqueContext = {
    brandKit: {
      id: 'test-brand-id',
      ownerId: 'test-owner',
      name: 'Test Brand',
      logoPath: null,
      paletteAssetPath: null,
      derivedPaletteHex: ['#FF5733', '#3498DB', '#2ECC71'],
      toneDescription: 'Energetic, youthful, and bold',
      prohibitedPhrases: ['cheap', 'low-quality'],
      targetAudience: 'Young professionals aged 25-35',
      primaryCallToAction: 'Shop Now',
      createdAt: new Date().toISOString()
    },
    campaignBrief: {
      id: 'test-campaign-id',
      brandKitId: 'test-brand-id',
      productDescription: 'Premium running shoes with advanced cushioning',
      audience: 'Athletes and fitness enthusiasts',
      callToAction: 'Buy Now',
      toneKeywords: ['energetic', 'motivational', 'premium'],
      productImagePath: 'mock/product.jpg',
      additionalAssets: [],
      regenLimit: 5,
      createdAt: new Date().toISOString()
    },
    assetFrames: ['Frame 1', 'Frame 2', 'Frame 3']
  };

  it('should run BrandFit agent with real Gemini', async () => {
    const result = await runBrandFitAgent(mockContext);
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty('dimension');
    expect(result.dimension).toBe('BrandFit');
    expect(result).toHaveProperty('status');
    expect(['pass', 'fail']).toContain(result.status);
    expect(result).toHaveProperty('score');
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result).toHaveProperty('evidence');
    expect(typeof result.evidence.summary).toBe('string');
    expect(result.evidence.summary.length).toBeGreaterThan(0);
  }, 45000);

  it('should run VisualQuality agent with real Gemini', async () => {
    const result = await runVisualQualityAgent(mockContext);
    
    expect(result).toBeDefined();
    expect(result.dimension).toBe('VisualQuality');
    expect(['pass', 'fail']).toContain(result.status);
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  }, 45000);

  it('should run Safety agent with real Gemini', async () => {
    const result = await runSafetyAgent(mockContext);
    
    expect(result).toBeDefined();
    expect(result.dimension).toBe('Safety');
    expect(['pass', 'fail']).toContain(result.status);
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  }, 45000);

  it('should run Clarity agent with real Gemini', async () => {
    const result = await runClarityAgent(mockContext);
    
    expect(result).toBeDefined();
    expect(result.dimension).toBe('Clarity');
    expect(['pass', 'fail']).toContain(result.status);
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  }, 45000);

  it('should run all four specialist agents in parallel', async () => {
    const [brandFit, visualQuality, safety, clarity] = await Promise.all([
      runBrandFitAgent(mockContext),
      runVisualQualityAgent(mockContext),
      runSafetyAgent(mockContext),
      runClarityAgent(mockContext)
    ]);

    expect(brandFit.dimension).toBe('BrandFit');
    expect(visualQuality.dimension).toBe('VisualQuality');
    expect(safety.dimension).toBe('Safety');
    expect(clarity.dimension).toBe('Clarity');

    // All should return valid scores
    [brandFit, visualQuality, safety, clarity].forEach(agent => {
      expect(['pass', 'fail']).toContain(agent.status);
      expect(agent.score).toBeGreaterThanOrEqual(0);
      expect(agent.score).toBeLessThanOrEqual(1);
    });
  }, 60000);
});

