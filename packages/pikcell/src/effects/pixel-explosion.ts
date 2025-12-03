/**
 * Pixel Explosion Effect
 *
 * A delightful animation that explodes a button into its constituent grid-unit "pixels",
 * lets them fall off screen, then reassembles by raining pixels down from above.
 *
 * The effect captures the actual rendered appearance of the button for authentic visuals.
 * It works in grid units (not raw pixels) for consistency with the pikcell UI system.
 */
import * as PIXI from 'pixi.js';
import { GRID, px } from '@moxijs/ui';

/** Individual pixel particle for the explosion */
interface Particle {
  /** Graphics object for this particle */
  graphics: PIXI.Graphics;
  /** Grid X position within the button */
  gridX: number;
  /** Grid Y position within the button */
  gridY: number;
  /** Current X position in pixels */
  x: number;
  /** Current Y position in pixels */
  y: number;
  /** X velocity */
  vx: number;
  /** Y velocity */
  vy: number;
  /** Color of this particle */
  color: number;
  /** Rotation velocity */
  rotationSpeed: number;
  /** Scale for visual interest */
  scale: number;
  /** Delay before this particle starts moving (for staggered effect) */
  delay: number;
  /** Whether this particle has started animating */
  active: boolean;
}

export interface PixelExplosionOptions {
  /** The container to add particles to (usually the scene) */
  scene: PIXI.Container;
  /** Global X position of the button */
  buttonX: number;
  /** Global Y position of the button */
  buttonY: number;
  /** Button width in grid units */
  buttonWidth: number;
  /** Button height in grid units */
  buttonHeight: number;
  /** Colors to sample from (will create a pattern) - used as fallback */
  colors: number[];
  /** Screen height for calculating when particles are off-screen */
  screenHeight: number;
  /** Callback when explosion phase completes (all particles off screen) */
  onExplosionComplete?: () => void;
  /** Callback when reassembly phase completes */
  onReassemblyComplete?: () => void;
  /** Explosion force multiplier (default: 1) */
  explosionForce?: number;
  /** Gravity strength (default: 0.3) */
  gravity?: number;
  /** The PIXI renderer for extracting pixel data */
  renderer?: PIXI.Renderer;
  /** The display object to capture pixels from */
  sourceObject?: PIXI.Container;
}

export interface PixelExplosionResult {
  /** Start the explosion animation */
  explode: () => void;
  /** Cancel and clean up the animation */
  destroy: () => void;
  /** Check if animation is currently running */
  isAnimating: () => boolean;
}

/**
 * Creates a pixel explosion effect for a button
 */
export function createPixelExplosion(options: PixelExplosionOptions): PixelExplosionResult {
  const {
    scene,
    buttonX,
    buttonY,
    buttonWidth,
    buttonHeight,
    colors,
    screenHeight,
    onExplosionComplete,
    onReassemblyComplete,
    explosionForce = 1,
    gravity = 0.3,
    renderer,
    sourceObject
  } = options;

  // Animation state
  let particles: Particle[] = [];
  let animationFrame: number | null = null;
  let phase: 'idle' | 'exploding' | 'reassembling' | 'complete' = 'idle';
  let particleContainer: PIXI.Container | null = null;
  let elapsedTime = 0;

  // Captured pixel colors from the source object (grid-unit resolution)
  let capturedColors: number[][] | null = null;

  // Particle size is 1 grid unit
  const particleSize = px(1);

  /**
   * Capture the actual pixel colors from the source object at grid-unit resolution
   */
  function captureSourceColors(): number[][] | null {
    if (!renderer || !sourceObject) return null;

    try {
      // Extract the pixels from the source object
      const extract = renderer.extract;
      const pixelData = extract.pixels(sourceObject);
      
      // Get the pixel array from the result (Uint8ClampedArray)
      const pixels = pixelData.pixels as Uint8ClampedArray;
      const srcWidth = pixelData.width;
      const srcHeight = pixelData.height;
      const pixelCount = pixels.length;

      // Sample at grid-unit resolution
      const gridColors: number[][] = [];
      
      for (let gy = 0; gy < buttonHeight; gy++) {
        const row: number[] = [];
        for (let gx = 0; gx < buttonWidth; gx++) {
          // Map grid position to source pixel position
          const srcX = Math.floor((gx / buttonWidth) * srcWidth);
          const srcY = Math.floor((gy / buttonHeight) * srcHeight);
          
          // Get pixel index (RGBA format, 4 bytes per pixel)
          const pixelIndex = (srcY * srcWidth + srcX) * 4;
          
          if (pixelIndex >= 0 && pixelIndex + 3 < pixelCount) {
            const r = pixels[pixelIndex];
            const g = pixels[pixelIndex + 1];
            const b = pixels[pixelIndex + 2];
            const a = pixels[pixelIndex + 3];
            
            // Skip fully transparent pixels - use fallback color
            if (a < 10) {
              const colorIndex = (gx + gy) % colors.length;
              row.push(colors[colorIndex]);
            } else {
              // Convert RGB to hex
              row.push((r << 16) | (g << 8) | b);
            }
          } else {
            // Fallback to pattern colors
            const colorIndex = (gx + gy) % colors.length;
            row.push(colors[colorIndex]);
          }
        }
        gridColors.push(row);
      }

      return gridColors;
    } catch (e) {
      console.warn('Failed to capture source colors:', e);
      return null;
    }
  }

  /**
   * Get color for a grid position (from captured or fallback)
   */
  function getColorAt(gx: number, gy: number): number {
    if (capturedColors && capturedColors[gy] && capturedColors[gy][gx] !== undefined) {
      return capturedColors[gy][gx];
    }
    // Fallback to pattern colors
    return colors[(gx + gy) % colors.length];
  }

  /**
   * Create particles representing each grid unit of the button
   * Balanced explosion - outward burst but not too crazy
   */
  function createParticles(): Particle[] {
    const result: Particle[] = [];
    const centerX = buttonX + px(buttonWidth) / 2;
    const centerY = buttonY + px(buttonHeight) / 2;

    for (let gy = 0; gy < buttonHeight; gy++) {
      for (let gx = 0; gx < buttonWidth; gx++) {
        const worldX = buttonX + px(gx);
        const worldY = buttonY + px(gy);

        // Calculate explosion direction from center
        const dx = worldX - centerX;
        const dy = worldY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        // Direction from center with some randomness
        const angle = Math.atan2(dy, dx);
        const randomAngle = angle + (Math.random() - 0.5) * 0.5;
        
        // Moderate force - not too explosive
        const force = (1.5 + Math.random() * 2) * explosionForce;

        // Get actual color from captured pixels
        const color = getColorAt(gx, gy);

        // Create the graphics for this particle
        const graphics = new PIXI.Graphics();
        graphics.roundPixels = true;
        graphics.rect(0, 0, particleSize, particleSize);
        graphics.fill({ color });
        graphics.position.set(worldX, worldY);

        // Quick stagger from center outward
        const delay = (distance / px(Math.max(buttonWidth, buttonHeight))) * 40;

        result.push({
          graphics,
          gridX: gx,
          gridY: gy,
          x: worldX,
          y: worldY,
          vx: Math.cos(randomAngle) * force,
          vy: Math.sin(randomAngle) * force - 1.5, // Slight upward bias
          color,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          scale: 1,
          delay,
          active: false
        });
      }
    }

    return result;
  }

  /**
   * Create particles for the reassembly phase (falling from above)
   */
  function createReassemblyParticles(): Particle[] {
    const result: Particle[] = [];

    for (let gy = 0; gy < buttonHeight; gy++) {
      for (let gx = 0; gx < buttonWidth; gx++) {
        const targetX = buttonX + px(gx);
        const targetY = buttonY + px(gy);

        // Start above the screen with horizontal spread
        const startX = targetX + (Math.random() - 0.5) * px(buttonWidth * 2);
        const startY = -px(2) - Math.random() * px(buttonHeight * 3);

        // Get actual color from captured pixels (same as explosion)
        const color = getColorAt(gx, gy);

        // Create the graphics
        const graphics = new PIXI.Graphics();
        graphics.roundPixels = true;
        graphics.rect(0, 0, particleSize, particleSize);
        graphics.fill({ color });
        graphics.position.set(startX, startY);

        // Stagger based on grid position (top-left first, bottom-right last)
        // But also add randomness for a more organic feel (reduced for 1.5x speed)
        const delay = (gy * buttonWidth + gx) * 10 + Math.random() * 33;

        result.push({
          graphics,
          gridX: gx,
          gridY: gy,
          x: startX,
          y: startY,
          vx: 0,
          vy: 0,
          color,
          rotationSpeed: 0,
          scale: 1,
          delay,
          active: false
        });
      }
    }

    return result;
  }

  /**
   * Update explosion phase
   */
  function updateExplosion(deltaTime: number): boolean {
    elapsedTime += deltaTime;
    let allOffScreen = true;

    for (const particle of particles) {
      // Check if particle should start
      if (!particle.active) {
        if (elapsedTime >= particle.delay) {
          particle.active = true;
        } else {
          allOffScreen = false;
          continue;
        }
      }

      // Apply gravity
      particle.vy += gravity * 1.5;

      // Update position
      particle.x += particle.vx * 1.3;
      particle.y += particle.vy * 1.3;

      // Apply drag - particles slow down over time
      particle.vx *= 0.98;

      // Update rotation
      particle.graphics.rotation += particle.rotationSpeed * 1.2;

      // Slight scale variation
      particle.scale = 0.95 + Math.sin(elapsedTime * 0.12 + particle.gridX) * 0.05;
      particle.graphics.scale.set(particle.scale);

      // Update graphics position
      particle.graphics.position.set(particle.x, particle.y);

      // Check if still on screen
      if (particle.y < screenHeight + particleSize * 2) {
        allOffScreen = false;
      }
    }

    return allOffScreen;
  }

  /**
   * Update reassembly phase
   */
  function updateReassembly(deltaTime: number): boolean {
    elapsedTime += deltaTime;
    let allSettled = true;

    for (const particle of particles) {
      // Check if particle should start
      if (!particle.active) {
        if (elapsedTime >= particle.delay) {
          particle.active = true;
        } else {
          allSettled = false;
          continue;
        }
      }

      const targetX = buttonX + px(particle.gridX);
      const targetY = buttonY + px(particle.gridY);

      // Calculate distance to target
      const dx = targetX - particle.x;
      const dy = targetY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 0.5) {
        // Snap to final position
        particle.x = targetX;
        particle.y = targetY;
        particle.vx = 0;
        particle.vy = 0;
      } else {
        allSettled = false;

        // Apply gravity-like falling (1.5x faster)
        particle.vy += gravity * 0.75;

        // Horizontal homing toward target (1.5x faster)
        particle.vx += dx * 0.03;
        particle.vx *= 0.93; // Drag

        // If we've passed the target Y, apply strong correction (1.5x faster)
        if (particle.y > targetY) {
          particle.vy = (targetY - particle.y) * 0.45;
        }

        // Update position (1.5x faster)
        particle.x += particle.vx * 1.5;
        particle.y += particle.vy * 1.5;

        // Clamp Y to not go below target
        if (particle.y > targetY && Math.abs(particle.vy) < 1.5) {
          particle.y = targetY;
          particle.vy = 0;
        }
      }

      // Update graphics
      particle.graphics.position.set(particle.x, particle.y);
      particle.graphics.rotation = 0; // No rotation during reassembly
      particle.graphics.scale.set(1);
    }

    return allSettled;
  }

  /**
   * Main animation loop
   */
  function animate() {
    const deltaTime = 16.67; // Approximate 60fps

    if (phase === 'exploding') {
      const complete = updateExplosion(deltaTime);
      if (complete) {
        // Clean up explosion particles
        cleanupParticles();
        onExplosionComplete?.();

        // Start reassembly
        phase = 'reassembling';
        elapsedTime = 0;
        particles = createReassemblyParticles();
        particleContainer = new PIXI.Container();
        particles.forEach(p => particleContainer!.addChild(p.graphics));
        scene.addChild(particleContainer);
      }
    } else if (phase === 'reassembling') {
      const complete = updateReassembly(deltaTime);
      if (complete) {
        cleanupParticles();
        phase = 'complete';
        onReassemblyComplete?.();
        return;
      }
    }

    if (phase !== 'complete' && phase !== 'idle') {
      animationFrame = requestAnimationFrame(animate);
    }
  }

  /**
   * Clean up particle graphics
   */
  function cleanupParticles() {
    if (particleContainer) {
      scene.removeChild(particleContainer);
      particleContainer.destroy({ children: true });
      particleContainer = null;
    }
    particles = [];
  }

  /**
   * Start the explosion
   */
  function explode() {
    if (phase !== 'idle' && phase !== 'complete') return;

    // Capture actual pixel colors from the source before hiding it
    capturedColors = captureSourceColors();

    phase = 'exploding';
    elapsedTime = 0;
    particles = createParticles();

    // Create container for particles
    particleContainer = new PIXI.Container();
    particles.forEach(p => particleContainer!.addChild(p.graphics));
    scene.addChild(particleContainer);

    // Start animation loop
    animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Destroy and clean up
   */
  function destroy() {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    cleanupParticles();
    phase = 'idle';
  }

  return {
    explode,
    destroy,
    isAnimating: () => phase === 'exploding' || phase === 'reassembling'
  };
}

