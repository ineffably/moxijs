/**
 * Buttons Showcase Tab
 * Demonstrates different ways to style and create buttons
 *
 * Uses MSDF (Multi-channel Signed Distance Field) text rendering
 * for crisp text at any scale.
 */
import * as PIXI from 'pixi.js';
import {
  EdgeInsets,
  FlexContainer,
  FlexDirection,
  FlexJustify,
  FlexAlign,
  UIBox,
  UIButton,
  UILabel,
  UIComponent,
  UIFontConfig
} from '@moxijs/ui';
import { ASSETS } from '../../assets-config';

export async function createButtonsShowcase(fontConfig?: UIFontConfig): Promise<UIComponent> {
  // Load the spritesheet with pixel-perfect settings
  await PIXI.Assets.load({
    alias: 'uipackSpace',
    src: ASSETS.UIPACK_SPACE_JSON,
    data: {
      scaleMode: PIXI.SCALE_MODES.NEAREST
    }
  });

  // Also set the base texture to nearest neighbor filtering for pixel-perfect rendering
  const sheet = PIXI.Assets.get('uipackSpace') as PIXI.Spritesheet;
  if (sheet?.textureSource) {
    sheet.textureSource.scaleMode = 'nearest';
  }

  // Load the square buttons spritesheet
  await PIXI.Assets.load({
    alias: 'squareButtons',
    src: ASSETS.SQUARE_BUTTONS_JSON,
    data: {
      scaleMode: PIXI.SCALE_MODES.NEAREST
    }
  });

  const squareSheet = PIXI.Assets.get('squareButtons') as PIXI.Spritesheet;
  if (squareSheet?.textureSource) {
    squareSheet.textureSource.scaleMode = 'nearest';
  }

  // Load the emoji spritesheet
  await PIXI.Assets.load({
    alias: 'emojiSheet',
    src: ASSETS.EMOJI_SPRITESHEET_JSON,
    data: {
      scaleMode: PIXI.SCALE_MODES.NEAREST
    }
  });

  const emojiSheet = PIXI.Assets.get('emojiSheet') as PIXI.Spritesheet;
  if (emojiSheet?.textureSource) {
    emojiSheet.textureSource.scaleMode = 'nearest';
  }

  // Load the bitmap font
  await PIXI.Assets.load({
    alias: 'kenneyFuture',
    src: ASSETS.KENNEY_FUTURE_FONT,
    data: {
      family: 'Kenney Future'
    }
  });

  // Create main container with vertical layout
  // Set fontConfig here so all children inherit MSDF font settings
  const mainContainer = new FlexContainer({
    direction: FlexDirection.Column,
    justify: FlexJustify.Start,
    align: FlexAlign.Start,
    gap: 30,
    padding: EdgeInsets.all(40),
    width: 1280,
    height: 800,
    fontConfig: fontConfig
  });

  // Create row container for two columns
  const columnsRow = new FlexContainer({
    direction: FlexDirection.Row,
    justify: FlexJustify.Start,
    align: FlexAlign.Start,
    gap: 40
  });

  // Left column
  const leftColumn = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 30,
    width: 580
  });

  // Right column
  const rightColumn = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 30,
    width: 580
  });

  // Section 1: Basic Buttons
  const section1 = createSection('Basic Buttons');
  const basicRow = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 15,
    padding: EdgeInsets.symmetric(10, 0)
  });

  // Primary button
  const primaryBtn = new UIButton({
    label: 'Primary',
    width: 120,
    height: 40,
    backgroundColor: 0x4a90e2,
    textColor: 0xffffff,
    borderRadius: 6,
    onClick: () => console.log('Primary clicked')
  });

  // Secondary button
  const secondaryBtn = new UIButton({
    label: 'Secondary',
    width: 140, // Increased for PixelOperator8 font
    height: 40,
    backgroundColor: 0x6c757d,
    textColor: 0xffffff,
    borderRadius: 6,
    onClick: () => console.log('Secondary clicked')
  });

  // Success button
  const successBtn = new UIButton({
    label: 'Success',
    width: 120,
    height: 40,
    backgroundColor: 0x28a745,
    textColor: 0xffffff,
    borderRadius: 6,
    onClick: () => console.log('Success clicked')
  });

  // Danger button
  const dangerBtn = new UIButton({
    label: 'Danger',
    width: 120,
    height: 40,
    backgroundColor: 0xdc3545,
    textColor: 0xffffff,
    borderRadius: 6,
    onClick: () => console.log('Danger clicked')
  });

  basicRow.addChild(primaryBtn);
  basicRow.addChild(secondaryBtn);
  basicRow.addChild(successBtn);
  basicRow.addChild(dangerBtn);

  section1.addChild(basicRow);
  leftColumn.addChild(section1);

  // Section 2: Rounded Buttons
  const section2 = createSection('Rounded Buttons');
  const roundedRow = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 15,
    padding: EdgeInsets.symmetric(10, 0)
  });

  const roundedBtn1 = new UIButton({
    label: 'Pill Button',
    width: 160, // Increased for PixelOperator8 font
    height: 40,
    backgroundColor: 0x9b59b6,
    textColor: 0xffffff,
    borderRadius: 20,
    onClick: () => console.log('Pill clicked')
  });

  const roundedBtn2 = new UIButton({
    label: 'Rounded',
    width: 130, // Increased for PixelOperator8 font
    height: 40,
    backgroundColor: 0xe74c3c,
    textColor: 0xffffff,
    borderRadius: 15,
    onClick: () => console.log('Rounded clicked')
  });

  const roundedBtn3 = new UIButton({
    label: 'Smooth',
    width: 120,
    height: 40,
    backgroundColor: 0x3498db,
    textColor: 0xffffff,
    borderRadius: 10,
    onClick: () => console.log('Smooth clicked')
  });

  roundedRow.addChild(roundedBtn1);
  roundedRow.addChild(roundedBtn2);
  roundedRow.addChild(roundedBtn3);

  section2.addChild(roundedRow);
  leftColumn.addChild(section2);

  // Section 3: Size Variations
  const section3 = createSection('Size Variations');
  const sizeRow = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 15,
    align: FlexAlign.Center,
    padding: EdgeInsets.symmetric(10, 0)
  });

  const smallBtn = new UIButton({
    label: 'Small',
    width: 80,
    height: 30,
    backgroundColor: 0x16a085,
    textColor: 0xffffff,
    fontSize: 12,
    borderRadius: 6, // Uniform border radius
    onClick: () => console.log('Small clicked')
  });

  const mediumBtn = new UIButton({
    label: 'Medium',
    width: 120,
    height: 40,
    backgroundColor: 0x16a085,
    textColor: 0xffffff,
    fontSize: 16,
    borderRadius: 6, // Uniform border radius
    onClick: () => console.log('Medium clicked')
  });

  const largeBtn = new UIButton({
    label: 'Large',
    width: 160,
    height: 50,
    backgroundColor: 0x16a085,
    textColor: 0xffffff,
    fontSize: 20,
    borderRadius: 6, // Uniform border radius
    onClick: () => console.log('Large clicked')
  });

  sizeRow.addChild(smallBtn);
  sizeRow.addChild(mediumBtn);
  sizeRow.addChild(largeBtn);

  section3.addChild(sizeRow);
  leftColumn.addChild(section3);

  // Section 4: Modern Color Schemes
  const section4 = createSection('Modern Color Schemes');
  const modernRow = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 15,
    padding: EdgeInsets.symmetric(10, 0)
  });

  const modernBtn1 = new UIButton({
    label: 'Sunset',
    width: 120,
    height: 40,
    backgroundColor: 0xff6b6b,
    textColor: 0xffffff,
    borderRadius: 6, // Uniform border radius
    onClick: () => console.log('Sunset clicked')
  });

  const modernBtn2 = new UIButton({
    label: 'Ocean',
    width: 120,
    height: 40,
    backgroundColor: 0x4ecdc4,
    textColor: 0xffffff,
    borderRadius: 6, // Uniform border radius
    onClick: () => console.log('Ocean clicked')
  });

  const modernBtn3 = new UIButton({
    label: 'Lavender',
    width: 140, // Increased for PixelOperator8 font
    height: 40,
    backgroundColor: 0xb19cd9,
    textColor: 0xffffff,
    borderRadius: 6, // Uniform border radius
    onClick: () => console.log('Lavender clicked')
  });

  modernRow.addChild(modernBtn1);
  modernRow.addChild(modernBtn2);
  modernRow.addChild(modernBtn3);

  section4.addChild(modernRow);
  rightColumn.addChild(section4);

  // Get the spritesheet for sprite buttons
  const spriteSheet = PIXI.Assets.get('uipackSpace') as PIXI.Spritesheet;

  // Section 5: Sprite-based Buttons
  const section5 = createSection('Sprite-Based Buttons (with BitmapText)');

  // Row 1: Different colors
  const spriteRow1 = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 15,
    padding: EdgeInsets.symmetric(10, 0)
  });

  const blueBtn = new UIButton({
    label: 'Blue',
    width: 120,
    height: 40,
    spriteBackground: {
      spritesheet: spriteSheet,
      texturePattern: 'barHorizontal_{color}_left.png',
      color: 'blue',
      pixelPerfect: true
    },
    useBitmapText: true,
    bitmapFontFamily: 'Kenney Future',
    textColor: 0xffffff,
    onClick: () => console.log('Blue clicked!')
  });

  const greenBtn = new UIButton({
    label: 'Green',
    width: 120,
    height: 40,
    spriteBackground: {
      spritesheet: spriteSheet,
      texturePattern: 'barHorizontal_{color}_left.png',
      color: 'green',
      pixelPerfect: true
    },
    useBitmapText: true,
    bitmapFontFamily: 'Kenney Future',
    textColor: 0xffffff,
    onClick: () => console.log('Green clicked!')
  });

  const redBtn = new UIButton({
    label: 'Red',
    width: 120,
    height: 40,
    spriteBackground: {
      spritesheet: spriteSheet,
      texturePattern: 'barHorizontal_{color}_left.png',
      color: 'red',
      pixelPerfect: true
    },
    useBitmapText: true,
    bitmapFontFamily: 'Kenney Future',
    textColor: 0xffffff,
    onClick: () => console.log('Red clicked!')
  });

  spriteRow1.addChild(blueBtn);
  spriteRow1.addChild(greenBtn);
  spriteRow1.addChild(redBtn);

  section5.addChild(spriteRow1);

  // Row 2: More colors
  const spriteRow2 = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 15,
    padding: EdgeInsets.symmetric(10, 0)
  });

  const yellowBtn = new UIButton({
    label: 'Yellow',
    width: 120,
    height: 40,
    spriteBackground: {
      spritesheet: spriteSheet,
      texturePattern: 'barHorizontal_{color}_left.png',
      color: 'yellow',
      pixelPerfect: true
    },
    useBitmapText: true,
    bitmapFontFamily: 'Kenney Future',
    textColor: 0xffffff,
    onClick: () => console.log('Yellow clicked!')
  });

  const whiteBtn = new UIButton({
    label: 'White',
    width: 120,
    height: 40,
    spriteBackground: {
      spritesheet: spriteSheet,
      texturePattern: 'barHorizontal_{color}_left.png',
      color: 'white',
      pixelPerfect: true
    },
    useBitmapText: true,
    bitmapFontFamily: 'Kenney Future',
    textColor: 0x000000, // Black text for white button
    onClick: () => console.log('White clicked!')
  });

  spriteRow2.addChild(yellowBtn);
  spriteRow2.addChild(whiteBtn);

  section5.addChild(spriteRow2);

  // Row 3: Different sizes (width and height)
  const spriteRow3 = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 15,
    align: FlexAlign.Center,
    padding: EdgeInsets.symmetric(10, 0)
  });

  const smallSpriteBtn = new UIButton({
    label: 'Small',
    width: 80,
    height: 30,
    spriteBackground: {
      spritesheet: spriteSheet,
      texturePattern: 'barHorizontal_{color}_left.png',
      color: 'blue',
      pixelPerfect: true
    },
    useBitmapText: true,
    bitmapFontFamily: 'Kenney Future',
    fontSize: 12,
    textColor: 0xffffff,
    onClick: () => console.log('Small clicked!')
  });

  const mediumSpriteBtn = new UIButton({
    label: 'Medium',
    width: 120,
    height: 40,
    spriteBackground: {
      spritesheet: spriteSheet,
      texturePattern: 'barHorizontal_{color}_left.png',
      color: 'green',
      pixelPerfect: true
    },
    useBitmapText: true,
    bitmapFontFamily: 'Kenney Future',
    fontSize: 14,
    textColor: 0xffffff,
    onClick: () => console.log('Medium clicked!')
  });

  const largeSpriteBtn = new UIButton({
    label: 'Large Button',
    width: 240, // Increased for PixelOperator8 font
    height: 50,
    spriteBackground: {
      spritesheet: spriteSheet,
      texturePattern: 'barHorizontal_{color}_left.png',
      color: 'red',
      pixelPerfect: true
    },
    useBitmapText: true,
    bitmapFontFamily: 'Kenney Future',
    fontSize: 20,
    textColor: 0xffffff,
    onClick: () => console.log('Large clicked!')
  });

  spriteRow3.addChild(smallSpriteBtn);
  spriteRow3.addChild(mediumSpriteBtn);
  spriteRow3.addChild(largeSpriteBtn);

  section5.addChild(spriteRow3);

  rightColumn.addChild(section5);

  // Section 6: 9-Slice Square Buttons
  const section6 = createSection('9-Slice Square Buttons (Single Texture)');
  const squareRow = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 15,
    padding: EdgeInsets.symmetric(10, 0)
  });

  const greyBtn = new UIButton({
    label: 'Grey',
    width: 90,
    height: 68,
    spriteBackground: {
      spritesheet: squareSheet,
      texturePattern: 'square_grey_up.png',
      pressedTexturePattern: 'square_grey_down.png',
      color: '',
      pixelPerfect: true,
      useNineSlice: true,
      nineSliceBorders: { left: 16, top: 16, right: 16, bottom: 20 }
    },
    fontSize: 12,
    textColor: 0x333333,
    onClick: () => console.log('Grey clicked!')
  });

  const beigeBtn = new UIButton({
    label: 'Beige',
    width: 110,
    height: 76,
    spriteBackground: {
      spritesheet: squareSheet,
      texturePattern: 'square_beige_up.png',
      pressedTexturePattern: 'square_beige_down.png',
      color: '',
      pixelPerfect: true,
      useNineSlice: true,
      nineSliceBorders: { left: 16, top: 16, right: 16, bottom: 20 }
    },
    fontSize: 14,
    textColor: 0x4a3728,
    onClick: () => console.log('Beige clicked!')
  });

  const brownBtn = new UIButton({
    label: 'Brown',
    width: 150,
    height: 88,
    spriteBackground: {
      spritesheet: squareSheet,
      texturePattern: 'square_brown_up.png',
      pressedTexturePattern: 'square_brown_down.png',
      color: '',
      pixelPerfect: true,
      useNineSlice: true,
      nineSliceBorders: { left: 16, top: 16, right: 16, bottom: 20 }
    },
    fontSize: 16,
    textColor: 0xf5deb3,
    onClick: () => console.log('Brown clicked!')
  });

  squareRow.addChild(greyBtn);
  squareRow.addChild(beigeBtn);
  squareRow.addChild(brownBtn);

  section6.addChild(squareRow);
  leftColumn.addChild(section6);

  // Section 7: Square Icon Buttons
  const section7 = createSection('Square Icon Buttons');
  const iconRow = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 15,
    padding: EdgeInsets.symmetric(10, 0)
  });

  const iconBtn1 = new UIButton({
    width: 64,
    height: 68,
    spriteBackground: {
      spritesheet: squareSheet,
      texturePattern: 'square_grey_up.png',
      pressedTexturePattern: 'square_grey_down.png',
      color: '',
      pixelPerfect: true,
      useNineSlice: true,
      nineSliceBorders: { left: 16, top: 16, right: 16, bottom: 20 },
      icon: {
        spritesheet: emojiSheet,
        textureName: 'emoji_0_7.png',
        scale: 0.8,
        pixelPerfect: true
      }
    },
    onClick: () => console.log('Icon button 1 clicked!')
  });

  const iconBtn2 = new UIButton({
    width: 64,
    height: 68,
    spriteBackground: {
      spritesheet: squareSheet,
      texturePattern: 'square_beige_up.png',
      pressedTexturePattern: 'square_beige_down.png',
      color: '',
      pixelPerfect: true,
      useNineSlice: true,
      nineSliceBorders: { left: 16, top: 16, right: 16, bottom: 20 },
      icon: {
        spritesheet: emojiSheet,
        textureName: 'emoji_1_7.png',
        scale: 0.8,
        pixelPerfect: true
      }
    },
    onClick: () => console.log('Icon button 2 clicked!')
  });

  const iconBtn3 = new UIButton({
    width: 64,
    height: 68,
    spriteBackground: {
      spritesheet: squareSheet,
      texturePattern: 'square_tan_up.png',
      pressedTexturePattern: 'square_tan_down.png',
      color: '',
      pixelPerfect: true,
      useNineSlice: true,
      nineSliceBorders: { left: 16, top: 16, right: 16, bottom: 20 },
      icon: {
        spritesheet: emojiSheet,
        textureName: 'emoji_2_7.png',
        scale: 0.8,
        pixelPerfect: true
      }
    },
    onClick: () => console.log('Icon button 3 clicked!')
  });

  const iconBtn4 = new UIButton({
    width: 64,
    height: 68,
    spriteBackground: {
      spritesheet: squareSheet,
      texturePattern: 'square_brown_up.png',
      pressedTexturePattern: 'square_brown_down.png',
      color: '',
      pixelPerfect: true,
      useNineSlice: true,
      nineSliceBorders: { left: 16, top: 16, right: 16, bottom: 20 },
      icon: {
        spritesheet: emojiSheet,
        textureName: 'emoji_3_7.png',
        scale: 0.8,
        pixelPerfect: true
      }
    },
    onClick: () => console.log('Icon button 4 clicked!')
  });

  iconRow.addChild(iconBtn1);
  iconRow.addChild(iconBtn2);
  iconRow.addChild(iconBtn3);
  iconRow.addChild(iconBtn4);

  section7.addChild(iconRow);
  rightColumn.addChild(section7);

  // Add columns to the columns row
  columnsRow.addChild(leftColumn);
  columnsRow.addChild(rightColumn);

  // Add columns row to main container
  mainContainer.addChild(columnsRow);

  // Set up tab focus navigation
  // Since buttons now default to tabIndex = 0, we need to set explicit order
  // Left column, top to bottom, left to right
  let tabIndex = 0;

  // Section 1: Basic Buttons (4 buttons)
  primaryBtn.tabIndex = tabIndex++;
  secondaryBtn.tabIndex = tabIndex++;
  successBtn.tabIndex = tabIndex++;
  dangerBtn.tabIndex = tabIndex++;

  // Section 2: Rounded Buttons (3 buttons)
  roundedBtn1.tabIndex = tabIndex++;
  roundedBtn2.tabIndex = tabIndex++;
  roundedBtn3.tabIndex = tabIndex++;

  // Section 3: Size Variations (3 buttons)
  smallBtn.tabIndex = tabIndex++;
  mediumBtn.tabIndex = tabIndex++;
  largeBtn.tabIndex = tabIndex++;

  // Section 6: 9-Slice Square Buttons (3 buttons)
  greyBtn.tabIndex = tabIndex++;
  beigeBtn.tabIndex = tabIndex++;
  brownBtn.tabIndex = tabIndex++;

  // Right column, top to bottom, left to right
  // Section 4: Modern Color Schemes (3 buttons)
  modernBtn1.tabIndex = tabIndex++;
  modernBtn2.tabIndex = tabIndex++;
  modernBtn3.tabIndex = tabIndex++;

  // Section 5: Sprite-based Buttons - Row 1 (3 buttons)
  blueBtn.tabIndex = tabIndex++;
  greenBtn.tabIndex = tabIndex++;
  redBtn.tabIndex = tabIndex++;

  // Section 5: Sprite-based Buttons - Row 2 (2 buttons)
  yellowBtn.tabIndex = tabIndex++;
  whiteBtn.tabIndex = tabIndex++;

  // Section 5: Sprite-based Buttons - Row 3 (3 buttons)
  smallSpriteBtn.tabIndex = tabIndex++;
  mediumSpriteBtn.tabIndex = tabIndex++;
  largeSpriteBtn.tabIndex = tabIndex++;

  // Section 7: Square Icon Buttons (4 buttons)
  iconBtn1.tabIndex = tabIndex++;
  iconBtn2.tabIndex = tabIndex++;
  iconBtn3.tabIndex = tabIndex++;
  iconBtn4.tabIndex = tabIndex++;

  // Note: Focus manager is now created and managed at the top level (ui-showcase.ts)
  // It will auto-discover and register all focusable components when the tab is activated

  return mainContainer;
}

function createSection(title: string): FlexContainer {
  const section = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 10
  });

  // msdfFontFamily will be inherited from parent container
  const titleLabel = new UILabel({
    text: title,
    fontSize: 18,
    color: 0xffffff,
    fontWeight: 'bold'
  });

  section.addChild(titleLabel);
  return section;
}
