/**
 * @file Prompt builder for Veo video generation requests.
 */

import type { BrandKit, CampaignBrief, Scorecard } from '../types/scorecard.js';

export interface GenerationContext {
  brand: BrandKit;
  campaign: CampaignBrief;
  iteration: number;
  previousScorecard?: Scorecard;
}

export const buildVeoPrompt = (context: GenerationContext): string => {
  const { brand, campaign, iteration, previousScorecard } = context;

  const palette = brand.derivedPaletteHex?.length
    ? `Color palette: ${brand.derivedPaletteHex.join(', ')}`
    : 'Color palette: use brand-appropriate, modern tones.';

  const tone = brand.toneDescription ?? 'Maintain confident, upbeat tone consistent with the brand.';

  const prohibited = brand.prohibitedPhrases?.length
    ? `Avoid phrases: ${brand.prohibitedPhrases.join(', ')}`
    : 'Avoid offensive or misleading language.';

  const feedback = previousScorecard
    ? `Previous video attempt had issues - PLEASE FIX THESE IN THIS GENERATION:
${previousScorecard.scores
  .filter((score) => score.status === 'fail')
  .map((score) => `- ${score.dimension}: ${score.evidence.summary}`)
  .join('\n')}

${previousScorecard.scores.filter((score) => score.status === 'pass').length > 0 
  ? `Keep these aspects from previous attempt:\n${previousScorecard.scores
      .filter((score) => score.status === 'pass')
      .map((score) => `- ${score.dimension}: ${score.evidence.summary}`)
      .join('\n')}`
  : ''}`
    : 'No previous critique feedback; this is the first attempt.';

  const iterationLabel = iteration === 1 ? 'Initial concept' : `Refinement pass #${iteration}`;

  return `You are Veo, generating a ${iterationLabel} for ${brand.name}.

⚠️ CRITICAL - BRAND NAME ACCURACY:
The brand name is "${brand.name}" - spell it EXACTLY as shown.
Do NOT misspell, modify, or alter the brand name in any way.
If showing the brand name in text overlays, double-check the spelling matches "${brand.name}" precisely.

Brand voice: ${tone}
Target audience: ${campaign.audience}
Product focus: ${campaign.productDescription}
Call to action: ${campaign.callToAction}
Tone keywords: ${campaign.toneKeywords.join(', ') || 'energetic, trustworthy'}
${palette}
${prohibited}
${feedback}

Requirements:
- MOST IMPORTANT: The brand name "${brand.name}" must be spelled EXACTLY correctly in any text overlays or voice-over.
- Showcase the product clearly within first second.
- Keep video between 5-10 seconds.
- Highlight CTA on screen text near the end.
- Ensure logo appears cleanly in final frame.
- Avoid hallucinated text or incorrect brand references.
- If you show the brand name "${brand.name}" in text, verify the spelling is EXACT.

Produce cinematic camera motion, crisp lighting, and social-ready composition.`;
};
