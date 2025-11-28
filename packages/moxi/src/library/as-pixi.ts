import PIXI from 'pixi.js';

/**
 * Options for creating a BitmapText instance
 */
export interface BitmapTextOptions {
  text?: string | number | { toString: () => string };
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: string;
    fill?: number | string;
    [key: string]: any;
  };
  pixelPerfect?: boolean; // Enable pixel-perfect rendering (roundPixels)
  [key: string]: any;
}

/**
 * Options for creating a Sprite instance
 */
export interface SpriteOptions {
  texture?: PIXI.Texture | PIXI.TextureSource;
  [key: string]: any;
}

/**
 * Options for creating a Text instance
 */
export interface TextOptions {
  text?: string | number | { toString: () => string };
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: string;
    fill?: number | string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Common properties that can be applied to PIXI display objects
 */
export interface PixiProps {
  x?: number;
  y?: number;
  anchor?: { x?: number; y?: number } | number;
  scale?: { x?: number; y?: number } | number;
  rotation?: number;
  tint?: number;
  alpha?: number;
  visible?: boolean;
  eventMode?: 'none' | 'passive' | 'auto' | 'static' | 'dynamic';
  pivot?: { x?: number; y?: number } | number;
}

/**
 * Applies common properties to a PIXI display object
 */
function applyProps<T extends PIXI.Container>(obj: T, props?: PixiProps): T {
  if (!props) return obj;

  if (props.x !== undefined) obj.x = props.x;
  if (props.y !== undefined) obj.y = props.y;
  
  if (props.anchor !== undefined) {
    if (typeof props.anchor === 'number') {
      if ('anchor' in obj && typeof obj.anchor === 'object' && obj.anchor !== null) {
        (obj.anchor as PIXI.ObservablePoint).set(props.anchor);
      }
    } else {
      if ('anchor' in obj && typeof obj.anchor === 'object' && obj.anchor !== null) {
        const anchor = obj.anchor as PIXI.ObservablePoint;
        if (props.anchor.x !== undefined) anchor.x = props.anchor.x;
        if (props.anchor.y !== undefined) anchor.y = props.anchor.y;
      }
    }
  }

  if (props.scale !== undefined) {
    if (typeof props.scale === 'number') {
      if ('scale' in obj && typeof obj.scale === 'object' && obj.scale !== null) {
        (obj.scale as PIXI.ObservablePoint).set(props.scale);
      }
    } else {
      if ('scale' in obj && typeof obj.scale === 'object' && obj.scale !== null) {
        const scale = obj.scale as PIXI.ObservablePoint;
        if (props.scale.x !== undefined) scale.x = props.scale.x;
        if (props.scale.y !== undefined) scale.y = props.scale.y;
      }
    }
  }

  if (props.rotation !== undefined) obj.rotation = props.rotation;
  if (props.tint !== undefined && 'tint' in obj) (obj as any).tint = props.tint;
  if (props.alpha !== undefined) obj.alpha = props.alpha;
  if (props.visible !== undefined) obj.visible = props.visible;
  if (props.eventMode !== undefined && 'eventMode' in obj) obj.eventMode = props.eventMode;

  if (props.pivot !== undefined) {
    if (typeof props.pivot === 'number') {
      if ('pivot' in obj && typeof obj.pivot === 'object' && obj.pivot !== null) {
        (obj.pivot as PIXI.ObservablePoint).set(props.pivot);
      }
    } else {
      if ('pivot' in obj && typeof obj.pivot === 'object' && obj.pivot !== null) {
        const pivot = obj.pivot as PIXI.ObservablePoint;
        if (props.pivot.x !== undefined) pivot.x = props.pivot.x;
        if (props.pivot.y !== undefined) pivot.y = props.pivot.y;
      }
    }
  }

  return obj;
}

/**
 * Creates a BitmapText instance with constructor args and optional properties
 *
 * @example
 * ```typescript
 * const label = asBitmapText(
 *   { text: 'Hello', style: { fontFamily: 'Arial', fontSize: 24 }, pixelPerfect: true },
 *   { x: 100, y: 50, anchor: 0.5 }
 * );
 * ```
 */
export function asBitmapText(
  constructorArgs: BitmapTextOptions,
  props?: PixiProps
): PIXI.BitmapText {
  const { pixelPerfect, ...textArgs } = constructorArgs;
  const text = new PIXI.BitmapText(textArgs as any);

  // Apply pixel-perfect rendering if requested
  if (pixelPerfect) {
    text.roundPixels = true;
  }

  return applyProps(text, props);
}

/**
 * Creates a Sprite instance with constructor args and optional properties
 * 
 * @example
 * ```typescript
 * const sprite = asSprite(
 *   { texture },
 *   { x: 100, y: 100, anchor: 0.5 }
 * );
 * ```
 */
export function asSprite(
  constructorArgs: SpriteOptions,
  props?: PixiProps
): PIXI.Sprite {
  const sprite = new PIXI.Sprite(constructorArgs as any);
  return applyProps(sprite, props);
}

/**
 * Creates a Text instance with constructor args and optional properties
 * 
 * @example
 * ```typescript
 * const text = asText(
 *   { text: 'Hello', style: { fontFamily: 'Arial', fontSize: 24 } },
 *   { x: 100, y: 50 }
 * );
 * ```
 */
export function asText(
  constructorArgs: TextOptions,
  props?: PixiProps
): PIXI.Text {
  const text = new PIXI.Text(constructorArgs as any);
  return applyProps(text, props);
}

/**
 * Creates a Graphics instance with optional properties
 * 
 * @example
 * ```typescript
 * const graphics = asGraphics({ x: 100, y: 100 });
 * graphics.rect(0, 0, 50, 50).fill(0xff0000);
 * ```
 */
export function asGraphics(props?: PixiProps): PIXI.Graphics {
  const graphics = new PIXI.Graphics();
  return applyProps(graphics, props);
}

/**
 * Creates a Container instance with optional properties
 * 
 * @example
 * ```typescript
 * const container = asContainer({ x: 100, y: 100 });
 * ```
 */
export function asContainer(props?: PixiProps): PIXI.Container {
  const container = new PIXI.Container();
  return applyProps(container, props);
}

