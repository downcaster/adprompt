import { describe, expect, it } from 'vitest';
import { buildAgentPrompt } from '../src/prompt/critiqueTemplate.js';

const baseContext = {
  brandName: 'Acme Co.',
  brandTone: 'Playful yet premium',
  targetAudience: 'Urban professionals',
  callToAction: 'Download the app today',
  prohibitedPhrases: ['free forever'],
  derivedPaletteHex: ['#FF0000', '#00FF00'],
  scoreThreshold: 0.8,
  assetFrames: ['Frame 1: uploads/frame-1.png', 'Frame 2: uploads/frame-2.png'],
  caption: 'Experience productivity everywhere.',
};

describe('buildAgentPrompt', () => {
  it('includes brand context, palette, and frames', () => {
    const prompt = buildAgentPrompt(baseContext, {
      systemInstruction: 'Stay concise.',
      dimension: 'BrandFit',
    });

    expect(prompt).toContain('Brand: Acme Co.');
    expect(prompt).toContain('Brand palette HEX: #FF0000, #00FF00');
    expect(prompt).toContain('Frame 1: uploads/frame-1.png');
    expect(prompt).toContain('Score threshold for passing: 0.8');
    expect(prompt).toContain('Stay concise.');
  });

  it('falls back gracefully when palette or frames missing', () => {
    const prompt = buildAgentPrompt(
      {
        ...baseContext,
        derivedPaletteHex: undefined,
        assetFrames: [],
      },
      {
        systemInstruction: 'Check clarity.',
        dimension: 'Clarity',
      },
    );

    expect(prompt).toContain('Brand palette not provided');
    expect(prompt).toContain('No frames were extracted');
  });
});
