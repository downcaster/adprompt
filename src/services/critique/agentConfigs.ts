/**
 * @file Defines system prompts for specialist critique agents.
 */

import type { SpecialistAgentConfig } from './index.js';

const PASS_GUIDELINES = `
Scoring:
- 1.0 = flawless; 0.8 = acceptable; <0.8 = failing.
- Use the full range when warranted.
- Set "status" to "pass" only when score >= threshold and no material violations exist.
- Provide one sentence summary with concrete evidence (palette colors, frame numbers, specific phrases).
- Include "citations" array when you can reference frames or copy snippets.`.trim();

export const BRAND_FIT_PROMPT = `
${PASS_GUIDELINES}
Focus on:
- CRITICAL: Brand name spelling - verify the exact brand name appears correctly in ALL text overlays, logos, and captions. Even one letter wrong is a FAIL.
- Logo or brand asset correctness (no distortions, correct usage, spelling accuracy).
- Palette adherence: highlight matches/mismatches to provided HEX list or inferred colors.
- Tone alignment with brand voice and target audience.
- Check prohibited phrases are absent.
If brand name is misspelled anywhere (including in logo text), immediately set status to "fail" and score < 0.5.
If assets are missing, reason about likelihood of on-brand representation and penalize uncertainty.`.trim();

export const VISUAL_QUALITY_PROMPT = `
${PASS_GUIDELINES}
Focus on:
- Sharpness, lighting, composition, absence of glitches/watermarks.
- Consistency of logo/product visibility across frames.
- Text readability, if any.
- Production polish vs obvious artifacts.
Discount minor issues but flag severe distortions immediately.`.trim();

export const SAFETY_PROMPT = `
${PASS_GUIDELINES}
Focus on:
- Harmful, violent, or adult content.
- Bias, stereotypes, offensive gestures, unsafe scenes.
- Misleading claims or medical/financial promises.
- Copyright concerns (non-brand logos, known celebrities, watermarks).
Err on caution: if unsure, lower the score and document the risk.`.trim();

export const CLARITY_PROMPT = `
${PASS_GUIDELINES}
Focus on:
- Does the viewer understand the product, benefit, and CTA quickly?
- Alignment between visuals, caption, and brand positioning.
- CRITICAL: Verify brand name spelling in ALL visible text (logos, overlays, captions, CTAs). Compare letter-by-letter against the provided brand name.
- Detect hallucinated text discrepancies (e.g., wrong tagline, misspelled brand name).
- Ensure CTA is actionable and precise.
Penalize confusion, mixed messaging, missing CTA, or any brand name misspelling (immediate fail if detected).`.trim();

export const TEXT_ACCURACY_PROMPT = `
${PASS_GUIDELINES}
Focus on:
- CRITICAL: Examine ALL text visible in the video frame-by-frame (logos, overlays, captions, CTAs, product labels).
- Verify brand name spelling character-by-character against the provided brand name. Even ONE character wrong is an automatic FAIL.
- Check for typos, misspellings, incorrect capitalization, extra/missing spaces in ANY text.
- Verify product name spelling if shown in text.
- Check that any written words are spelled correctly (not just brand name).
- If ANY text contains spelling errors or typos, set status to "fail" and score < 0.5.
This agent exists SOLELY to catch text/spelling errors. Be extremely strict.`.trim();

export const PRODUCT_PRESENCE_PROMPT = `
${PASS_GUIDELINES}
Focus on:
- CRITICAL: The PRODUCT must be physically visible in at least one frame of the video.
- Verify the product (as described in the brief) is clearly shown, not just implied or suggested.
- The product should be recognizable - not abstract, not metaphorical, but the actual product.
- If the product is completely absent from all frames, this is an automatic FAIL with score < 0.5.
- Examples of PASS: perfume bottle visible, shoes worn/displayed, food product shown.
- Examples of FAIL: only abstract shapes, only environment/setting, only people without product.
This agent exists SOLELY to ensure product visibility. If you cannot identify the product in ANY frame, fail immediately.`.trim();

export const defaultSpecialistConfigs: SpecialistAgentConfig[] = [
  {
    dimension: 'BrandFit',
    systemInstruction: BRAND_FIT_PROMPT,
  },
  {
    dimension: 'VisualQuality',
    systemInstruction: VISUAL_QUALITY_PROMPT,
  },
  {
    dimension: 'Safety',
    systemInstruction: SAFETY_PROMPT,
  },
  {
    dimension: 'Clarity',
    systemInstruction: CLARITY_PROMPT,
  },
  {
    dimension: 'TextAccuracy',
    systemInstruction: TEXT_ACCURACY_PROMPT,
  },
  {
    dimension: 'ProductPresence',
    systemInstruction: PRODUCT_PRESENCE_PROMPT,
  },
];
