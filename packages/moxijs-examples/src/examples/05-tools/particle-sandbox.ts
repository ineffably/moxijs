import { Container, Sprite, Texture } from 'pixi.js';
import { setupMoxi } from '@moxijs/core';
import { EmitterConfig, Particle } from '../particle-emitter/types';
import { createAllTextures } from '../particle-emitter/textures';
import { createEnhancedControls, applyPreset } from '../particle-emitter/ui-controls';
import defaultPresets from '../particle-emitter/presets.json';

/**
 * Particle Emitter Sandbox
 *
 * Advanced particle system featuring:
 * - 10 visual presets (fire, explosion, rain, snow, magic, fireworks, smoke, rocket, stars, confetti)
 * - Multi-stop color gradients with editor
 * - 8 particle textures + "none" for pure color
 * - Blend modes (Normal, Add, Multiply, Screen)
 * - 5 emitter shapes (point, line, circle, rectangle)
 * - Object pooling for performance
 * - Export/Import JSON configurations
 * - LocalStorage persistence
 */

// Default configuration
const defaultConfig: EmitterConfig = {
  emitterShape: 'point',
  emitterWidth: 0,
  emitterHeight: 0,
  rate: 50,
  burst: 10,
  continuous: true,
  repeat: false,
  followMouse: false,

  lifetime: 2.0,
  lifetimeVariance: 0.5,

  speed: 100,
  speedVariance: 50,
  angle: 270,
  spread: 30,

  gravity: 100,
  damping: 0,

  texture: 'circle',
  blendMode: 'NORMAL',
  rotation: 0,
  scale: 0.5,
  scaleEnd: 0.25,
  opacity: 1.0,
  opacityEnd: 0.0,

  colorStops: [
    { position: 0, color: '#ff6b35' },
    { position: 100, color: '#4a9eff' }
  ]
};

// Particle pool for object reuse
class ParticlePool {
  private particles: Particle[] = [];
  private activeCount: number = 0;
  private maxParticles: number;
  private container: Container;

  constructor(maxParticles: number, container: Container) {
    this.maxParticles = maxParticles;
    this.container = container;

    // Pre-allocate particles (sprites created on-demand with textures)
    for (let i = 0; i < maxParticles; i++) {
      this.particles.push({
        x: 0,
        y: 0,
        velocityX: 0,
        velocityY: 0,
        scale: 1,
        rotation: 0,
        alpha: 1,
        tint: 0xffffff,
        age: 0,
        lifetime: 1,
        active: false,
        sprite: null,
      });
    }
  }

  spawn(texture: Texture): Particle | null {
    for (const particle of this.particles) {
      if (!particle.active) {
        particle.active = true;

        // Create sprite if needed or update texture
        if (!particle.sprite) {
          particle.sprite = new Sprite(texture);
          particle.sprite.anchor.set(0.5);
          this.container.addChild(particle.sprite);
        } else {
          particle.sprite.texture = texture;
        }

        particle.sprite.visible = true;
        this.activeCount++;
        return particle;
      }
    }
    return null;
  }

  recycle(particle: Particle): void {
    particle.active = false;
    if (particle.sprite) {
      particle.sprite.visible = false;
    }
    this.activeCount--;
  }

  getActiveParticles(): Particle[] {
    return this.particles.filter(p => p.active);
  }

  getActiveCount(): number {
    return this.activeCount;
  }
}

// Enhanced particle emitter with all features
class EnhancedParticleEmitter extends Container {
  private pool: ParticlePool;
  private config: EmitterConfig;
  private textures: Record<string, Texture>;

  public emitterX: number = 0;
  public emitterY: number = 0;

  private emissionTimer = 0;
  private isPlaying = false;

  constructor(config: EmitterConfig, textures: Record<string, Texture>, maxParticles = 1000) {
    super();
    this.config = config;
    this.textures = textures;
    this.pool = new ParticlePool(maxParticles, this);
  }

  play(): void {
    this.isPlaying = true;
  }

  stop(): void {
    this.isPlaying = false;
  }

  burst(count = 1): void {
    for (let i = 0; i < count; i++) {
      this.spawnParticle();
    }
  }

  updateConfig(newConfig: EmitterConfig): void {
    Object.assign(this.config, newConfig);
  }

  update(deltaTime: number): void {
    // Emit particles
    if (this.isPlaying && this.config.rate > 0) {
      this.emissionTimer += deltaTime;
      while (this.emissionTimer >= 1.0 / this.config.rate) {
        this.spawnParticle();
        this.emissionTimer -= 1.0 / this.config.rate;
      }
    }

    // Update active particles
    const activeParticles = this.pool.getActiveParticles();
    for (const particle of activeParticles) {
      this.updateParticle(particle, deltaTime);
    }
  }

  private getSpawnPosition(): { x: number; y: number } {
    const { emitterShape, emitterWidth, emitterHeight } = this.config;

    switch (emitterShape) {
      case 'point':
        return { x: this.emitterX, y: this.emitterY };

      case 'line':
        return {
          x: this.emitterX + (Math.random() - 0.5) * emitterWidth,
          y: this.emitterY
        };

      case 'lineVertical':
        return {
          x: this.emitterX,
          y: this.emitterY + (Math.random() - 0.5) * emitterHeight
        };

      case 'rectangle':
        return {
          x: this.emitterX + (Math.random() - 0.5) * emitterWidth,
          y: this.emitterY + (Math.random() - 0.5) * emitterHeight
        };

      case 'circle': {
        const radius = emitterWidth / 2;
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius;
        return {
          x: this.emitterX + Math.cos(angle) * r,
          y: this.emitterY + Math.sin(angle) * r
        };
      }

      default:
        return { x: this.emitterX, y: this.emitterY };
    }
  }

  private spawnParticle(): void {
    // Randomly select texture from textures array if provided, otherwise use single texture
    let textureName: string;
    if (this.config.textures && this.config.textures.length > 0) {
      // Use weighted random selection if weights are provided
      if (this.config.textureWeights && Object.keys(this.config.textureWeights).length > 0) {
        // Calculate total weight
        let totalWeight = 0;
        const weights: Array<{ texture: string; weight: number; cumulative: number }> = [];
        
        for (const texture of this.config.textures) {
          const weight = this.config.textureWeights[texture] || 1.0;
          totalWeight += weight;
          weights.push({
            texture,
            weight,
            cumulative: totalWeight
          });
        }
        
        // Select based on weighted random
        const random = Math.random() * totalWeight;
        for (const item of weights) {
          if (random <= item.cumulative) {
            textureName = item.texture;
            break;
          }
        }
        // Fallback (shouldn't happen, but safety)
        if (!textureName) {
          textureName = weights[weights.length - 1].texture;
        }
      } else {
        // Uniform random selection (equal weights)
        const randomIndex = Math.floor(Math.random() * this.config.textures.length);
        textureName = this.config.textures[randomIndex];
      }
    } else {
      textureName = this.config.texture;
    }
    
    const texture = this.textures[textureName];
    if (!texture) {
      console.warn(`Texture "${textureName}" not found, using fallback`);
      return;
    }
    
    const particle = this.pool.spawn(texture);
    if (!particle) return;

    // Reset particle
    particle.age = 0;
    particle.lifetime = this.config.lifetime +
      (Math.random() - 0.5) * 2 * this.config.lifetimeVariance;

    // Spawn position
    const pos = this.getSpawnPosition();
    particle.x = pos.x;
    particle.y = pos.y;

    // Initial velocity
    const angleRad = (this.config.angle + (Math.random() - 0.5) * this.config.spread) * Math.PI / 180;
    const speed = this.config.speed + (Math.random() - 0.5) * 2 * this.config.speedVariance;

    particle.velocityX = Math.cos(angleRad) * speed;
    particle.velocityY = Math.sin(angleRad) * speed;

    // Visual state
    particle.scale = this.config.scale;
    particle.alpha = this.config.opacity;
    particle.rotation = Math.random() * Math.PI * 2;

    // Set blend mode (cast to any to avoid PixiJS type issues)
    const blendModeMap: Record<string, any> = {
      'NORMAL': 'normal',
      'ADD': 'add',
      'MULTIPLY': 'multiply',
      'SCREEN': 'screen'
    };
    (particle.sprite as any).blendMode = blendModeMap[this.config.blendMode] || 'normal';

    this.updateParticleSprite(particle);
  }

  private updateParticle(particle: Particle, deltaTime: number): void {
    particle.age += deltaTime;

    if (particle.age >= particle.lifetime) {
      this.pool.recycle(particle);
      return;
    }

    const t = particle.age / particle.lifetime;

    // Physics
    particle.velocityY += this.config.gravity * deltaTime;

    if (this.config.damping > 0) {
      const dragFactor = 1 - this.config.damping * deltaTime;
      particle.velocityX *= dragFactor;
      particle.velocityY *= dragFactor;
    }

    particle.x += particle.velocityX * deltaTime;
    particle.y += particle.velocityY * deltaTime;

    // Rotation
    if (this.config.rotation !== 0) {
      particle.rotation += this.config.rotation * deltaTime;
    }

    // Interpolate visual properties
    particle.scale = this.lerp(this.config.scale, this.config.scaleEnd, t);
    particle.alpha = this.lerp(this.config.opacity, this.config.opacityEnd, t);

    // Color gradient
    const colorT = t * 100; // Convert to 0-100 scale
    particle.tint = this.getColorAtPosition(colorT);

    this.updateParticleSprite(particle);
  }

  private updateParticleSprite(particle: Particle): void {
    particle.sprite.position.set(particle.x, particle.y);
    particle.sprite.scale.set(particle.scale);
    particle.sprite.alpha = particle.alpha;
    particle.sprite.tint = particle.tint;
    particle.sprite.rotation = particle.rotation;
  }

  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  private getColorAtPosition(position: number): number {
    const stops = this.config.colorStops;
    if (stops.length === 0) return 0xffffff;
    if (stops.length === 1) return parseInt(stops[0].color.slice(1), 16);

    // Find surrounding color stops
    let beforeStop = stops[0];
    let afterStop = stops[stops.length - 1];

    for (let i = 0; i < stops.length - 1; i++) {
      if (position >= stops[i].position && position <= stops[i + 1].position) {
        beforeStop = stops[i];
        afterStop = stops[i + 1];
        break;
      }
    }

    if (beforeStop.position === afterStop.position) {
      return parseInt(beforeStop.color.slice(1), 16);
    }

    // Interpolate
    const range = afterStop.position - beforeStop.position;
    const t = (position - beforeStop.position) / range;

    const color1 = parseInt(beforeStop.color.slice(1), 16);
    const color2 = parseInt(afterStop.color.slice(1), 16);

    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;

    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return (r << 16) | (g << 8) | b;
  }

  getActiveParticleCount(): number {
    return this.pool.getActiveCount();
  }

  clearParticles(): void {
    const activeParticles = this.pool.getActiveParticles();
    for (const particle of activeParticles) {
      this.pool.recycle(particle);
    }
  }
}

export async function initParticleEmitterSandbox() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('Canvas container not found');

  // Setup MoxiJS with loading scene
  const { scene, engine, renderer, loadingScene } = await setupMoxi({
    hostElement: root,
    renderOptions: {
      background: '#1a1a2e'
    },
    showLoadingScene: true,
    loadingSceneOptions: {
      text: 'Loading Particle Textures...'
    }
  });

  // Show loading scene
  if (loadingScene) {
    loadingScene.show();
  }

  // Create all textures (async to load PNGs) with progress tracking
  const textures = await createAllTextures(renderer, (loaded, total) => {
    // Loading scene doesn't expose text property, so we just show/hide it
    // Progress is shown via the animation
  });

  // Hide loading scene
  if (loadingScene) {
    loadingScene.hide();
  }

  // Use default config (localStorage removed for now)
  const config: EmitterConfig = { ...defaultConfig };

  // Create emitter
  const emitter = new EnhancedParticleEmitter(config, textures, 1000);
  emitter.emitterX = renderer.width / 2;
  emitter.emitterY = renderer.height / 2;
  scene.addChild(emitter);

  // Create a minimal app-like object for compatibility with UI controls
  // They need screen.width, screen.height, and ticker
  const appLike = {
    screen: {
      width: renderer.width,
      height: renderer.height
    },
    renderer,
    canvas: renderer.canvas,
    ticker: engine.ticker
  } as any;

  // Apply fire preset as default
  applyPreset(appLike, emitter, config, 'fire');

  // Update loop using MoxiJS engine
  engine.ticker.add((ticker) => {
    const deltaTime = ticker.deltaTime / 60;
    emitter.update(deltaTime);
  });

  // Mouse/touch interaction - click to reposition emitter
  const canvas = renderer.canvas as HTMLCanvasElement;
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    emitter.emitterX = e.clientX - rect.left;
    emitter.emitterY = e.clientY - rect.top;

    if (!config.continuous) {
      emitter.burst(config.burst);
    }
  });

  // Create comprehensive UI controls
  createEnhancedControls(appLike, emitter, config, textures);

  // Initialize and start the engine
  scene.init();
  engine.start();

  console.log('✅ Particle Emitter Sandbox loaded');
  console.log('💡 Click to reposition emitter, use controls to adjust settings!');
}
