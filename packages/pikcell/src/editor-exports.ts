/**
 * Sprite Editor - Main Entry Point
 * A complete pixel-perfect sprite editor that can be embedded in any PIXI application
 */

// Main Sprite Editor
export { SpriteEditor, SpriteEditorOptions } from './sprite-editor';

// Cards
export { createPaletteCard, PaletteCardOptions, PaletteCardResult } from './cards/palette-card';
export { createSpriteEditorTools, SpriteEditorToolsOptions, SpriteEditorToolsResult } from './cards/sprite-editor-tools';
export { createInfoBarCard, InfoBarCardOptions, InfoBarCardResult, InfoSection } from './cards/info-bar-card';
export { createCommanderBarCard, CommanderBarCardOptions, CommanderBarCardResult, CommanderBarCallbacks } from './cards/commander-bar-card';
export { createScaleCard, ScaleCardOptions, ScaleCardResult } from './cards/scale-card';
export { createToolbarCard, ToolbarCardOptions, ToolbarCardResult, MainToolType, ToolState } from './cards/toolbar-card';

// Components
export { PixelCard } from './components/pixel-card';
export { createPixelButton, PixelButtonOptions, PixelButtonResult, SelectionMode, ActionMode } from './components/pixel-button';
export { createPixelDialog, PixelDialogOptions, PixelDialogResult } from './components/pixel-dialog';
export { createPixelCheckbox, PixelCheckboxOptions, PixelCheckboxResult } from './components/pixel-checkbox';
export { createSpriteSheetCard, SPRITESHEET_CONFIGS, SpriteSheetCardOptions, SpriteSheetCardResult } from './components/spritesheet-card';
export { createSpriteEditorCard, SpriteEditorCardOptions, SpriteEditorCardResult } from './components/sprite-editor-card';
export { createPopupToolbar, PopupToolbarOptions, PopupToolbarResult, PopupToolbarButton } from './components/popup-toolbar';

// Component Interfaces
export { ComponentResult, CardResult, RefreshableComponent, SelectableComponent, ControllableComponent, hasDestroy, isCardResult } from './interfaces/components';

// Re-export pixel grid utilities from moxi
export { GRID, BORDER, px, units, PixelGrid, createBorderConfig } from '@moxijs/ui';
export type { PixelGridConfig, BorderConfig } from '@moxijs/ui';

// Controllers
export { SpriteSheetController, SpriteSheetConfig, SpriteSheetControllerOptions, SpriteSheetType } from './controllers/sprite-sheet-controller';
export { SpriteController, SpriteControllerOptions } from './controllers/sprite-controller';

// Utilities
export { createSVGIconButton, SVGIconButtonOptions, TOOL_ICONS, SPT_ICONS, ACTION_ICONS } from './utilities/svg-icon-button';
export { createCardZoomHandler } from './utilities/card-zoom-handler';
export { createManagedCard, ManagedCard, Destroyable, EventListenerRef } from './utilities/managed-card';
export {
  layoutButtonRow, layoutButtonColumn, layoutButtonGrid, calculateGridDimensions,
  ButtonRowOptions, ButtonColumnOptions, ButtonGridOptions, LayoutResult, Positionable
} from './utilities/button-layout';

// Effects
export { createPixelExplosion, PixelExplosionOptions, PixelExplosionResult } from './effects/pixel-explosion';

// Icons (consolidated)
export { TOOL_ICONS as ToolIcons, SPT_ICONS as SPTIcons, ACTION_ICONS as ActionIcons, getIcon } from './config/icons';
export type { ToolIconType, SPTIconType, ActionIconType } from './config/icons';

// Re-export SVG utilities from moxi
export { svgToTexture } from '@moxijs/core';
export type { SVGToTextureOptions } from '@moxijs/core';

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
  ThemeInfo,
  ThemeVariant,
  DARK_THEME,
  LIGHT_THEME,
  ALL_THEMES,
  getAllThemes,
  getTheme,
  getThemeInfo,
  setTheme,
  setThemeByName,
  resetTheme,
  createDarkTheme,
  createLightTheme,
  createThemesFromPalette
} from './theming/theme';

// Palettes & Icons
export { PICO8_PALETTE, TIC80_PALETTE, CC29_PALETTE, AERUGO_PALETTE, getPalette, PaletteType } from './theming/palettes';
export { createToolIcon, createShapeIcon, ToolType, ShapeType } from './theming/tool-icons';
