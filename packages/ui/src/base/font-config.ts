/**
 * Unified Font Configuration
 *
 * Provides a standardized way to configure fonts across all UI components.
 * Supports multiple rendering methods: canvas text, MSDF (signed distance field),
 * and bitmap fonts.
 *
 * @module font-config
 */

/**
 * Font rendering type.
 *
 * - `'canvas'` - Standard PIXI.Text with DPR scaling (default)
 * - `'msdf'` - Multi-channel Signed Distance Field for crisp text at any scale
 * - `'bitmap'` - Pre-rendered bitmap font atlas
 */
export type FontType = 'canvas' | 'msdf' | 'bitmap';

/**
 * Font configuration props for UI components.
 *
 * @example
 * ```ts
 * // Canvas text (default)
 * { fontFamily: 'Arial', fontSize: 16 }
 *
 * // MSDF text for crisp scaling
 * { fontFamily: 'PixelOperator8', fontType: 'msdf', fontSize: 16 }
 *
 * // Bitmap font
 * { fontFamily: 'MyBitmapFont', fontType: 'bitmap', fontSize: 16 }
 * ```
 */
export interface FontProps {
  /**
   * Font family name.
   * For canvas: Any CSS font family (e.g., 'Arial', 'Helvetica')
   * For MSDF: Must match the loaded MSDF font's family name
   * For bitmap: Must match the loaded bitmap font's family name
   */
  fontFamily?: string;

  /**
   * Font rendering type.
   * @default 'canvas'
   */
  fontType?: FontType;

  /**
   * Font size in pixels.
   */
  fontSize?: number;

  /**
   * Font weight.
   * Only applies to canvas fonts.
   */
  fontWeight?: 'normal' | 'bold' | number;
}

/**
 * Extended font configuration that can be inherited from parent containers.
 * Like CSS, these settings cascade down the component tree.
 */
export interface UIFontConfig extends FontProps {
  /**
   * Default text color (hex number).
   * Inherited by child components.
   */
  textColor?: number;
}

/**
 * Default font type when not specified.
 */
export const DEFAULT_FONT_TYPE: FontType = 'canvas';

/**
 * Resolves the effective font type, defaulting to 'canvas'.
 */
export function resolveFontType(fontType?: FontType): FontType {
  return fontType ?? DEFAULT_FONT_TYPE;
}

