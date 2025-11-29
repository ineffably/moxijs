/**
 * Sprite-based Buttons Example
 * Demonstrates how to create buttons using sprite sheet assets
 */
import * as PIXI from 'pixi.js';
import {
  EdgeInsets,
  FlexContainer,
  FlexDirection,
  FlexJustify,
  FlexAlign,
  UIComponent
} from '@moxijs/core';
import { ASSETS } from '../../assets-config';

/**
 * Creates a custom button using horizontal bar sprites (left, mid, right)
 */
function createSpriteButton(
  color: 'blue' | 'green' | 'red' | 'yellow' | 'white',
  label: string,
  width: number = 120
): PIXI.Container {
  const container = new PIXI.Container();

  // Get the spritesheet using the alias we loaded it with
  const sheet = PIXI.Assets.get('uipackSpace') as PIXI.Spritesheet;

  // Create the three parts of the button
  const leftSprite = new PIXI.Sprite(sheet.textures[`barHorizontal_${color}_left.png`]);
  const midSprite = new PIXI.Sprite(sheet.textures[`barHorizontal_${color}_mid.png`]);
  const rightSprite = new PIXI.Sprite(sheet.textures[`barHorizontal_${color}_right.png`]);

  // Position the sprites
  leftSprite.x = 0;

  // Calculate middle section width
  const middleWidth = width - leftSprite.width - rightSprite.width;
  midSprite.width = middleWidth;
  midSprite.x = leftSprite.width;

  rightSprite.x = leftSprite.width + middleWidth;

  // Add to container
  container.addChild(leftSprite);
  container.addChild(midSprite);
  container.addChild(rightSprite);

  // Create BitmapText label
  const bitmapText = new PIXI.BitmapText({
    text: label,
    style: {
      fontFamily: 'Kenney Future',
      fontSize: 16,
      fill: 0xffffff
    }
  });

  // Center the text
  bitmapText.x = (width - bitmapText.width) / 2;
  bitmapText.y = (leftSprite.height - bitmapText.height) / 2;

  container.addChild(bitmapText);

  // Make it interactive
  container.eventMode = 'static';
  container.cursor = 'pointer';

  // Add hover effect
  container.on('pointerover', () => {
    container.alpha = 0.8;
  });

  container.on('pointerout', () => {
    container.alpha = 1;
  });

  container.on('pointerdown', () => {
    container.y += 2;
  });

  container.on('pointerup', () => {
    container.y -= 2;
    console.log(`${label} clicked!`);
  });

  container.on('pointerupoutside', () => {
    container.y -= 2;
  });

  return container;
}

export async function createSpriteButtonsShowcase(): Promise<UIComponent> {
  // Load the spritesheet
  await PIXI.Assets.load({
    alias: 'uipackSpace',
    src: ASSETS.UIPACK_SPACE_JSON
  });

  const sheet = PIXI.Assets.get('uipackSpace') as PIXI.Spritesheet;

  // Load the bitmap font
  await PIXI.Assets.load({
    alias: 'kenneyFuture',
    src: ASSETS.KENNEY_FUTURE_FONT,
    data: {
      family: 'Kenney Future'
    }
  });

  // Create main container
  const mainContainer = new FlexContainer({
    direction: FlexDirection.Column,
    justify: FlexJustify.Start,
    align: FlexAlign.Start,
    gap: 30,
    padding: EdgeInsets.all(40),
    width: 1280,
    height: 672
  });

  // Section: Sprite-based Buttons
  const section = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 20
  });

  // Title
  const titleText = new PIXI.BitmapText({
    text: 'Sprite-Based Buttons (with BitmapText)',
    style: {
      fontFamily: 'Kenney Future',
      fontSize: 18,
      fill: 0xffffff
    }
  });
  const titleContainer = new PIXI.Container();
  titleContainer.addChild(titleText);
  section.container.addChild(titleContainer);

  // Row 1: Different colors
  const row1 = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 15,
    padding: EdgeInsets.symmetric(10, 0)
  });

  const blueBtn = createSpriteButton('blue', 'Blue', 120);
  const greenBtn = createSpriteButton('green', 'Green', 120);
  const redBtn = createSpriteButton('red', 'Red', 120);

  row1.container.addChild(blueBtn);
  row1.container.addChild(greenBtn);
  row1.container.addChild(redBtn);

  section.addChild(row1);

  // Row 2: More colors
  const row2 = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 15,
    padding: EdgeInsets.symmetric(10, 0)
  });

  const yellowBtn = createSpriteButton('yellow', 'Yellow', 120);
  const whiteBtn = createSpriteButton('white', 'White', 120);

  row2.container.addChild(yellowBtn);
  row2.container.addChild(whiteBtn);

  section.addChild(row2);

  // Row 3: Different widths
  const row3 = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 15,
    padding: EdgeInsets.symmetric(10, 0)
  });

  const smallBtn = createSpriteButton('blue', 'Small', 80);
  const mediumBtn = createSpriteButton('green', 'Medium', 120);
  const largeBtn = createSpriteButton('red', 'Large Button', 160);

  row3.container.addChild(smallBtn);
  row3.container.addChild(mediumBtn);
  row3.container.addChild(largeBtn);

  section.addChild(row3);

  mainContainer.addChild(section);

  return mainContainer;
}
