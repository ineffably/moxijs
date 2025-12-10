import { Graphics, Texture, Assets, Renderer } from 'pixi.js';

/**
 * Texture generators for particle emitter
 * Includes both procedurally generated and loaded PNG textures
 */

export function createCircleTexture(renderer: Renderer): Texture {
  const graphics = new Graphics();
  graphics.circle(16, 16, 16);
  graphics.fill(0xffffff);
  return renderer.generateTexture(graphics);
}

export function createSquareTexture(renderer: Renderer): Texture {
  const graphics = new Graphics();
  graphics.rect(0, 0, 32, 32);
  graphics.fill(0xffffff);
  return renderer.generateTexture(graphics);
}

export function createStarTexture(renderer: Renderer): Texture {
  const graphics = new Graphics();
  const outerRadius = 16;
  const innerRadius = 8;
  const points = 5;
  const step = Math.PI / points;
  let rot = (Math.PI / 2) * 3;

  graphics.moveTo(16, 0);
  for (let i = 0; i < points; i++) {
    graphics.lineTo(16 + Math.cos(rot) * outerRadius, 16 + Math.sin(rot) * outerRadius);
    rot += step;
    graphics.lineTo(16 + Math.cos(rot) * innerRadius, 16 + Math.sin(rot) * innerRadius);
    rot += step;
  }
  graphics.fill(0xffffff);
  return renderer.generateTexture(graphics);
}

export function createSparkleTexture(renderer: Renderer): Texture {
  const graphics = new Graphics();
  graphics.circle(16, 16, 4);
  graphics.fill({ color: 0xffffff, alpha: 1.0 });
  graphics.circle(16, 16, 10);
  graphics.fill({ color: 0xffffff, alpha: 0.5 });
  graphics.circle(16, 16, 16);
  graphics.fill({ color: 0xffffff, alpha: 0.2 });
  return renderer.generateTexture(graphics);
}

export function createGlowTexture(): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return Texture.from(canvas);
}

export function createPlusTexture(renderer: Renderer): Texture {
  const graphics = new Graphics();
  graphics.rect(12, 6, 8, 20);
  graphics.rect(6, 12, 20, 8);
  graphics.fill(0xffffff);
  return renderer.generateTexture(graphics);
}

export function createDiamondTexture(renderer: Renderer): Texture {
  const graphics = new Graphics();
  graphics.moveTo(16, 4);
  graphics.lineTo(28, 16);
  graphics.lineTo(16, 28);
  graphics.lineTo(4, 16);
  graphics.fill(0xffffff);
  return renderer.generateTexture(graphics);
}

export function createParticleTexture(renderer: Renderer): Texture {
  const graphics = new Graphics();
  graphics.circle(8, 8, 3);
  graphics.fill(0xffffff);
  return renderer.generateTexture(graphics);
}

/**
 * Load PNG particle textures from assets
 */
export async function loadParticleTextures(
  onProgress?: (loaded: number, total: number) => void
): Promise<Record<string, Texture>> {
  const textures: Record<string, Texture> = {};

  // Organized by category
  const textureGroups = {
    circle: ['circle_01', 'circle_02', 'circle_03', 'circle_04', 'circle_05'],
    dirt: ['dirt_01', 'dirt_02', 'dirt_03'],
    fire: ['fire_01', 'fire_02'],
    flame: ['flame_01', 'flame_02', 'flame_03', 'flame_04', 'flame_05', 'flame_06'],
    flare: ['flare_01'],
    light: ['light_01', 'light_02', 'light_03'],
    magic: ['magic_01', 'magic_02', 'magic_03', 'magic_04', 'magic_05'],
    muzzle: ['muzzle_01', 'muzzle_02', 'muzzle_03', 'muzzle_04', 'muzzle_05'],
    scorch: ['scorch_01', 'scorch_02', 'scorch_03'],
    scratch: ['scratch_01'],
    slash: ['slash_01', 'slash_02', 'slash_03', 'slash_04'],
    smoke: ['smoke_01', 'smoke_02', 'smoke_03', 'smoke_04', 'smoke_05', 'smoke_06', 'smoke_07', 'smoke_08', 'smoke_09', 'smoke_10'],
    spark: ['spark_01', 'spark_02', 'spark_03', 'spark_04', 'spark_05', 'spark_06', 'spark_07'],
    star: ['star_01', 'star_02', 'star_03', 'star_04', 'star_05', 'star_06', 'star_07', 'star_08', 'star_09'],
    symbol: ['symbol_01', 'symbol_02'],
    trace: ['trace_01', 'trace_02', 'trace_03', 'trace_04', 'trace_05', 'trace_06', 'trace_07'],
    twirl: ['twirl_01', 'twirl_02', 'twirl_03'],
    window: ['window_01', 'window_02', 'window_03', 'window_04'],
  };

  // Calculate total texture count
  let totalTextures = 0;
  for (const names of Object.values(textureGroups)) {
    totalTextures += names.length;
  }

  let loadedCount = 0;

  // Load all textures
  for (const [category, names] of Object.entries(textureGroups)) {
    for (const name of names) {
      const path = `assets/particles/${name}.png`;
      try {
        const texture = await Assets.load(path);
        textures[name] = texture;
        loadedCount++;
        if (onProgress) {
          onProgress(loadedCount, totalTextures);
        }
      } catch (error) {
        console.warn(`Failed to load texture: ${path}`, error);
        loadedCount++;
        if (onProgress) {
          onProgress(loadedCount, totalTextures);
        }
      }
    }
  }

  return textures;
}

/**
 * Creates all particle textures (procedural + loaded PNGs)
 */
export async function createAllTextures(
  renderer: Renderer,
  onProgress?: (loaded: number, total: number) => void
): Promise<Record<string, Texture>> {
  // Load PNG textures with progress tracking
  const pngTextures = await loadParticleTextures(onProgress);

  // Combine with procedural textures
  return {
    none: Texture.WHITE, // Solid white square for color-only particles

    // Procedural textures (fallback/basic shapes)
    'proc_circle': createCircleTexture(renderer),
    'proc_square': createSquareTexture(renderer),
    'proc_star': createStarTexture(renderer),
    'proc_sparkle': createSparkleTexture(renderer),
    'proc_glow': createGlowTexture(),
    'proc_plus': createPlusTexture(renderer),
    'proc_diamond': createDiamondTexture(renderer),
    'proc_particle': createParticleTexture(renderer),

    // PNG textures from assets
    ...pngTextures,
  };
}
