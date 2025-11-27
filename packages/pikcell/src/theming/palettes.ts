/**
 * Color palette definitions for sprite editor
 *
 * Consolidated: All palette data is loaded from config/palettes.json
 * This file provides typed access to the palette data.
 */
import palettesConfig from '../config/palettes.json';

/**
 * Convert hex string array from JSON to number array
 */
function parseColorArray(colors: Array<{ hex: string; name?: string }>): number[] {
  return colors.map(c => parseInt(c.hex, 16));
}

// Pre-parsed palettes for performance
const parsedPalettes = {
  pico8: parseColorArray(palettesConfig.palettes.pico8.colors),
  tic80: parseColorArray(palettesConfig.palettes.tic80.colors),
  cc29: parseColorArray(palettesConfig.palettes.cc29.colors),
  aerugo: parseColorArray(palettesConfig.palettes.aerugo.colors),
};

/**
 * PICO-8 color palette (16 colors)
 * Standard palette used in PICO-8 fantasy console
 */
export const PICO8_PALETTE = parsedPalettes.pico8;

/**
 * TIC-80 color palette (16 colors)
 * Standard palette used in TIC-80 fantasy console
 */
export const TIC80_PALETTE = parsedPalettes.tic80;

/**
 * CC-29 color palette (29 colors)
 * From Lospec.com/palette-list
 */
export const CC29_PALETTE = parsedPalettes.cc29;

/**
 * Aerugo color palette (32 colors)
 * The editor's UI palette
 * From https://lospec.com/palette-list/aerugo
 */
export const AERUGO_PALETTE = parsedPalettes.aerugo;

export type PaletteType = 'pico8' | 'tic80' | 'cc29' | 'aerugo';

/**
 * Get a palette by type
 */
export function getPalette(type: PaletteType): number[] {
  return parsedPalettes[type];
}

/**
 * Get palette metadata (name, description, source)
 */
export function getPaletteInfo(type: PaletteType): {
  name: string;
  description: string;
  source?: string;
  colorCount: number;
} {
  const data = palettesConfig.palettes[type];
  return {
    name: data.name,
    description: data.description,
    source: data.source,
    colorCount: data.colors.length,
  };
}

/**
 * Get all available palette types
 */
export function getAllPaletteTypes(): PaletteType[] {
  return Object.keys(palettesConfig.palettes) as PaletteType[];
}

/**
 * Get color names for a palette (if available)
 */
export function getColorNames(type: PaletteType): (string | undefined)[] {
  return palettesConfig.palettes[type].colors.map(c => c.name);
}
