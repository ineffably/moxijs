/**
 * Centralized asset configuration
 * Maps asset aliases to their actual paths
 *
 * Computes base path from the current document location to support:
 * - Local dev server (webpack)
 * - Live Server testing
 * - GitHub Pages deployment
 */

// Compute base path from the HTML file location
function getBasePath(): string {
  // Get the directory of the current HTML file
  const pathname = window.location.pathname;
  // Remove the filename (e.g., index.html) to get the directory
  const lastSlash = pathname.lastIndexOf('/');
  const dir = pathname.substring(0, lastSlash + 1);
  return dir;
}

// Raw asset paths (relative to package root)
const ASSET_PATHS = {
  // Characters
  ROBOT_IDLE: 'assets/character_robot_idle.png',
  ROBOT_IDLE_JSON: 'assets/character_robot_idle.json',
  SPROUTLANDS_CHARACTER: 'assets/sprout-lands-basic/Characters/Basic Charakter Spritesheet.png',
  SPROUTLANDS_CHARACTER_JSON: 'assets/sprout-lands-basic/Characters/Basic Charakter Spritesheet.json',
  CHICKEN: 'assets/sprout-lands-basic/Characters/Free Chicken Sprites.png',
  COW: 'assets/sprout-lands-basic/Characters/Free Cow Sprites.png',

  // Dinos
  DINO_DOUX: 'assets/dino/doux.png',
  DINO_MORT: 'assets/dino/mort.png',
  DINO_TARD: 'assets/dino/tard.png',
  DINO_VITA: 'assets/dino/vita.png',

  // Tiles
  GRASS_TILES: 'assets/sprout-lands-basic/Tilesets/Grass.png',
  WATER_TILES: 'assets/sprout-lands-basic/Tilesets/Water.png',
  HILLS_TILES: 'assets/sprout-lands-basic/Tilesets/Hills.png',

  // Objects
  FURNITURE: 'assets/sprout-lands-basic/Objects/Basic_Furniture.png',
  PLANTS: 'assets/sprout-lands-basic/Objects/Basic_Plants.png',
  TOOLS: 'assets/sprout-lands-basic/Objects/Basic_tools_and_meterials.png',
  GRASS_BIOME_THINGS: 'assets/sprout-lands-basic/Objects/Basic_Grass_Biom_things.png',

  // Fantasy Theme
  FANTASY_CHARACTER_IDLE: 'assets/LegacyFantasy-HighForest/Character/Idle/Idle-Sheet.png',
  FANTASY_CHARACTER_RUN: 'assets/LegacyFantasy-HighForest/Character/Run/Run-Sheet.png',
  FANTASY_CHARACTER_JUMP: 'assets/LegacyFantasy-HighForest/Character/Jump-All/Jump-All-Sheet.png',
  FANTASY_BACKGROUND: 'assets/LegacyFantasy-HighForest/Background/Background.png',
  FANTASY_TREES: 'assets/LegacyFantasy-HighForest/Assets/Tree-Assets.png',

  // Space Theme
  SPACE_NEBULA_BLUE: 'assets/space-backgrounds/Nebula Blue.png',
  SPACE_NEBULA_RED: 'assets/space-backgrounds/Nebula Red.png',
  SPACE_STARS_SMALL: 'assets/space-backgrounds/Stars Small_1.png',
  SPACE_STARS_SMALL_2: 'assets/space-backgrounds/Stars Small_2.png',
  SPACE_SHOOTER_SHEET: 'assets/space-sprite-sheets/space-shooter.png',
  SPACE_SHOOTER_JSON: 'assets/space-sprite-sheets/space-shooter.json',
  SPACE_SHOOTER2_JSON: 'assets/space-sprite-sheets/spaceShooter2_spritesheet.json',

  // UI
  UI_BUTTONS: 'assets/ui-pack/png/blue_button00.png',
  UI_PANEL: 'assets/ui-pack/png/blue_panel.png',

  // Fonts
  KENNEY_FUTURE_THIN_FONT: 'assets/ui-pack-scifi/font/kenney-future-thin.ttf',
  KENNEY_FUTURE_FONT: 'assets/ui-pack-scifi/font/kenney-future.ttf',
  KENNEY_FUTURE_NARROW_FONT: 'assets/custom-fonts/kenney-future-narrow.ttf',
  KENNEY_BLOCKS_FONT: 'assets/custom-fonts/kenney-blocks.ttf',
  KENNEY_BOLD_FONT: 'assets/custom-fonts/kenney-bold.ttf',
  KENVECTOR_FUTURE_FONT: 'assets/custom-fonts/kenvector_future.ttf',
  KENVECTOR_FUTURE_THIN_FONT: 'assets/custom-fonts/kenvector_future_thin.ttf',
  PIXEL_FONT_SPROUTLANDS: 'assets/sprout-lands-ui-basic/fonts/pixelFont-7-8x14-sproutLands.ttf',
  PIXEL_OPERATOR8_FONT: 'assets/custom-fonts/pixel_operator/PixelOperator8.ttf',
  PIXEL_OPERATOR8_BOLD_FONT: 'assets/custom-fonts/pixel_operator/PixelOperator8-Bold.ttf',
  PIXEL_OPERATOR_FONT: 'assets/custom-fonts/pixel_operator/PixelOperator.ttf',
  PIXEL_OPERATOR_BOLD_FONT: 'assets/custom-fonts/pixel_operator/PixelOperator-Bold.ttf',
  MINECRAFT_FONT: 'assets/custom-fonts/minecraft.ttf',
  DOGICA_PIXEL_FONT: 'assets/custom-fonts/dogicapixel.ttf',
  DOGICA_PIXEL_BOLD_FONT: 'assets/custom-fonts/dogicapixelbold.ttf',
  RETRO_GAMING_FONT: 'assets/custom-fonts/Retro Gaming.ttf',
  VHS_GOTHIC_FONT: 'assets/custom-fonts/vhs-gothic.ttf',
  RAINYHEARTS_FONT: 'assets/custom-fonts/rainyhearts.ttf',

  // MSDF Fonts (SDF text rendering)
  PIXEL_OPERATOR8_MSDF_FNT: 'assets/fonts/msdf/PixelOperator8.fnt',
  PIXEL_OPERATOR8_MSDF_PNG: 'assets/fonts/msdf/PixelOperator8-MSDF.png',
  KENVECTOR_FUTURE_MSDF_FNT: 'assets/fonts/msdf/kenvector_future.fnt',
  KENVECTOR_FUTURE_MSDF_PNG: 'assets/fonts/msdf/KenvectorFuture-MSDF.png',

  // UI Pack Space
  UIPACK_SPACE_SHEET: 'assets/ui-pack-scifi/spritesheet/uipackSpace_sheet.png',
  UIPACK_SPACE_JSON: 'assets/ui-pack-scifi/spritesheet/uipackSpace_sheet.json',

  // Square Buttons (Sprout Lands UI)
  SQUARE_BUTTONS_JSON: 'assets/sprout-lands-ui-basic/Sprite sheets/buttons/square-buttons-sheet.json',

  // Emoji Spritesheet
  EMOJI_SPRITESHEET_JSON: 'assets/sprout-lands-ui-basic/emojis-free/emoji-spritesheet.json'
} as const;

export type AssetKey = keyof typeof ASSET_PATHS;

// Create a proxy that resolves paths dynamically based on document location
export const ASSETS: typeof ASSET_PATHS = new Proxy(ASSET_PATHS, {
  get(target, prop: string) {
    if (prop in target) {
      const base = getBasePath();
      return base + target[prop as AssetKey];
    }
    return undefined;
  }
}) as typeof ASSET_PATHS;

