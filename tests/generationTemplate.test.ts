import { describe, expect, it } from 'vitest';
import { buildVeoPrompt } from '../src/prompt/generationTemplate.js';

const brand = {
  id: 'brand-1',
  ownerId: 'user-1',
  name: 'Nimbus',
  logoPath: 'uploads/brand/logo.png',
  paletteAssetPath: undefined,
  derivedPaletteHex: ['#123456', '#abcdef'],
  toneDescription: 'Confident, forward-looking',
  prohibitedPhrases: ['cheap'],
  targetAudience: 'Cloud architects',
  primaryCallToAction: 'Get started',
  createdAt: new Date().toISOString(),
};

const campaign = {
  id: 'campaign-1',
  brandKitId: 'brand-1',
  productDescription: 'Nimbus Control Plane',
  audience: 'Enterprise platform teams',
  callToAction: 'Start your free migration',
  toneKeywords: ['innovative', 'secure'],
  productImagePath: 'uploads/product.png',
  additionalAssets: [],
  regenLimit: 5,
  createdAt: new Date().toISOString(),
};

describe('buildVeoPrompt', () => {
  it('contains brand, campaign, and CTA details with iteration label', () => {
    const prompt = buildVeoPrompt({
      brand,
      campaign,
      iteration: 2,
    });

    expect(prompt).toContain('Refinement pass #2');
    expect(prompt).toContain('Nimbus');
    expect(prompt).toContain('Nimbus Control Plane');
    expect(prompt).toContain('Start your free migration');
    expect(prompt).toContain('#123456');
    expect(prompt).toContain('Avoid phrases: cheap');
  });

  it('summarizes previous critique feedback when provided', () => {
    const prompt = buildVeoPrompt({
      brand,
      campaign,
      iteration: 3,
      previousScorecard: {
        assetUrl: 'uploads/generated/test.mp4',
        iterations: 2,
        scores: [
          {
            dimension: 'Clarity',
            score: 0.6,
            status: 'fail',
            evidence: { summary: 'CTA text unreadable' },
          },
        ],
        overallStatus: 'fail',
        createdAt: new Date().toISOString(),
      },
    });

    expect(prompt).toContain('Clarity=0.6 (fail)');
    expect(prompt).toContain('Refinement pass #3');
  });
});
