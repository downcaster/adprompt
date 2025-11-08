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
    ? `Previous critique summary: ${previousScorecard.scores
        .map((score) => `${score.dimension}=${score.score} (${score.status}) => ${score.evidence.summary}`)
        .join(' | ')}.`
    : 'No previous critique feedback; this is the first attempt.';

  const iterationLabel = iteration === 1 ? 'Initial concept' : `Refinement pass #${iteration}`;

  return `You are Veo, generating a ${iterationLabel} for ${brand.name}.
Brand voice: ${tone}
Target audience: ${campaign.audience}
Product focus: ${campaign.productDescription}
Call to action: ${campaign.callToAction}
Tone keywords: ${campaign.toneKeywords.join(', ') || 'energetic, trustworthy'}
${palette}
${prohibited}
${feedback}

Requirements:
- Showcase the product clearly within first second.
- Keep video between 5-10 seconds.
- Highlight CTA on screen text near the end.
- Ensure logo appears cleanly in final frame.
- Avoid hallucinated text or incorrect brand references.

Produce cinematic camera motion, crisp lighting, and social-ready composition.`;
};
