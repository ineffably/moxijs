/**
 * Card configuration constants
 *
 * All card-specific dimension and layout values are centralized here.
 * Values are in grid units unless otherwise noted.
 */

// ============================================================================
// Toolbar Card (main tool selection)
// ============================================================================

export const TOOLBAR_CARD_CONFIG = {
  /** Button size in grid units (square) */
  buttonSize: 16,
  /** Spacing between buttons in grid units */
  buttonSpacing: 1,
  /** Number of main tool buttons */
  numButtons: 3,
  /** Layout direction */
  layout: 'vertical' as const
} as const;

// ============================================================================
// SPT Toolbar Card (sprite sheet tools - pan/zoom)
// ============================================================================

export const SPT_TOOLBAR_CONFIG = {
  /** Button size in grid units (square) */
  buttonSize: 16,
  /** Spacing between buttons in grid units */
  buttonSpacing: 1,
  /** Number of tool buttons */
  numButtons: 2,
  /** Layout direction */
  layout: 'vertical' as const
} as const;

// ============================================================================
// Tool Card (tool selection list)
// ============================================================================

export const TOOL_CARD_CONFIG: {
  defaultWidth: number;
  defaultHeight: number;
  baseFontScale: number;
  fontScaleReferenceHeight: number;
  minHeight: number;
  maxHeight: number;
  minWidth: number;
  maxWidth: number;
  minFontScale: number;
  maxFontScale: number;
} = {
  /** Default button width in grid units */
  defaultWidth: 46,
  /** Default button height in grid units */
  defaultHeight: 12,
  /** Base font scale at default height */
  baseFontScale: 0.25,
  /** Reference height for font scale calculation */
  fontScaleReferenceHeight: 12,
  /** Minimum button height */
  minHeight: 4,
  /** Maximum button height */
  maxHeight: 20,
  /** Minimum button width */
  minWidth: 23,
  /** Maximum button width */
  maxWidth: 86,
  /** Minimum font scale */
  minFontScale: 0.1,
  /** Maximum font scale */
  maxFontScale: 0.5
};

// ============================================================================
// Palette Card (color selection)
// ============================================================================

export const PALETTE_CARD_CONFIG: {
  defaultColorsPerRow: number;
  defaultRows: number;
  defaultSwatchSize: number;
  minSwatchSize: number;
  maxSwatchSize: number;
} = {
  /** Default number of colors per row */
  defaultColorsPerRow: 4,
  /** Default number of rows */
  defaultRows: 4,
  /** Default swatch size in grid units */
  defaultSwatchSize: 12,
  /** Minimum swatch size */
  minSwatchSize: 2,
  /** Maximum swatch size */
  maxSwatchSize: 32
};

// ============================================================================
// Commander Bar Card (main action bar)
// ============================================================================

export const COMMANDER_BAR_CONFIG = {
  /** Bar height in grid units */
  barHeight: 12,
  /** Spacing between buttons in grid units */
  buttonSpacing: 2,
  /** Left button width (New, Save, Load, Export) */
  leftButtonWidth: 'auto' as const,
  /** Right button widths */
  layoutButtonWidth: 14,
  themeButtonWidth: 12
} as const;

// ============================================================================
// Info Bar Card (status display)
// ============================================================================

export const INFO_BAR_CONFIG = {
  /** Bar height in grid units */
  barHeight: 8,
  /** Minimum section width in grid units */
  minSectionWidth: 20
} as const;

// ============================================================================
// Scale Card (grid scale testing)
// ============================================================================

export const SCALE_CARD_CONFIG = {
  /** Spacing between buttons in grid units */
  buttonSpacing: 1
} as const;

// ============================================================================
// Popup Toolbar (shape submenu, etc.)
// ============================================================================

export const POPUP_TOOLBAR_CONFIG = {
  /** Default button size in grid units (square) */
  buttonSize: 12,
  /** Spacing between buttons in grid units */
  buttonSpacing: 1
} as const;

// ============================================================================
// Component Styling
// ============================================================================

export const COMPONENT_STYLES = {
  /** Default font size for buttons */
  buttonFontSize: 64,
  /** Card title font height multiplier */
  titleFontHeightMultiplier: 64,
  /** Default icon padding in grid units */
  iconPadding: 3
} as const;

// ============================================================================
// Aggregate export for convenience
// ============================================================================

export const CARD_CONFIGS = {
  toolbar: TOOLBAR_CARD_CONFIG,
  sptToolbar: SPT_TOOLBAR_CONFIG,
  tool: TOOL_CARD_CONFIG,
  palette: PALETTE_CARD_CONFIG,
  commanderBar: COMMANDER_BAR_CONFIG,
  infoBar: INFO_BAR_CONFIG,
  scale: SCALE_CARD_CONFIG,
  popup: POPUP_TOOLBAR_CONFIG,
  styles: COMPONENT_STYLES
} as const;
