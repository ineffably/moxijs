import { Point } from 'pixi.js';

/**
 * Commonly used Point factory functions
 * These reduce object allocations and clarify intent
 */
export const createPoint = (x = 0, y = 0): Point => new Point(x, y);
export const ZERO_POINT = (): Point => new Point(0, 0);
export const ONE_POINT = (): Point => new Point(1, 1);

export const uc = (s = '') => s.toUpperCase();
export const lc = (s = '') => s.toLowerCase();

export const padRight = (val = '', length = 0, padWith = ' ') => {
  let result = val+'';
  while(result.length < length){
    result += padWith;
  }
  return result;
};

export const pr = padRight;

/**
 * Generate random integer between min and max (inclusive)
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer in range [min, max]
 */
export const getRandomInt = (min: number, max: number): number => (Math.floor(Math.random() * (max + 1 - min)) + min);

export const roundTo = (places, value) => (Math.round(value * Math.pow(10, places)) / Math.pow(10, places));

export const lerp = (begin, end, mag) => ((1 - mag) * begin + mag * end);

export function metersToPixels(m: number): number { return m * 20; }

export function pixelsToMeters(p: number): number { return p * 0.05; }

export const fetchXml = async (url: string) => (await (await fetch(url)).text());

export const rad2deg = (rad: number) => rad * (180 / Math.PI);
export const deg2rad = (deg: number) => deg * (Math.PI / 180);
  