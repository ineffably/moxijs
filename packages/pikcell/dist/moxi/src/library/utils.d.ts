import { Point } from 'pixi.js';
/**
 * Commonly used Point factory functions
 * These reduce object allocations and clarify intent
 */
export declare const createPoint: (x?: number, y?: number) => Point;
export declare const ZERO_POINT: () => Point;
export declare const ONE_POINT: () => Point;
export declare const uc: (s?: string) => string;
export declare const lc: (s?: string) => string;
export declare const padRight: (val?: string, length?: number, padWith?: string) => string;
export declare const pr: (val?: string, length?: number, padWith?: string) => string;
/**
 * Generate random integer between min and max (inclusive)
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer in range [min, max]
 */
export declare const getRandomInt: (min: number, max: number) => number;
export declare const roundTo: (places: any, value: any) => number;
export declare const lerp: (begin: any, end: any, mag: any) => number;
export declare function metersToPixels(m: number): number;
export declare function pixelsToMeters(p: number): number;
export declare const fetchXml: (url: string) => Promise<string>;
export declare const rad2deg: (rad: number) => number;
export declare const deg2rad: (deg: number) => number;
