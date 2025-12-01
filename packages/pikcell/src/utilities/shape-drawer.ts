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
 * Calculate pixels for a line using Bresenham's algorithm
 */
export function getLinePixels(x1: number, y1: number, x2: number, y2: number): Point[] {
  const pixels: Point[] = [];

  let dx = Math.abs(x2 - x1);
  let dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;

  let x = x1;
  let y = y1;

  while (true) {
    pixels.push({ x, y });

    if (x === x2 && y === y2) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return pixels;
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
 * Calculate pixels for a circle outline using corner intersection testing
 *
 * For each pixel in the bounding box, checks if the mathematical circle
 * passes through that pixel's area (circle crosses between corners).
 */
function getCircleOutlinePixels(centerX: number, centerY: number, radius: number): Point[] {
  const pixels: Point[] = [];
  const pixelSet = new Set<string>();

  const addPixel = (x: number, y: number) => {
    const key = `${x},${y}`;
    if (!pixelSet.has(key)) {
      pixelSet.add(key);
      pixels.push({ x, y });
    }
  };

  // Handle tiny radius
  if (radius < 0.5) {
    addPixel(Math.floor(centerX), Math.floor(centerY));
    return pixels;
  }

  // Calculate bounding box
  const minX = Math.floor(centerX - radius);
  const maxX = Math.ceil(centerX + radius);
  const minY = Math.floor(centerY - radius);
  const maxY = Math.ceil(centerY + radius);

  // For each pixel, check if the circle outline passes through it
  // Use pixel center distance for more consistent circles at all sizes
  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      // Distance from pixel center to circle center
      const pixelCenterX = px + 0.5;
      const pixelCenterY = py + 0.5;
      const distFromCenter = Math.sqrt(
        (pixelCenterX - centerX) ** 2 + (pixelCenterY - centerY) ** 2
      );

      // Pixel is on circle if its center is within tolerance of the radius
      // Tolerance scales slightly with radius for better small circle rendering
      const tolerance = Math.min(0.75, 0.5 + radius * 0.05);
      if (Math.abs(distFromCenter - radius) <= tolerance) {
        addPixel(px, py);
      }
    }
  }

  return pixels;
}

/**
 * Calculate pixels for an ellipse outline using midpoint algorithm
 * For circles (equal width/height), delegates to the cleaner circle algorithm
 *
 * Uses pixel-inclusive bounds: drawing from (0,0) to (7,7) creates a circle
 * that spans all 8 pixels (0-7), matching rectangle behavior.
 */
export function getEllipseOutlinePixels(x1: number, y1: number, x2: number, y2: number): Point[] {
  const pixels: Point[] = [];

  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  // Bounding box approach: circle inscribed in the drag rectangle
  // For (0,0) to (7,7): 8 pixels wide, center at 4, radius 4
  const width = maxX - minX + 1;  // +1 for pixel-inclusive (0-7 = 8 pixels)
  const height = maxY - minY + 1;

  // Center at true middle of bounding box
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;

  const radiusX = width / 2;
  const radiusY = height / 2;

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

  // For circles (equal radii), use the cleaner intersection algorithm
  if (Math.abs(radiusX - radiusY) < 1) {
    return getCircleOutlinePixels(centerX, centerY, radiusX);
  }

  // For ellipses, use midpoint ellipse algorithm
  const pixelSet = new Set<string>();
  const addPixel = (x: number, y: number) => {
    const px = Math.round(x);
    const py = Math.round(y);
    const key = `${px},${py}`;
    if (!pixelSet.has(key)) {
      pixelSet.add(key);
      pixels.push({ x: px, y: py });
    }
  };

  const rx2 = radiusX * radiusX;
  const ry2 = radiusY * radiusY;

  // Region 1
  let x = 0;
  let y = radiusY;
  let d1 = ry2 - rx2 * radiusY + 0.25 * rx2;
  let dx = 2 * ry2 * x;
  let dy = 2 * rx2 * y;

  while (dx < dy) {
    addPixel(centerX + x, centerY + y);
    addPixel(centerX - x, centerY + y);
    addPixel(centerX + x, centerY - y);
    addPixel(centerX - x, centerY - y);

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
    addPixel(centerX + x, centerY + y);
    addPixel(centerX - x, centerY + y);
    addPixel(centerX + x, centerY - y);
    addPixel(centerX - x, centerY - y);

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
 *
 * Uses pixel-inclusive bounds to match rectangle and outline behavior.
 */
export function getFilledEllipsePixels(x1: number, y1: number, x2: number, y2: number): Point[] {
  const pixels: Point[] = [];

  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  // Center at midpoint for symmetry, radius to reach edges
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const radiusX = width / 2;
  const radiusY = height / 2;

  // Handle degenerate cases
  if (radiusX <= 0.5 && radiusY <= 0.5) {
    pixels.push({ x: x1, y: y1 });
    return pixels;
  }

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
    case 'line':
      return getLinePixels(x1, y1, x2, y2);
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

/**
 * Flood fill algorithm - returns all connected pixels of the same color
 * Uses BFS (queue-based) approach which is more efficient than recursive DFS
 *
 * @param startX - Starting X coordinate
 * @param startY - Starting Y coordinate
 * @param width - Grid width
 * @param height - Grid height
 * @param getPixel - Function to get pixel color at (x, y)
 * @returns Array of points that should be filled
 */
export function getFloodFillPixels(
  startX: number,
  startY: number,
  width: number,
  height: number,
  getPixel: (x: number, y: number) => number
): Point[] {
  const pixels: Point[] = [];
  const targetColor = getPixel(startX, startY);

  // Track visited pixels
  const visited = new Set<string>();
  const key = (x: number, y: number) => `${x},${y}`;

  // BFS queue
  const queue: Point[] = [{ x: startX, y: startY }];
  visited.add(key(startX, startY));

  while (queue.length > 0) {
    const { x, y } = queue.shift()!;

    // Check bounds
    if (x < 0 || x >= width || y < 0 || y >= height) {
      continue;
    }

    // Check if this pixel matches the target color
    if (getPixel(x, y) !== targetColor) {
      continue;
    }

    // Add to result
    pixels.push({ x, y });

    // Add adjacent pixels to queue (4-connected)
    const neighbors = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 }
    ];

    for (const neighbor of neighbors) {
      const nKey = key(neighbor.x, neighbor.y);
      if (!visited.has(nKey) &&
          neighbor.x >= 0 && neighbor.x < width &&
          neighbor.y >= 0 && neighbor.y < height) {
        visited.add(nKey);
        queue.push(neighbor);
      }
    }
  }

  return pixels;
}
