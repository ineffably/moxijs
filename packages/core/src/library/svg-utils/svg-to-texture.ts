/**
 * Utility to convert SVG to PIXI texture
 */
import * as PIXI from 'pixi.js';

export interface SVGToTextureOptions {
  svgString: string;
  width: number;  // Desired width in actual pixels
  height: number; // Desired height in actual pixels
  color?: number; // Color to replace "currentColor" with
}

/**
 * Converts an SVG string to a PIXI texture
 * Accounts for proper scaling and renders at the exact pixel dimensions needed
 */
export async function svgToTexture(options: SVGToTextureOptions): Promise<PIXI.Texture> {
  const { svgString, width, height, color = 0x000000 } = options;

  // Replace currentColor with actual color
  const colorHex = '#' + color.toString(16).padStart(6, '0');
  const processedSVG = svgString.replace(/currentColor/g, colorHex);

  // Create a blob from the SVG string
  const blob = new Blob([processedSVG], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  // Load as image
  const img = new Image();
  img.width = width;
  img.height = height;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  // Create canvas and draw the image at the exact size
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    URL.revokeObjectURL(url);
    throw new Error('Failed to get canvas context');
  }

  // Draw the image
  ctx.drawImage(img, 0, 0, width, height);

  // Clean up
  URL.revokeObjectURL(url);

  // Create texture from canvas
  const texture = PIXI.Texture.from(canvas);
  texture.source.scaleMode = 'linear'; // Smooth scaling for SVG

  return texture;
}
