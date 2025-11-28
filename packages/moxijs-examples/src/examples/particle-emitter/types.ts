/**
 * Particle Emitter Types
 */

export interface ColorStop {
  position: number; // 0-100
  color: string;    // Hex like '#ff0000'
}

export interface EmitterConfig {
  // Emitter properties
  emitterShape: 'point' | 'line' | 'lineVertical' | 'rectangle' | 'circle';
  emitterWidth: number;
  emitterHeight: number;
  rate: number;        // Particles per second
  burst: number;       // Particles per burst
  continuous: boolean;
  repeat: boolean;     // Auto-repeat bursts for non-continuous effects
  followMouse: boolean;

  // Lifetime
  lifetime: number;
  lifetimeVariance: number;

  // Velocity
  speed: number;
  speedVariance: number;
  /**
   * Angle in degrees using Godot's 2D coordinate convention:
   * - 0° = Right (positive X)
   * - 90° = Down (positive Y)
   * - 180° = Left (negative X)
   * - 270° = Up (negative Y)
   *
   * This matches Godot's CPUParticles2D and screen/canvas coordinates.
   * Angles can be exported directly to Godot without conversion.
   */
  angle: number;
  spread: number;      // In degrees (angle variance)

  // Physics
  gravity: number;     // Positive = downward acceleration (screen coords)
  damping: number;

  // Appearance
  texture: string;          // Single texture name (used if textures array is empty)
  textures?: string[];      // Array of texture names for random selection
  textureWeights?: Record<string, number>;  // Weight for each texture (higher = more frequent, default: 1.0)
  blendMode: string;
  rotation: number;    // Rotation speed in radians per second
  scale: number;        // Particle scale multiplier (1.0 = 100%, matches Godot's scale_amount)
  scaleEnd: number;     // End scale multiplier for interpolation
  opacity: number;
  opacityEnd: number;

  // Color gradient
  colorStops: ColorStop[];
}

export interface Particle {
  // Position and motion
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;

  // Visual properties
  scale: number;
  rotation: number;
  alpha: number;
  tint: number;

  // Lifecycle
  age: number;
  lifetime: number;
  active: boolean;

  // Sprite reference
  sprite: any; // PixiJS Sprite
}
