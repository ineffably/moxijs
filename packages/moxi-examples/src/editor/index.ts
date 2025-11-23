/**
 * Sprite Editor - Main Entry Point
 * A complete pixel-perfect sprite editor that can be embedded in any PIXI application
 */

// Components
export { PixelCard, UI_COLORS } from './components/pixel-card';
export { createPixelButton, PixelButtonOptions, SelectionMode, ActionMode } from './components/pixel-button';
export { createPixelDialog, PixelDialogOptions } from './components/pixel-dialog';
export { createPixelCheckbox } from './components/pixel-checkbox';
export { createSpriteSheetCard, SPRITESHEET_CONFIGS, SpriteSheetCardOptions, SpriteSheetCardResult } from './components/spritesheet-card';
export { createSpriteCard, SpriteCardOptions, SpriteCardResult } from './components/sprite-card';

// Re-export pixel grid utilities from moxi
export { GRID, BORDER, px, units, PixelGrid, createBorderConfig } from 'moxi';
export type { PixelGridConfig, BorderConfig } from 'moxi';

// Controllers
export { SpriteSheetController, SpriteSheetConfig, SpriteSheetControllerOptions, SpriteSheetType } from './controllers/sprite-sheet-controller';
export { SpriteController, SpriteControllerOptions } from './controllers/sprite-controller';

// Utilities
export { createSVGIconButton, SVG_ICONS, SVGIconButtonOptions } from './utilities/svg-icon-button';

// Re-export SVG utilities from moxi
export { svgToTexture } from 'moxi';
export type { SVGToTextureOptions } from 'moxi';

// Theming System
export {
  Theme,
  ThemeMetadata,
  ThemeGroup,
  DARK_THEME,
  LIGHT_THEME,
  SPRING_THEME,
  SUMMER_THEME,
  AUTUMN_THEME,
  WINTER_THEME,
  THEME_GROUPS,
  getAllThemes,
  getThemesByPalette,
  getThemeByName,
  getCurrentThemeMetadata,
  getTheme,
  setTheme,
  setThemeByMetadata,
  resetTheme,
  createThemeFromPalette
} from './theming/theme';

// Palettes & Icons
export { PICO8_PALETTE, TIC80_PALETTE, CC29_PALETTE, AERUGO_PALETTE, getPalette, PaletteType } from './theming/palettes';
export { createToolIcon, ToolType } from './theming/tool-icons';
