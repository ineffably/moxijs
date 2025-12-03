/**
 * Simplified Theme System for Pikcell
 *
 * Themes are palette-based with 7 core properties for clean, consistent styling.
 * Theme definitions are data-driven, loaded from JSON config files.
 */

import { getPalette, PaletteType } from './palettes';
import cc29Themes from '../config/themes/cc29.json';

/**
 * Theme Configuration - 8 core properties
 *
 * workspace      - Main canvas/viewport background
 * cardBackground - Card content area background
 * cardTitleBar   - Card title bar & header overlays
 * cardBorder     - Card borders (outer frame)
 * buttonBackground - Buttons, controls, interactive elements
 * bevelColor     - Button bevel/3D effect color
 * accent         - Selection highlights, active states, focus
 * text           - All text content (titles, labels, body)
 */
export interface Theme {
  workspace: number;
  cardBackground: number;
  cardTitleBar: number;
  cardBorder: number;
  buttonBackground: number;
  bevelColor: number;
  accent: number;
  text: number;
}

/**
 * Theme variant type
 */
export type ThemeVariant = 'dark' | 'light';

/**
 * Theme metadata
 */
export interface ThemeInfo {
  name: string;
  palette: PaletteType;
  variant: ThemeVariant;
  theme: Theme;
  description?: string;
}

/**
 * Raw theme data from JSON (hex strings)
 */
interface RawThemeData {
  name: string;
  variant: ThemeVariant;
  description?: string;
  workspace: string;
  cardBackground: string;
  cardTitleBar: string;
  cardBorder: string;
  buttonBackground: string;
  bevelColor: string;
  accent: string;
  text: string;
}

/**
 * Raw theme config from JSON
 */
interface RawThemeConfig {
  palette: PaletteType;
  paletteName: string;
  description: string;
  themes: {
    [category: string]: RawThemeData[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme Parsing (JSON -> Runtime)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse hex string (e.g., "0x2b2b2e") to number
 */
function parseHex(hex: string): number {
  return parseInt(hex.replace('0x', ''), 16);
}

/**
 * Parse raw theme data from JSON to Theme
 */
function parseTheme(raw: RawThemeData): Theme {
  return {
    workspace: parseHex(raw.workspace),
    cardBackground: parseHex(raw.cardBackground),
    cardTitleBar: parseHex(raw.cardTitleBar),
    cardBorder: parseHex(raw.cardBorder),
    buttonBackground: parseHex(raw.buttonBackground),
    bevelColor: parseHex(raw.bevelColor),
    accent: parseHex(raw.accent),
    text: parseHex(raw.text),
  };
}

/**
 * Load themes from a theme config
 */
function loadThemesFromConfig(config: RawThemeConfig): ThemeInfo[] {
  const themes: ThemeInfo[] = [];

  for (const category of Object.keys(config.themes)) {
    for (const rawTheme of config.themes[category]) {
      themes.push({
        name: rawTheme.name,
        palette: config.palette,
        variant: rawTheme.variant,
        description: rawTheme.description,
        theme: parseTheme(rawTheme),
      });
    }
  }

  return themes;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Theme Generation (from palettes)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate luminance of a color (0-255)
 */
function getLuminance(color: number): number {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  return r * 0.299 + g * 0.587 + b * 0.114;
}

/**
 * Sort colors by luminance
 */
function sortByLuminance(colors: number[]): number[] {
  return [...colors].sort((a, b) => getLuminance(a) - getLuminance(b));
}

/**
 * Find the most saturated color in a palette (for accent)
 */
function findAccentColor(colors: number[]): number {
  return colors.reduce((best, color) => {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;

    const bestR = (best >> 16) & 0xff;
    const bestG = (best >> 8) & 0xff;
    const bestB = best & 0xff;
    const bestMax = Math.max(bestR, bestG, bestB);
    const bestMin = Math.min(bestR, bestG, bestB);
    const bestSat = bestMax === 0 ? 0 : (bestMax - bestMin) / bestMax;

    return sat > bestSat ? color : best;
  }, colors[0]);
}

/**
 * Generate a dark theme from a palette
 */
export function createDarkTheme(palette: number[]): Theme {
  const sorted = sortByLuminance(palette);
  const len = sorted.length;

  return {
    workspace: sorted[Math.floor(len * 0.1)],
    cardBackground: sorted[Math.floor(len * 0.15)],
    cardTitleBar: sorted[Math.floor(len * 0.25)],
    cardBorder: sorted[0],
    buttonBackground: sorted[Math.floor(len * 0.35)],
    bevelColor: sorted[Math.floor(len * 0.45)],
    accent: findAccentColor(palette),
    text: sorted[len - 1],
  };
}

/**
 * Generate a light theme from a palette
 */
export function createLightTheme(palette: number[]): Theme {
  const sorted = sortByLuminance(palette);
  const len = sorted.length;

  return {
    workspace: sorted[Math.floor(len * 0.7)],
    cardBackground: sorted[Math.floor(len * 0.85)],
    cardTitleBar: sorted[Math.floor(len * 0.6)],
    cardBorder: sorted[Math.floor(len * 0.15)],
    buttonBackground: sorted[Math.floor(len * 0.75)],
    bevelColor: sorted[Math.floor(len * 0.5)],
    accent: findAccentColor(palette),
    text: sorted[0],
  };
}

/**
 * Generate themes for a palette
 */
export function createThemesFromPalette(paletteType: PaletteType): { dark: ThemeInfo; light: ThemeInfo } {
  const palette = getPalette(paletteType);
  const paletteName = paletteType.toUpperCase();

  return {
    dark: {
      name: `${paletteName} Dark`,
      palette: paletteType,
      variant: 'dark',
      theme: createDarkTheme(palette),
    },
    light: {
      name: `${paletteName} Light`,
      palette: paletteType,
      variant: 'light',
      theme: createLightTheme(palette),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme Registry (data-driven from JSON)
// ─────────────────────────────────────────────────────────────────────────────

// Load all themes from config files
const cc29ThemeList = loadThemesFromConfig(cc29Themes as RawThemeConfig);

/** All available themes */
export const ALL_THEMES: ThemeInfo[] = [
  ...cc29ThemeList,
  // Add more palette themes here as they're created:
  // ...pico8ThemeList,
  // ...tic80ThemeList,
];

// Default theme references (first dark and light themes)
const defaultDarkTheme = ALL_THEMES.find(t => t.name === 'Dark') || ALL_THEMES[0];
const defaultLightTheme = ALL_THEMES.find(t => t.name === 'Light') || ALL_THEMES[1];

/** Default dark theme */
export const DARK_THEME = defaultDarkTheme.theme;

/** Default light theme */
export const LIGHT_THEME = defaultLightTheme.theme;

// ─────────────────────────────────────────────────────────────────────────────
// Theme State Management
// ─────────────────────────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = 'pikcell-theme';

function saveThemeToStorage(themeName: string): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
  } catch {
    // localStorage might not be available
  }
}

function loadThemeFromStorage(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function initializeTheme(): ThemeInfo {
  const savedName = loadThemeFromStorage();
  if (savedName) {
    const found = ALL_THEMES.find(t => t.name === savedName);
    if (found) return found;
  }
  return defaultDarkTheme;
}

// Current theme state
let currentThemeInfo: ThemeInfo = initializeTheme();

/**
 * Get the current theme
 */
export function getTheme(): Theme {
  return currentThemeInfo.theme;
}

/**
 * Get the current theme info (includes name, palette, variant)
 */
export function getThemeInfo(): ThemeInfo {
  return currentThemeInfo;
}

/**
 * Get all available themes
 */
export function getAllThemes(): ThemeInfo[] {
  return ALL_THEMES;
}

/**
 * Set the current theme by ThemeInfo
 */
export function setTheme(themeInfo: ThemeInfo): void {
  currentThemeInfo = themeInfo;
  saveThemeToStorage(themeInfo.name);
}

/**
 * Set the current theme by name
 */
export function setThemeByName(name: string): boolean {
  const found = ALL_THEMES.find(t => t.name === name);
  if (found) {
    setTheme(found);
    return true;
  }
  return false;
}

/**
 * Reset to default theme
 */
export function resetTheme(): void {
  setTheme(defaultDarkTheme);
}

/**
 * PIKCELL Font Configuration
 * 
 * The font system works like this:
 * - Font is installed at a high resolution (e.g., 256px for high-DPI)
 * - It's scaled down to a consistent DISPLAY size (16px)
 * - All calculations should use DISPLAY_SIZE, not the installation size
 */
const FONT_DISPLAY_SIZE = 16; // The actual pixel height we want text to appear

/**
 * @deprecated Use getFontDPR() instead for Canvas 2D DPR text rendering.
 * This was used for BitmapText which has been replaced with asTextDPR().
 */
export function getFont(): { size: number; scale: number; displaySize: number } {
  const size = (globalThis as Record<string, unknown>).__PIKCELL_FONT_SIZE__ as number ?? 64;
  const scale = (globalThis as Record<string, unknown>).__PIKCELL_FONT_SCALE__ as number ?? 0.25;
  return { size, scale, displaySize: FONT_DISPLAY_SIZE };
}

/**
 * @deprecated Use getFontDPR() instead
 */
export function getFontScale(): number {
  return getFont().scale;
}

/**
 * @deprecated Use getFontDPR() instead
 */
export function getFontSize(): number {
  return getFont().size;
}

/**
 * Get the font display size (the actual rendered height in pixels).
 * Use this for layout calculations like title bar height.
 * This is constant regardless of the font installation size.
 */
export function getFontDisplaySize(): number {
  return FONT_DISPLAY_SIZE;
}

/**
 * Get the font configuration for Canvas 2D DPR text rendering.
 * @internal Use createText() instead for a simpler API.
 */
export function getFontDPR(): { family: string; size: number; dprScale: number } {
  return {
    family: 'PixelOperator8',  // Use the raw font, not the bitmap version
    size: FONT_DISPLAY_SIZE,   // Display size (16px)
    dprScale: 2                // Render at 2× for crisp text
  };
}

// Import for createText helper
import * as PIXI from 'pixi.js';
import { asTextDPR, PixiProps } from '@moxijs/ui';

/**
 * Create a PIKCELL-styled text element using Canvas 2D DPR rendering.
 * This is the primary way to create text in PIKCELL components.
 * 
 * Uses PixelOperator8 font at 16px display size with 2× DPR supersampling
 * for crisp, pixel-perfect text rendering.
 * 
 * @param text - The text content to display
 * @param color - Fill color (hex number, e.g., 0xffffff)
 * @param props - Optional PIXI display object properties (x, y, anchor, etc.)
 * @returns A PIXI.Text instance configured for pixel-perfect rendering
 * 
 * @example
 * ```typescript
 * const label = createText('Hello World', theme.text, { x: 10, y: 20 });
 * const centered = createText('Centered', 0xffffff, { anchor: 0.5 });
 * ```
 */
export function createText(text: string, color: number, props?: PixiProps): PIXI.Text {
  const fontDPR = getFontDPR();
  return asTextDPR(
    { 
      text, 
      style: { fontFamily: fontDPR.family, fontSize: fontDPR.size, fill: color }, 
      dprScale: fontDPR.dprScale, 
      pixelPerfect: true 
    },
    props
  );
}

/**
 * Create a PIKCELL-styled text element with a custom font.
 * Use this for special cases like the ALPHA! stamp that uses KennyBlocks.
 * 
 * @param text - The text content to display
 * @param fontFamily - The font family name
 * @param color - Fill color (hex number)
 * @param props - Optional PIXI display object properties
 * @param dprScale - DPR scale multiplier (default: 2)
 * @returns A PIXI.Text instance
 */
export function createTextCustomFont(
  text: string, 
  fontFamily: string, 
  color: number, 
  props?: PixiProps,
  dprScale: number = 2
): PIXI.Text {
  return asTextDPR(
    { 
      text, 
      style: { fontFamily, fontSize: FONT_DISPLAY_SIZE, fill: color }, 
      dprScale, 
      pixelPerfect: true 
    },
    props
  );
}
