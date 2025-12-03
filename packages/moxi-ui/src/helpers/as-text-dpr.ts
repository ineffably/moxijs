/**
 * DPR-scaled text helper for crisp text rendering
 * Extracted from @moxijs/core/library/as-pixi.ts
 */
import PIXI from 'pixi.js';

/**
 * Options for creating a DPR-scaled Text instance (Canvas 2D with high-DPI rendering)
 */
export interface TextDPROptions {
  text?: string | number | { toString: () => string };
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: string;
    fill?: number | string;
    [key: string]: any;
  };
  /** DPR scale factor - renders at this multiple then scales down (default: 2) */
  dprScale?: number;
  /** Enable pixel-perfect rendering (roundPixels) */
  pixelPerfect?: boolean;
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
 * Creates a Canvas 2D Text instance with DPR (Device Pixel Ratio) scaling for crisp rendering.
 *
 * This renders text at a higher resolution (dprScale × fontSize) then scales it down,
 * resulting in sharper text similar to how Retina displays work.
 *
 * Use this for static text that doesn't change frequently. For dynamic text that
 * updates every frame, use asBitmapText instead for better performance.
 *
 * @example
 * ```typescript
 * // Render at 2× resolution (default)
 * const label = asTextDPR(
 *   { text: 'Hello', style: { fontFamily: 'PixelOperator8', fontSize: 16 } },
 *   { x: 100, y: 50 }
 * );
 *
 * // Render at 4× resolution for even crisper text
 * const crispLabel = asTextDPR(
 *   { text: 'Hello', style: { fontFamily: 'PixelOperator8', fontSize: 16 }, dprScale: 4 },
 *   { x: 100, y: 50 }
 * );
 * ```
 */
export function asTextDPR(
  constructorArgs: TextDPROptions,
  props?: PixiProps
): PIXI.Text {
  const { dprScale = 2, pixelPerfect = true, ...textArgs } = constructorArgs;
  const originalFontSize = textArgs.style?.fontSize || 16;

  // Create text at scaled-up font size
  const scaledArgs = {
    ...textArgs,
    style: {
      ...textArgs.style,
      fontSize: originalFontSize * dprScale
    }
  };

  const text = new PIXI.Text(scaledArgs as any);

  // Enable pixel-perfect rendering by default
  if (pixelPerfect) {
    text.roundPixels = true;
  }

  // Calculate the final scale: user's scale / dprScale
  let finalScale = 1 / dprScale;
  if (props?.scale !== undefined) {
    if (typeof props.scale === 'number') {
      finalScale = props.scale / dprScale;
    } else {
      // Handle object scale - apply DPR to both axes
      const scaleX = (props.scale.x ?? 1) / dprScale;
      const scaleY = (props.scale.y ?? 1) / dprScale;
      text.scale.set(scaleX, scaleY);
      // Apply other props without scale
      return applyProps(text, { ...props, scale: undefined });
    }
  }

  text.scale.set(finalScale);

  // Apply other props without scale (we already handled it)
  return applyProps(text, { ...props, scale: undefined });
}
