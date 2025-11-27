/**
 * Sprite Editor - Main Entry Point
 * A complete pixel-perfect sprite editor that can be embedded in any PIXI application
 */

// Main Sprite Editor
export { SpriteEditor, SpriteEditorOptions } from './sprite-editor';

// Cards
export { createPaletteCard, PaletteCardOptions, PaletteCardResult } from './cards/palette-card';
export { createToolCard, ToolCardOptions, ToolCardResult } from './cards/tool-card';
export { createSPTToolbarCard, SPTToolbarCardOptions, SPTToolbarCardResult, SPTTool } from './cards/spt-toolbar-card';
export { createInfoBarCard, InfoBarCardOptions, InfoBarCardResult, InfoSection } from './cards/info-bar-card';
export { createCommanderBarCard, CommanderBarCardOptions, CommanderBarCardResult, CommanderBarCallbacks } from './cards/commander-bar-card';
export { createScaleCard, ScaleCardOptions, ScaleCardResult } from './cards/scale-card';
export { createToolbarCard, ToolbarCardOptions, ToolbarCardResult, MainToolType, ToolState } from './cards/toolbar-card';

// Components
export { PixelCard, UI_COLORS } from './components/pixel-card';
export { createPixelButton, PixelButtonOptions, PixelButtonResult, SelectionMode, ActionMode } from './components/pixel-button';
export { createPixelDialog, PixelDialogOptions, PixelDialogResult } from './components/pixel-dialog';
export { createPixelCheckbox, PixelCheckboxOptions, PixelCheckboxResult } from './components/pixel-checkbox';
export { createSpriteSheetCard, SPRITESHEET_CONFIGS, SpriteSheetCardOptions, SpriteSheetCardResult } from './components/spritesheet-card';
export { createSpriteCard, SpriteCardOptions, SpriteCardResult } from './components/sprite-card';
export { createPopupToolbar, PopupToolbarOptions, PopupToolbarResult, PopupToolbarButton } from './components/popup-toolbar';

// Component Interfaces
export { ComponentResult, CardResult, RefreshableComponent, SelectableComponent, ControllableComponent, hasDestroy, isCardResult } from './interfaces/components';

// Re-export pixel grid utilities from moxi
export { GRID, BORDER, px, units, PixelGrid, createBorderConfig } from 'moxi';
export type { PixelGridConfig, BorderConfig } from 'moxi';

// Controllers
export { SpriteSheetController, SpriteSheetConfig, SpriteSheetControllerOptions, SpriteSheetType } from './controllers/sprite-sheet-controller';
export { SpriteController, SpriteControllerOptions } from './controllers/sprite-controller';

// Utilities
export { createSVGIconButton, SVG_ICONS, SVGIconButtonOptions } from './utilities/svg-icon-button';
export { createCardZoomHandler } from './utilities/card-zoom-handler';

// Re-export SVG utilities from moxi
export { svgToTexture } from 'moxi';
export type { SVGToTextureOptions } from 'moxi';

// State Management
export { UIStateManager, CardState, UIState } from './state/ui-state-manager';
export { ProjectStateManager, ProjectState, SpriteSheetState, OperationResult } from './state/project-state-manager';

// Card IDs
export {
  CARD_IDS,
  getSpriteSheetCardId,
  getSpriteCardId,
  isSpriteSheetCard,
  isSpriteCard,
  getCardIndex
} from './config/card-ids';
export type { CardId } from './config/card-ids';

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
export { createToolIcon, createShapeIcon, ToolType, ShapeType } from './theming/tool-icons';
