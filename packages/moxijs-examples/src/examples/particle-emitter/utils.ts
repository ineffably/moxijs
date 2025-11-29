/**
 * Utility functions for particle emitter
 *
 * NOTE: Our angle system matches Godot's 2D coordinate convention exactly:
 * - 0° = Right, 90° = Down, 180° = Left, 270° = Up
 * This means presets can be exported to Godot CPUParticles2D without conversion.
 */

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  angle = angle % 360;
  if (angle < 0) angle += 360;
  return angle;
}

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return radians * 180 / Math.PI;
}

/**
 * Visual reference for angle conventions (Godot 2D compatible)
 */
export const ANGLE_REFERENCE = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
} as const;

/**
 * Common preset directions (Godot 2D compatible)
 */
export const DIRECTIONS = {
  RIGHT: 0,
  DOWN_RIGHT: 45,
  DOWN: 90,
  DOWN_LEFT: 135,
  LEFT: 180,
  UP_LEFT: 225,
  UP: 270,
  UP_RIGHT: 315,
} as const;
