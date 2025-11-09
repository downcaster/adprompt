/**
 * @file Prompt builder for Veo video generation requests.
 */

import type { BrandKit, CampaignBrief, Scorecard } from '../types/scorecard.js';

export interface GenerationContext {
  brand: BrandKit;
  campaign: CampaignBrief;
  iteration: number;
  previousScorecard?: Scorecard;
  caption?: string;
}

export const buildVeoPrompt = (context: GenerationContext): string => {
  const { brand, campaign, iteration, previousScorecard, caption } = context;

  const palette = brand.derivedPaletteHex?.length
    ? `Color palette: ${brand.derivedPaletteHex.join(', ')}`
    : 'Color palette: use brand-appropriate, modern tones.';

  const tone = brand.toneDescription ?? 'Maintain confident, upbeat tone consistent with the brand.';

  const prohibited = brand.prohibitedPhrases?.length
    ? `Avoid phrases: ${brand.prohibitedPhrases.join(', ')}`
    : 'Avoid offensive or misleading language.';

  const userGuidance = caption
    ? `\n🎬 USER'S CREATIVE DIRECTION:\n${caption}\n\nFollow this creative direction closely while adhering to brand requirements below.`
    : '';

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

  return `You are Veo, generating a ${iterationLabel} for ${brand.name}.${userGuidance}

🚨🚨🚨 CRITICAL - BRAND NAME SPELLING 🚨🚨🚨
The text showing "${brand.name}" is the SINGLE MOST IMPORTANT part of this video.
If any text doesn't spell "${brand.name}" EXACTLY character-by-character, the entire video is WORTHLESS.
I will REJECT it immediately. I will be EXTREMELY disappointed.
If you misspell "${brand.name}" even by ONE letter, you have FAILED completely.
The brand name MUST be "${brand.name}" - not similar, not close, but EXACTLY "${brand.name}".
Check it THREE times before finalizing. This is NON-NEGOTIABLE.

Brand voice: ${tone}
Target audience: ${campaign.audience}
Product focus: ${campaign.productDescription}
Call to action: ${campaign.callToAction}
Tone keywords: ${campaign.toneKeywords.join(', ') || 'energetic, trustworthy'}
${palette}
${prohibited}
${feedback}

Requirements:
- CRITICAL #1: The PRODUCT (${campaign.productDescription}) MUST be physically visible in the video. If the product is not shown, this is an automatic FAIL.
- CRITICAL #2: Any text showing the brand name MUST spell "${brand.name}" EXACTLY. Check every letter.
- Showcase the product clearly and prominently within the first second.
- Keep video between 5-10 seconds.
- Highlight CTA on screen text near the end.
- Ensure logo appears cleanly in final frame with correct spelling "${brand.name}".
- The product must be recognizable and clearly visible (not abstract, not implied).

Produce cinematic camera motion, crisp lighting, and social-ready composition.`;
};
