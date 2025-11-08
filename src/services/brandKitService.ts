/**
 * @file Business logic for ingesting brand kits, including palette extraction.
 */

import path from 'node:path';
import Vibrant, { type Palette, type Swatch } from 'node-vibrant';
import colorName from 'color-name';
import { v4 as uuidv4 } from 'uuid';
import type { Request } from 'express';
import { createBrandKit } from '../db/brandKits.js';
import { ensureUser } from '../db/users.js';
import type { BrandKit } from '../types/scorecard.js';

type MulterFile = Express.Multer.File;

const isHexColor = (value: string): boolean => /^#?[0-9A-F]{3,8}$/i.test(value);

const normalizeHex = (value: string): string | null => {
  const trimmed = value.trim();
  if (isHexColor(trimmed)) {
    const hex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    if (hex.length === 4) {
      // Expand shorthand (#ABC -> #AABBCC)
      return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`.toUpperCase();
    }
    return hex.slice(0, 7).toUpperCase();
  }

  const rgb = (colorName as Record<string, [number, number, number]>)[
    trimmed.toLowerCase()
  ];
  if (!rgb) {
    return null;
  }

  const [r, g, b] = rgb;
  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();
};

const extractPaletteHex = async (assetPath: string): Promise<string[]> => {
  try {
    const palette: Palette = await Vibrant.from(assetPath).getPalette();
    const values = Object.values(palette)
      .filter(Boolean)
      .map((swatch) => (swatch as Swatch | null | undefined)?.getHex())
      .filter((hex): hex is string => Boolean(hex));
    return Array.from(new Set(values.map((hex) => hex.toUpperCase())));
  } catch (error) {
    // eslint-disable-next-line no-console -- fallback logging for diagnostics.
    console.warn(`Palette extraction failed for ${assetPath}:`, error);
    return [];
  }
};

const parseCommaSeparated = (value?: string): string[] | undefined => {
  if (!value) {
    return undefined;
  }
  const tokens = value
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);
  return tokens.length > 0 ? tokens : undefined;
};

const collectManualHex = (raw?: string): string[] | undefined => {
  if (!raw) {
    return undefined;
  }
  const tokens = raw.split(',');
  const normalized = tokens
    .map((token) => normalizeHex(token))
    .filter((hex): hex is string => Boolean(hex));
  return normalized.length > 0 ? Array.from(new Set(normalized)) : undefined;
};

export interface CreateBrandKitRequest {
  name: string;
  toneDescription?: string;
  prohibitedPhrases?: string;
  targetAudience?: string;
  primaryCallToAction?: string;
  manualHexColors?: string;
}

export const buildBrandKitPayload = async (
  request: Request,
): Promise<BrandKit> => {
  const ownerId = request.headers['x-user-id'];
  const ownerEmail = request.headers['x-user-email'];

  if (!ownerId || typeof ownerId !== 'string') {
    throw new Error('Missing required header: X-User-Id');
  }

  const email =
    typeof ownerEmail === 'string' && ownerEmail.length > 0
      ? ownerEmail
      : `${ownerId}@local.user`;
  await ensureUser(ownerId, email);

  const body = request.body as CreateBrandKitRequest;
  if (!body?.name) {
    throw new Error('Brand kit name is required');
  }

  const files = request.files as
    | Record<string, MulterFile[]>
    | MulterFile[]
    | undefined;

  let logoFile: MulterFile | undefined;
  let paletteFile: MulterFile | undefined;

  if (Array.isArray(files)) {
    // When using upload.array
    logoFile = files.find((file) => file.fieldname === 'logo');
    paletteFile = files.find((file) => file.fieldname === 'palette');
  } else if (files) {
    logoFile = files.logo?.[0];
    paletteFile = files.palette?.[0];
  }

  const manualHex = collectManualHex(body.manualHexColors);
  const paletteHex = paletteFile
    ? await extractPaletteHex(paletteFile.path)
    : [];

  const derivedPalette = Array.from(
    new Set([...(manualHex ?? []), ...paletteHex]),
  );

  return await createBrandKit({
    id: uuidv4(),
    ownerId,
    name: body.name,
    logoPath: logoFile?.path ? path.relative(process.cwd(), logoFile.path) : undefined,
    paletteAssetPath: paletteFile?.path
      ? path.relative(process.cwd(), paletteFile.path)
      : undefined,
    derivedPaletteHex: derivedPalette.length > 0 ? derivedPalette : undefined,
    toneDescription: body.toneDescription,
    prohibitedPhrases: parseCommaSeparated(body.prohibitedPhrases),
    targetAudience: body.targetAudience,
    primaryCallToAction: body.primaryCallToAction,
  });
};
