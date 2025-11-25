import { Container, Graphics, Text } from 'pixi.js';
import type { LoadingAnimation, LoadingAnimationContext } from './loading-scene';

/**
 * Options for the default falling squares animation.
 */
export interface FallingSquaresOptions {
  /** Size of squares in pixels (default: 20) */
  squareSize?: number;
  /** Maximum number of particles (default: 30) */
  maxParticles?: number;
  /** Color palette - array of hex colors (default: pastel pixel art palette) */
  palette?: number[];
  /** Spawn rate - lower is faster (default: 0.5) */
  spawnInterval?: number;
}

/** Default pastel pixel art color palette */
const DEFAULT_PALETTE = [0xf0dab1, 0xe39aac, 0xc45d9f, 0x634b7d, 0x6461c2, 0x2ba9b4, 0x93d4b5, 0xf0f6e8];

interface Particle {
  sprite: Graphics;
  spawnTime: number;
  duration: number;
  spinRate: number;
  startX: number;
  startY: number;
  endY: number;
}

/**
 * Default loading animation - colorful squares falling above the loading text.
 *
 * @example
 * ```ts
 * // Use with custom options
 * const animation = new FallingSquaresAnimation({
 *   squareSize: 16,
 *   maxParticles: 50,
 *   palette: [0xff0000, 0x00ff00, 0x0000ff]
 * });
 *
 * const { loadingScene } = await setupMoxi({
 *   showLoadingScene: true,
 *   loadingSceneOptions: { animation }
 * });
 * ```
 */
export class FallingSquaresAnimation implements LoadingAnimation {
  private particles: Particle[] = [];
  private container: Container | null = null;
  private nextSpawn: number = 0;
  private time: number = 0;

  private squareSize: number;
  private maxParticles: number;
  private palette: number[];
  private spawnInterval: number;

  constructor(options: FallingSquaresOptions = {}) {
    this.squareSize = options.squareSize ?? 20;
    this.maxParticles = options.maxParticles ?? 30;
    this.palette = options.palette ?? DEFAULT_PALETTE;
    this.spawnInterval = options.spawnInterval ?? 0.5;
  }

  init(container: Container): void {
    this.container = container;
  }

  update(context: LoadingAnimationContext): void {
    if (!this.container) return;

    this.time = context.time;
    const { width, height, textElement } = context;

    // Spawn new particles
    this.spawnParticle(width, height, textElement);

    // Update existing particles
    this.particles = this.particles.filter(p => {
      const elapsed = this.time - p.spawnTime;
      const progress = elapsed / p.duration;

      if (progress < 0 || progress > 1) {
        p.sprite.destroy();
        return false;
      }

      p.sprite.x = p.startX;
      p.sprite.y = p.startY + (p.endY - p.startY) * progress;
      p.sprite.rotation = this.time * p.spinRate * Math.PI * 2;
      p.sprite.alpha = progress < 0.1 ? progress / 0.1 : progress > 0.85 ? (1 - progress) / 0.15 : 1;
      return true;
    });
  }

  private spawnParticle(width: number, height: number, textElement: Text): void {
    if (!this.container) return;
    if (this.particles.length >= this.maxParticles || this.time < this.nextSpawn) return;

    const size = this.squareSize * (0.7 + Math.random() * 0.6);
    const sprite = new Graphics();
    sprite.rect(0, 0, size, size);
    sprite.fill({ color: this.palette[Math.floor(Math.random() * this.palette.length)] });
    sprite.pivot.set(size / 2, size / 2);
    this.container.addChild(sprite);

    const textY = textElement.y;
    const textWidth = textElement.width || 200;
    const textCenterX = width / 2;

    this.particles.push({
      sprite,
      spawnTime: this.time,
      duration: 1 + Math.random() * 2.5,
      spinRate: (0.05 + Math.random() * 1.075) * (Math.random() < 0.5 ? 1 : -1),
      startX: textCenterX - textWidth / 2 + Math.random() * textWidth - 4,
      startY: textY - 100,
      endY: textY - 40,
    });

    this.nextSpawn = this.time + Math.random() * this.spawnInterval;
  }

  reset(): void {
    this.time = 0;
    this.nextSpawn = 0;
    this.particles.forEach(p => p.sprite.destroy());
    this.particles = [];
  }

  destroy(): void {
    this.particles.forEach(p => p.sprite.destroy());
    this.particles = [];
    this.container = null;
  }
}
