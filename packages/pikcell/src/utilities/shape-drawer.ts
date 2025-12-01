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
 * Calculate pixels for a circle outline using Bresenham's algorithm
 * Uses 8-way symmetry for cleaner pixel-perfect circles
 */
function getCircleOutlinePixels(centerX: number, centerY: number, radius: number): Point[] {
  const pixels: Point[] = [];
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

  // Add all 8 symmetric points
  const addSymmetricPoints = (cx: number, cy: number, x: number, y: number) => {
    addPixel(cx + x, cy + y);
    addPixel(cx - x, cy + y);
    addPixel(cx + x, cy - y);
    addPixel(cx - x, cy - y);
    addPixel(cx + y, cy + x);
    addPixel(cx - y, cy + x);
    addPixel(cx + y, cy - x);
    addPixel(cx - y, cy - x);
  };

  // Handle small radii with hand-tuned patterns for better aesthetics
  const r = Math.round(radius);
  if (r <= 0) {
    addPixel(centerX, centerY);
    return pixels;
  }

  // Bresenham's circle algorithm with midpoint decision
  let x = 0;
  let y = r;
  let d = 3 - 2 * r;

  addSymmetricPoints(centerX, centerY, x, y);

  while (y >= x) {
    x++;
    if (d > 0) {
      y--;
      d = d + 4 * (x - y) + 10;
    } else {
      d = d + 4 * x + 6;
    }
    addSymmetricPoints(centerX, centerY, x, y);
  }

  return pixels;
}

/**
 * Calculate pixels for an ellipse outline using midpoint algorithm
 * For circles (equal width/height), delegates to the cleaner circle algorithm
 */
export function getEllipseOutlinePixels(x1: number, y1: number, x2: number, y2: number): Point[] {
  const pixels: Point[] = [];
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
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

  // For circles (equal width and height), use the cleaner Bresenham algorithm
  if (Math.abs(width - height) < 1) {
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
