import PIXI from 'pixi.js';
import { ButtonState } from './ui-button';
import { UIPanel } from './ui-panel';

/**
 * Strategy interface for button background rendering
 *
 * @category UI
 */
export interface ButtonBackgroundStrategy {
  /**
   * Creates and returns the background container
   */
  create(width: number, height: number): PIXI.Container;

  /**
   * Updates the visual state of the background
   */
  updateState(state: ButtonState): void;

  /**
   * Gets the actual rendered height of the background
   */
  getActualHeight(): number;

  /**
   * Cleans up resources
   */
  destroy(): void;
}

/**
 * Solid color background strategy using UIPanel
 *
 * @category UI
 */
export class SolidColorBackgroundStrategy implements ButtonBackgroundStrategy {
  private panel?: UIPanel;
  private normalColor: number;
  private hoverColor: number;
  private pressedColor: number;
  private disabledColor: number;
  private width: number;
  private height: number;
  private borderRadius: number;

  constructor(
    backgroundColor: number,
    width: number,
    height: number,
    borderRadius: number
  ) {
    this.normalColor = backgroundColor;
    this.hoverColor = this.darkenColor(backgroundColor, 0.9);
    this.pressedColor = this.darkenColor(backgroundColor, 0.8);
    this.disabledColor = 0x888888;
    this.width = width;
    this.height = height;
    this.borderRadius = borderRadius;
  }

  create(width: number, height: number): PIXI.Container {
    this.panel = new UIPanel({
      backgroundColor: this.normalColor,
      width,
      height,
      borderRadius: this.borderRadius
    });

    this.panel.layout(width, height);
    return this.panel.container;
  }

  updateState(state: ButtonState): void {
    if (!this.panel) return;

    let color: number;
    switch (state) {
      case ButtonState.Normal:
        color = this.normalColor;
        break;
      case ButtonState.Hover:
        color = this.hoverColor;
        break;
      case ButtonState.Pressed:
        color = this.pressedColor;
        break;
      case ButtonState.Disabled:
        color = this.disabledColor;
        break;
    }

    this.panel.setBackgroundColor(color);
  }

  getActualHeight(): number {
    return this.height;
  }

  destroy(): void {
    // UIPanel cleanup handled by container
  }

  private darkenColor(color: number, factor: number): number {
    const r = ((color >> 16) & 0xff) * factor;
    const g = ((color >> 8) & 0xff) * factor;
    const b = (color & 0xff) * factor;
    return ((r << 16) | (g << 8) | b) >>> 0;
  }
}

/**
 * Configuration for icon overlays
 *
 * @category UI
 */
export interface IconConfig {
  /** Spritesheet containing the icon texture */
  spritesheet: PIXI.Spritesheet;
  /** Texture name in the spritesheet */
  textureName: string;
  /** Icon scale (default: 1.0) */
  scale?: number;
  /** Use pixel-perfect rendering */
  pixelPerfect?: boolean;
}

/**
 * Configuration for sprite-based backgrounds
 *
 * @category UI
 */
export interface SpriteBackgroundConfig {
  /** Spritesheet containing the button textures */
  spritesheet: PIXI.Spritesheet;
  /** Texture name pattern - use {color} placeholder. Example: "barHorizontal_{color}_left.png" */
  texturePattern: string;
  /** Color variant to use (e.g., 'blue', 'green', 'red') */
  color: string;
  /** Use pixel-perfect rendering (nearest neighbor) */
  pixelPerfect?: boolean;
  /** Use 9-slice rendering instead of three-piece horizontal */
  useNineSlice?: boolean;
  /** 9-slice border widths (left, top, right, bottom) - required if useNineSlice is true */
  nineSliceBorders?: { left: number; top: number; right: number; bottom: number };
  /** Texture name for pressed/down state - use {color} placeholder if needed */
  pressedTexturePattern?: string;
  /** Icon configuration for overlay */
  icon?: IconConfig;
}

/**
 * Sprite-based background strategy using three-piece horizontal textures or 9-slice
 *
 * @category UI
 */
export class SpriteBackgroundStrategy implements ButtonBackgroundStrategy {
  private container?: PIXI.Container;
  private spriteLeft?: PIXI.Sprite;
  private spriteMid?: PIXI.Sprite;
  private spriteRight?: PIXI.Sprite;
  private nineSliceSprite?: PIXI.NineSliceSprite;
  private nineSliceSpritePressed?: PIXI.NineSliceSprite;
  private iconSprite?: PIXI.Sprite;
  private config: SpriteBackgroundConfig;
  private width: number;
  private height: number;

  constructor(config: SpriteBackgroundConfig, width: number, height: number) {
    this.config = config;
    this.width = width;
    this.height = height;
  }

  create(width: number, height: number): PIXI.Container {
    this.container = new PIXI.Container();
    const { spritesheet, texturePattern, color, pixelPerfect, useNineSlice, nineSliceBorders, pressedTexturePattern, icon } = this.config;

    // Set pixel-perfect rendering if requested
    if (pixelPerfect && spritesheet.textureSource) {
      spritesheet.textureSource.scaleMode = 'nearest';
    }

    if (useNineSlice && nineSliceBorders) {
      // Use 9-slice sprite
      const textureName = texturePattern.includes('{color}')
        ? texturePattern.replace('{color}', color)
        : texturePattern;
      const texture = spritesheet.textures[textureName];

      this.nineSliceSprite = new PIXI.NineSliceSprite({
        texture,
        leftWidth: nineSliceBorders.left,
        topHeight: nineSliceBorders.top,
        rightWidth: nineSliceBorders.right,
        bottomHeight: nineSliceBorders.bottom,
        width,
        height
      });

      this.container.addChild(this.nineSliceSprite);

      // Create pressed state sprite if provided
      if (pressedTexturePattern) {
        const pressedTextureName = pressedTexturePattern.includes('{color}')
          ? pressedTexturePattern.replace('{color}', color)
          : pressedTexturePattern;
        const pressedTexture = spritesheet.textures[pressedTextureName];

        this.nineSliceSpritePressed = new PIXI.NineSliceSprite({
          texture: pressedTexture,
          leftWidth: nineSliceBorders.left,
          topHeight: nineSliceBorders.top,
          rightWidth: nineSliceBorders.right,
          bottomHeight: nineSliceBorders.bottom,
          width,
          height
        });

        // Offset pressed state down by 4 pixels to match the bevel height
        this.nineSliceSpritePressed.y = 4;
        this.nineSliceSpritePressed.visible = false;
        this.container.addChild(this.nineSliceSpritePressed);
      }
    } else {
      // Use three-piece horizontal sprites
      const leftTextureName = this.getTextureName(texturePattern, color, 'left');
      const midTextureName = this.getTextureName(texturePattern, color, 'mid');
      const rightTextureName = this.getTextureName(texturePattern, color, 'right');

      this.spriteLeft = new PIXI.Sprite(spritesheet.textures[leftTextureName]);
      this.spriteMid = new PIXI.Sprite(spritesheet.textures[midTextureName]);
      this.spriteRight = new PIXI.Sprite(spritesheet.textures[rightTextureName]);

      // Scale to match button height
      const scaleY = height / this.spriteLeft.height;
      this.spriteLeft.scale.y = scaleY;
      this.spriteMid.scale.y = scaleY;
      this.spriteRight.scale.y = scaleY;

      // Position sprites horizontally
      this.spriteLeft.x = 0;

      const middleWidth = width - this.spriteLeft.width - this.spriteRight.width;
      this.spriteMid.width = middleWidth;
      this.spriteMid.x = this.spriteLeft.width;

      this.spriteRight.x = this.spriteLeft.width + middleWidth;

      // Add to container
      this.container.addChild(this.spriteLeft);
      this.container.addChild(this.spriteMid);
      this.container.addChild(this.spriteRight);
    }

    // Add icon if provided
    if (icon) {
      const iconTexture = icon.spritesheet.textures[icon.textureName];
      this.iconSprite = new PIXI.Sprite(iconTexture);

      if (icon.pixelPerfect && icon.spritesheet.textureSource) {
        icon.spritesheet.textureSource.scaleMode = 'nearest';
      }

      if (icon.scale) {
        this.iconSprite.scale.set(icon.scale);
      }

      // Center the icon
      this.iconSprite.anchor.set(0.5);
      this.iconSprite.x = width / 2;
      this.iconSprite.y = height / 2;

      this.container.addChild(this.iconSprite);
    }

    return this.container;
  }

  updateState(state: ButtonState): void {
    // Handle up/down state switching for 9-slice sprites
    if (this.nineSliceSprite && this.nineSliceSpritePressed) {
      const isPressed = state === ButtonState.Pressed;
      this.nineSliceSprite.visible = !isPressed;
      this.nineSliceSpritePressed.visible = isPressed;

      // Offset icon when pressed
      if (this.iconSprite) {
        this.iconSprite.y = (this.height / 2) + (isPressed ? 4 : 0);
      }
    } else {
      // Use tinting for states when no pressed texture is available
      let tint: number;
      switch (state) {
        case ButtonState.Normal:
          tint = 0xffffff;
          break;
        case ButtonState.Hover:
          tint = 0xcccccc;
          break;
        case ButtonState.Pressed:
          tint = 0x999999;
          break;
        case ButtonState.Disabled:
          tint = 0x888888;
          break;
      }

      if (this.nineSliceSprite) {
        this.nineSliceSprite.tint = tint;
      } else if (this.spriteLeft && this.spriteMid && this.spriteRight) {
        this.spriteLeft.tint = tint;
        this.spriteMid.tint = tint;
        this.spriteRight.tint = tint;
      }
    }
  }

  getActualHeight(): number {
    if (this.nineSliceSprite) {
      return this.nineSliceSprite.height;
    }
    return this.spriteLeft?.height ?? this.height;
  }

  destroy(): void {
    this.container?.destroy({ children: true });
  }

  private getTextureName(pattern: string, color: string, part: 'left' | 'mid' | 'right'): string {
    // Replace {color} placeholder and ensure correct part
    let name = pattern.replace('{color}', color);

    // Replace any existing part suffix with the desired one
    name = name.replace(/_(?:left|mid|right)\.png$/, `_${part}.png`);

    return name;
  }
}
