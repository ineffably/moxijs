/**
 * Theme system for the sprite editor
 * Allows customizing the look and feel of all UI components
 */

import cc29ThemesJson from './themes/cc29-themes.json';

/**
 * Theme Configuration
 *
 * A theme defines the visual appearance through semantic color roles.
 * Colors are organized by their visual function, not by which component uses them.
 *
 * BACKGROUND LAYERS (4 colors - define depth through layering):
 *   backgroundRoot     - The canvas/viewport background (furthest back)
 *   backgroundSurface  - Cards, panels, dialogs (main surfaces)
 *   backgroundRaised   - Buttons, inputs, interactive elements (raised above surfaces)
 *   backgroundOverlay  - Headers, title bars, hover states (highest layer)
 *
 * BORDERS (2 colors - define edges and separation):
 *   borderStrong  - Primary borders, strong definition
 *   borderSubtle  - Subtle dividers, inner borders, light separation
 *
 * ACCENTS (2 colors - draw attention and show state):
 *   accentPrimary   - Active states, selections, primary actions
 *   accentSecondary - Hover states, secondary highlights
 *
 * TEXT (2 colors - content hierarchy):
 *   textPrimary   - Main content, important text
 *   textSecondary - Labels, hints, de-emphasized content
 */
export interface Theme {
  // Background layers (from back to front)
  backgroundRoot: number;     // Canvas background
  backgroundSurface: number;  // Cards, panels
  backgroundRaised: number;   // Buttons, inputs
  backgroundOverlay: number;  // Headers, title bars

  // Borders
  borderStrong: number;  // Primary borders
  borderSubtle: number;  // Light dividers

  // Accents
  accentPrimary: number;   // Selections, active
  accentSecondary: number; // Hover, secondary

  // Text
  textPrimary: number;   // Main content
  textSecondary: number; // Labels, hints
}

/**
 * Convert JSON theme data to Theme object
 * JSON stores colors as hex strings, need to convert to numbers
 */
function parseThemeFromJson(jsonTheme: any): Theme {
  const parseColor = (colorStr: string): number => {
    return parseInt(colorStr, 16);
  };

  return {
    backgroundRoot: parseColor(jsonTheme.backgroundRoot),
    backgroundSurface: parseColor(jsonTheme.backgroundSurface),
    backgroundRaised: parseColor(jsonTheme.backgroundRaised),
    backgroundOverlay: parseColor(jsonTheme.backgroundOverlay),
    borderStrong: parseColor(jsonTheme.borderStrong),
    borderSubtle: parseColor(jsonTheme.borderSubtle),
    accentPrimary: parseColor(jsonTheme.accentPrimary),
    accentSecondary: parseColor(jsonTheme.accentSecondary),
    textPrimary: parseColor(jsonTheme.textPrimary),
    textSecondary: parseColor(jsonTheme.textSecondary),
  };
}

/**
 * Load themes from JSON
 */
const cc29Themes = cc29ThemesJson as any;

// Classic themes
export const DARK_THEME: Theme = parseThemeFromJson(cc29Themes.classic[0]);
export const LIGHT_THEME: Theme = parseThemeFromJson(cc29Themes.classic[1]);

// Seasonal themes
export const SPRING_THEME: Theme = parseThemeFromJson(cc29Themes.seasonal[0]);
export const SUMMER_THEME: Theme = parseThemeFromJson(cc29Themes.seasonal[1]);
export const AUTUMN_THEME: Theme = parseThemeFromJson(cc29Themes.seasonal[2]);
export const WINTER_THEME: Theme = parseThemeFromJson(cc29Themes.seasonal[3]);

/**
 * Helper function to create a theme from a palette
 * Maps palette colors to theme roles based on brightness/purpose
 */
export function createThemeFromPalette(
  palette: number[],
  config?: {
    background?: number;
    cardBg?: number;
    titleBar?: number;
    buttonBg?: number;
    highlight?: number;
    darkText?: number;
    lightText?: number;
  }
): Theme {
  // Sort palette by brightness (simple luminance calculation)
  const sortedByBrightness = [...palette].sort((a, b) => {
    const lumA = ((a >> 16) & 0xff) * 0.299 + ((a >> 8) & 0xff) * 0.587 + (a & 0xff) * 0.114;
    const lumB = ((b >> 16) & 0xff) * 0.299 + ((b >> 8) & 0xff) * 0.587 + (b & 0xff) * 0.114;
    return lumA - lumB;
  });

  const darkest = sortedByBrightness[0];
  const dark = sortedByBrightness[Math.floor(sortedByBrightness.length * 0.25)];
  const medium = sortedByBrightness[Math.floor(sortedByBrightness.length * 0.5)];
  const light = sortedByBrightness[Math.floor(sortedByBrightness.length * 0.75)];
  const lightest = sortedByBrightness[sortedByBrightness.length - 1];

  // Find a saturated color for highlight (highest saturation)
  const highlight = palette.reduce((best, color) => {
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
  }, palette[0]);

  return {
    backgroundRoot: config?.background ?? dark,
    backgroundSurface: config?.cardBg ?? medium,
    backgroundRaised: config?.buttonBg ?? light,
    backgroundOverlay: config?.titleBar ?? dark,
    borderStrong: darkest,
    borderSubtle: lightest,
    accentPrimary: config?.highlight ?? highlight,
    accentSecondary: config?.highlight ?? highlight,
    textPrimary: config?.darkText ?? darkest,
    textSecondary: config?.lightText ?? dark,
  };
}

/**
 * Theme metadata for organizing and displaying themes
 */
export interface ThemeMetadata {
  name: string;
  theme: Theme;
  category: 'classic' | 'seasonal';
  palette: string;
}

/**
 * Theme group - organizes themes by palette
 */
export interface ThemeGroup {
  paletteName: string;
  classic: ThemeMetadata[];
  seasonal: ThemeMetadata[];
}

/**
 * Load theme groups from JSON files
 */
function loadThemeGroup(jsonData: any): ThemeGroup {
  const paletteName = jsonData.paletteName;

  const classic: ThemeMetadata[] = jsonData.classic.map((jsonTheme: any) => ({
    name: jsonTheme.name,
    theme: parseThemeFromJson(jsonTheme),
    category: 'classic' as const,
    palette: paletteName
  }));

  const seasonal: ThemeMetadata[] = jsonData.seasonal.map((jsonTheme: any) => ({
    name: jsonTheme.name,
    theme: parseThemeFromJson(jsonTheme),
    category: 'seasonal' as const,
    palette: paletteName
  }));

  return {
    paletteName,
    classic,
    seasonal
  };
}

/**
 * All available theme groups organized by palette
 */
export const THEME_GROUPS: ThemeGroup[] = [
  loadThemeGroup(cc29ThemesJson)
];

/**
 * Get all themes flattened into a single array
 */
export function getAllThemes(): ThemeMetadata[] {
  return THEME_GROUPS.flatMap(group => [...group.classic, ...group.seasonal]);
}

/**
 * Get themes by palette name
 */
export function getThemesByPalette(paletteName: string): ThemeGroup | undefined {
  return THEME_GROUPS.find(group => group.paletteName === paletteName);
}

/**
 * Get theme by name
 */
export function getThemeByName(name: string): ThemeMetadata | undefined {
  return getAllThemes().find(t => t.name === name);
}

/**
 * Global theme state - can be modified at runtime
 */
let currentTheme: Theme = DARK_THEME;
let currentThemeMetadata: ThemeMetadata = { name: 'Dark', theme: DARK_THEME, category: 'classic', palette: 'CC-29' };

/**
 * Get the current theme
 */
export function getTheme(): Theme {
  return currentTheme;
}

/**
 * Get the current theme metadata
 */
export function getCurrentThemeMetadata(): ThemeMetadata {
  return currentThemeMetadata;
}

/**
 * Set the current theme by metadata
 */
export function setThemeByMetadata(metadata: ThemeMetadata): void {
  currentTheme = metadata.theme;
  currentThemeMetadata = metadata;
}

/**
 * Set the current theme (legacy API)
 */
export function setTheme(theme: Theme): void {
  currentTheme = theme;
  // Try to find metadata for this theme
  const metadata = getAllThemes().find(t => t.theme === theme);
  if (metadata) {
    currentThemeMetadata = metadata;
  }
}

/**
 * Reset to default theme
 */
export function resetTheme(): void {
  const defaultMetadata = getThemeByName('Dark');
  if (defaultMetadata) {
    setThemeByMetadata(defaultMetadata);
  }
}
