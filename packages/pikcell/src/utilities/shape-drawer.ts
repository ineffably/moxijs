/**
 * Shape Drawer - Calculates pixels for drawing shapes
 *
 * All functions return arrays of {x, y} coordinates to be filled.
 */

import { ShapeType } from '../theming/tool-icons';

export interface Point {
  x: number;
  y: number;
}

/**
 * Calculate pixels for a rectangle outline
 */
export function getRectangleOutlinePixels(x1: number, y1: number, x2: number, y2: number): Point[] {
  const pixels: Point[] = [];
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  // Top and bottom edges
  for (let x = minX; x <= maxX; x++) {
    pixels.push({ x, y: minY });
    if (minY !== maxY) {
      pixels.push({ x, y: maxY });
    }
  }

  // Left and right edges (excluding corners already drawn)
  for (let y = minY + 1; y < maxY; y++) {
    pixels.push({ x: minX, y });
    if (minX !== maxX) {
      pixels.push({ x: maxX, y });
    }
  }

  return pixels;
}

/**
 * Calculate pixels for a filled rectangle
 */
export function getFilledRectanglePixels(x1: number, y1: number, x2: number, y2: number): Point[] {
  const pixels: Point[] = [];
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      pixels.push({ x, y });
    }
  }

  return pixels;
}

/**
 * Calculate pixels for an ellipse outline using midpoint algorithm
 */
export function getEllipseOutlinePixels(x1: number, y1: number, x2: number, y2: number): Point[] {
  const pixels: Point[] = [];
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  const radiusX = Math.abs(x2 - x1) / 2;
  const radiusY = Math.abs(y2 - y1) / 2;

  // Handle degenerate cases
  if (radiusX < 0.5 && radiusY < 0.5) {
    pixels.push({ x: Math.round(centerX), y: Math.round(centerY) });
    return pixels;
  }
  if (radiusX < 0.5) {
    // Vertical line
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) {
      pixels.push({ x: Math.round(centerX), y });
    }
    return pixels;
  }
  if (radiusY < 0.5) {
    // Horizontal line
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) {
      pixels.push({ x, y: Math.round(centerY) });
    }
    return pixels;
  }

  // Use a set to avoid duplicates
  const pixelSet = new Set<string>();
  const addPixel = (x: number, y: number) => {
    const key = `${x},${y}`;
    if (!pixelSet.has(key)) {
      pixelSet.add(key);
      pixels.push({ x, y });
    }
  };

  // Bresenham-like ellipse algorithm
  const rx2 = radiusX * radiusX;
  const ry2 = radiusY * radiusY;

  // Region 1
  let x = 0;
  let y = radiusY;
  let d1 = ry2 - rx2 * radiusY + 0.25 * rx2;
  let dx = 2 * ry2 * x;
  let dy = 2 * rx2 * y;

  while (dx < dy) {
    addPixel(Math.round(centerX + x), Math.round(centerY + y));
    addPixel(Math.round(centerX - x), Math.round(centerY + y));
    addPixel(Math.round(centerX + x), Math.round(centerY - y));
    addPixel(Math.round(centerX - x), Math.round(centerY - y));

    if (d1 < 0) {
      x++;
      dx += 2 * ry2;
      d1 += dx + ry2;
    } else {
      x++;
      y--;
      dx += 2 * ry2;
      dy -= 2 * rx2;
      d1 += dx - dy + ry2;
    }
  }

  // Region 2
  let d2 = ry2 * (x + 0.5) * (x + 0.5) + rx2 * (y - 1) * (y - 1) - rx2 * ry2;

  while (y >= 0) {
    addPixel(Math.round(centerX + x), Math.round(centerY + y));
    addPixel(Math.round(centerX - x), Math.round(centerY + y));
    addPixel(Math.round(centerX + x), Math.round(centerY - y));
    addPixel(Math.round(centerX - x), Math.round(centerY - y));

    if (d2 > 0) {
      y--;
      dy -= 2 * rx2;
      d2 += rx2 - dy;
    } else {
      y--;
      x++;
      dx += 2 * ry2;
      dy -= 2 * rx2;
      d2 += dx - dy + rx2;
    }
  }

  return pixels;
}

/**
 * Calculate pixels for a filled ellipse
 */
export function getFilledEllipsePixels(x1: number, y1: number, x2: number, y2: number): Point[] {
  const pixels: Point[] = [];
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  const radiusX = Math.abs(x2 - x1) / 2;
  const radiusY = Math.abs(y2 - y1) / 2;

  // Handle degenerate cases
  if (radiusX < 0.5 && radiusY < 0.5) {
    pixels.push({ x: Math.round(centerX), y: Math.round(centerY) });
    return pixels;
  }

  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  // For each row, find the extent of the ellipse
  for (let y = minY; y <= maxY; y++) {
    const dy = y - centerY;
    // Solve for x: (x-cx)^2/rx^2 + (y-cy)^2/ry^2 = 1
    // x = cx ± rx * sqrt(1 - (y-cy)^2/ry^2)
    const term = 1 - (dy * dy) / (radiusY * radiusY);
    if (term >= 0) {
      const xExtent = radiusX * Math.sqrt(term);
      const xMin = Math.round(centerX - xExtent);
      const xMax = Math.round(centerX + xExtent);
      for (let x = xMin; x <= xMax; x++) {
        if (x >= minX && x <= maxX) {
          pixels.push({ x, y });
        }
      }
    }
  }

  return pixels;
}

/**
 * Get pixels for a shape based on type
 */
export function getShapePixels(shapeType: ShapeType, x1: number, y1: number, x2: number, y2: number): Point[] {
  switch (shapeType) {
    case 'square':
      return getRectangleOutlinePixels(x1, y1, x2, y2);
    case 'square-filled':
      return getFilledRectanglePixels(x1, y1, x2, y2);
    case 'circle':
      return getEllipseOutlinePixels(x1, y1, x2, y2);
    case 'circle-filled':
      return getFilledEllipsePixels(x1, y1, x2, y2);
    default:
      return [];
  }
}
