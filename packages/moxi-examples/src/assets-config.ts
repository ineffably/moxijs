/**
 * Centralized asset configuration
 * Maps asset aliases to their actual paths
 * 
 * Note: Paths use ../assets/ because the built files are in dist/
 * and assets folder is at the project root level
 */

export const ASSETS = {
  // Characters
  ROBOT_IDLE: '../assets/character_robot_idle.png',
  ROBOT_IDLE_JSON: '../assets/character_robot_idle.json',
  SPROUTLANDS_CHARACTER: '../assets/sprout-lands-basic/Characters/Basic Charakter Spritesheet.png',
  SPROUTLANDS_CHARACTER_JSON: '../assets/sprout-lands-basic/Characters/Basic Charakter Spritesheet.json',
  CHICKEN: '../assets/sprout-lands-basic/Characters/Free Chicken Sprites.png',
  COW: '../assets/sprout-lands-basic/Characters/Free Cow Sprites.png',

  // Dinos
  DINO_DOUX: '../assets/dino/doux.png',
  DINO_MORT: '../assets/dino/mort.png',
  DINO_TARD: '../assets/dino/tard.png',
  DINO_VITA: '../assets/dino/vita.png',
  
  // Tiles
  GRASS_TILES: '../assets/sprout-lands-basic/Tilesets/Grass.png',
  WATER_TILES: '../assets/sprout-lands-basic/Tilesets/Water.png',
  HILLS_TILES: '../assets/sprout-lands-basic/Tilesets/Hills.png',
  
  // Objects
  FURNITURE: '../assets/sprout-lands-basic/Objects/Basic_Furniture.png',
  PLANTS: '../assets/sprout-lands-basic/Objects/Basic_Plants.png',
  TOOLS: '../assets/sprout-lands-basic/Objects/Basic_tools_and_meterials.png',
  GRASS_BIOME_THINGS: '../assets/sprout-lands-basic/Objects/Basic_Grass_Biom_things.png',
  
  // Fantasy Theme
  FANTASY_CHARACTER_IDLE: '../assets/LegacyFantasy-HighForest/Character/Idle/Idle-Sheet.png',
  FANTASY_CHARACTER_RUN: '../assets/LegacyFantasy-HighForest/Character/Run/Run-Sheet.png',
  FANTASY_CHARACTER_JUMP: '../assets/LegacyFantasy-HighForest/Character/Jump-All/Jump-All-Sheet.png',
  FANTASY_BACKGROUND: '../assets/LegacyFantasy-HighForest/Background/Background.png',
  FANTASY_TREES: '../assets/LegacyFantasy-HighForest/Assets/Tree-Assets.png',
  
  // Space Theme
  SPACE_NEBULA_BLUE: '../assets/space-backgrounds/Nebula Blue.png',
  SPACE_NEBULA_RED: '../assets/space-backgrounds/Nebula Red.png',
  SPACE_STARS_SMALL: '../assets/space-backgrounds/Stars Small_1.png',
  SPACE_STARS_SMALL_2: '../assets/space-backgrounds/Stars Small_2.png',
  SPACE_SHOOTER_SHEET: '../assets/space-sprite-sheets/space-shooter.png',
  SPACE_SHOOTER_JSON: '../assets/space-sprite-sheets/space-shooter.json',
  SPACE_SHOOTER2_JSON: '../assets/space-sprite-sheets/spaceShooter2_spritesheet.json',
  
  // UI
  UI_BUTTONS: '../assets/ui-pack/png/blue_button00.png',
  UI_PANEL: '../assets/ui-pack/png/blue_panel.png',
  
  // Fonts
  KENNEY_FUTURE_THIN_FONT: '../assets/ui-pack-scifi/font/kenney-future-thin.ttf',
  KENNEY_FUTURE_FONT: '../assets/ui-pack-scifi/font/kenney-future.ttf',
  KENNEY_FUTURE_NARROW_FONT: '../assets/custom-fonts/kenney-future-narrow.ttf',
  KENNEY_BLOCKS_FONT: '../assets/custom-fonts/kenney-blocks.ttf',
  KENNEY_BOLD_FONT: '../assets/custom-fonts/kenney-bold.ttf',
  KENVECTOR_FUTURE_FONT: '../assets/custom-fonts/kenvector_future.ttf',
  KENVECTOR_FUTURE_THIN_FONT: '../assets/custom-fonts/kenvector_future_thin.ttf',
  PIXEL_FONT_SPROUTLANDS: '../assets/sprout-lands-ui-basic/fonts/pixelFont-7-8x14-sproutLands.ttf',

  // UI Pack Space
  UIPACK_SPACE_SHEET: '../assets/ui-pack-scifi/spritesheet/uipackSpace_sheet.png',
  UIPACK_SPACE_JSON: '../assets/ui-pack-scifi/spritesheet/uipackSpace_sheet.json',

  // Square Buttons (Sprout Lands UI)
  SQUARE_BUTTONS_JSON: '../assets/sprout-lands-ui-basic/Sprite sheets/buttons/square-buttons-sheet.json',

  // Emoji Spritesheet
  EMOJI_SPRITESHEET_JSON: '../assets/sprout-lands-ui-basic/emojis-free/emoji-spritesheet.json'
} as const;

export type AssetKey = keyof typeof ASSETS;

