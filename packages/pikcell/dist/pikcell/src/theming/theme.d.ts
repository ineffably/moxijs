/**
 * Theme system for the sprite editor
 * Allows customizing the look and feel of all UI components
 */
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
    backgroundRoot: number;
    backgroundSurface: number;
    backgroundRaised: number;
    backgroundOverlay: number;
    borderStrong: number;
    borderSubtle: number;
    accentPrimary: number;
    accentSecondary: number;
    textPrimary: number;
    textSecondary: number;
}
export declare const DARK_THEME: Theme;
export declare const LIGHT_THEME: Theme;
export declare const SPRING_THEME: Theme;
export declare const SUMMER_THEME: Theme;
export declare const AUTUMN_THEME: Theme;
export declare const WINTER_THEME: Theme;
/**
 * Helper function to create a theme from a palette
 * Maps palette colors to theme roles based on brightness/purpose
 */
export declare function createThemeFromPalette(palette: number[], config?: {
    background?: number;
    cardBg?: number;
    titleBar?: number;
    buttonBg?: number;
    highlight?: number;
    darkText?: number;
    lightText?: number;
}): Theme;
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
 * All available theme groups organized by palette
 */
export declare const THEME_GROUPS: ThemeGroup[];
/**
 * Get all themes flattened into a single array
 */
export declare function getAllThemes(): ThemeMetadata[];
/**
 * Get themes by palette name
 */
export declare function getThemesByPalette(paletteName: string): ThemeGroup | undefined;
/**
 * Get theme by name
 */
export declare function getThemeByName(name: string): ThemeMetadata | undefined;
/**
 * Get the current theme
 */
export declare function getTheme(): Theme;
/**
 * Get the current theme metadata
 */
export declare function getCurrentThemeMetadata(): ThemeMetadata;
/**
 * Set the current theme by metadata
 */
export declare function setThemeByMetadata(metadata: ThemeMetadata): void;
/**
 * Set the current theme (legacy API)
 */
export declare function setTheme(theme: Theme): void;
/**
 * Reset to default theme
 */
export declare function resetTheme(): void;
