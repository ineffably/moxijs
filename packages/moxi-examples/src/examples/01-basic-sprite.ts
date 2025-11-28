/**
 * Example 01: Sprites!
 * Moxi sprite entities with a pooling example
 * Displays sprites from both space-shooter series in a grid layout
 * Features: Grid placement top-left to bottom-right, sprite pooling, starfield background
 */
import { setupMoxi, asEntity, Logic } from 'moxi-kit';
import type { AsEntity } from 'moxi-kit';
import { Sprite, Graphics, Container } from 'pixi.js';
import { ASSETS } from '../assets-config';

class FadeLogic extends Logic<Sprite> {
  private age = 0;
  private decayRate = 0.1;

  update(entity: Sprite, deltaTime: number): void {
    this.age += deltaTime;
    entity.alpha = Math.max(0, 1 - (this.age * this.decayRate));
    if (entity.alpha <= 0) {
      entity.visible = false;
    }
  }

  reset(): void {
    this.age = 0;
  }
}

interface PooledSprite {
  sprite: Sprite;
  entity: AsEntity<Sprite>;
  active: boolean;
  fadeLogic: FadeLogic;
}

class GridSpritePlacer {
  private sprites: PooledSprite[] = [];
  private maxSprites: number;
  private container: Container;
  private textures: Record<string, any>;
  private textureNames: string[];
  
  // Grid tracking
  private currentX: number = 0;
  private currentY: number = 0;
  private currentTextureIndex: number = 0;
  private viewportWidth: number;
  private viewportHeight: number;
  private tallestInCurrentRow: number = 0;

  constructor(
    maxSprites: number,
    container: Container,
    textures: Record<string, any>,
    textureNames: string[],
    viewportWidth: number,
    viewportHeight: number
  ) {
    this.maxSprites = maxSprites;
    this.container = container;
    this.textures = textures;
    this.textureNames = textureNames;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  spawn(): PooledSprite | null {
    const textureName = this.textureNames[this.currentTextureIndex % this.textureNames.length];
    const texture = this.textures[textureName];
    if (!texture) return null;

    // Wrap to next row if needed
    if (this.currentX + texture.width > this.viewportWidth) {
      this.currentX = 0;
      this.currentY += this.tallestInCurrentRow;
      this.tallestInCurrentRow = 0;
      if (this.currentY >= this.viewportHeight) {
        this.currentY = 0;
      }
    }
    
    if (texture.height > this.tallestInCurrentRow) {
      this.tallestInCurrentRow = texture.height;
    }

    // Find or create sprite
    let pooled = this.sprites.find(s => !s.active);
    if (!pooled) {
      const sprite = new Sprite(texture);
      sprite.anchor.set(0, 0);
      sprite.eventMode = 'none';
      const fadeLogic = new FadeLogic();
      const entity = asEntity(sprite, { FadeLogic: fadeLogic });
      pooled = { sprite, entity, active: false, fadeLogic };
      this.sprites.push(pooled);
      this.container.addChild(entity);
    }

    // Activate and position
    pooled.active = true;
    pooled.sprite.texture = texture;
    pooled.fadeLogic.reset();
    pooled.sprite.x = this.currentX;
    pooled.sprite.y = this.currentY;
    pooled.sprite.rotation = 0;
    pooled.sprite.scale.set(1);
    pooled.sprite.alpha = 1;
    pooled.sprite.visible = true;

    this.currentX += texture.width;
    this.currentTextureIndex++;
    return pooled;
  }

  update(deltaTime: number): void {
    for (const pooled of this.sprites) {
      if (pooled.active) {
        pooled.entity.moxiEntity.update(deltaTime);
        if (pooled.sprite.alpha <= 0) {
          pooled.active = false;
        }
      }
    }
  }
}

function createStarfield(container: Container, width: number, height: number): void {
  const starfield = new Graphics();
  for (let i = 0; i < 200; i++) {
    starfield.circle(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 2 + 0.5
    );
    starfield.fill({ color: 0xffffff, alpha: Math.random() * 0.5 + 0.5 });
  }
  container.addChild(starfield);
}

export async function initBasicSprite() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  const { scene, engine, loadAssets, PIXIAssets } = await setupMoxi({ 
    hostElement: root,
    showLoadingScene: true
  });
  
  // Black background
  scene.renderer.background.color = 0x000000;

  // Load both space-shooter spritesheets
  await loadAssets([
    { src: ASSETS.SPACE_SHOOTER_JSON, alias: 'space_shooter' },
    { src: ASSETS.SPACE_SHOOTER2_JSON, alias: 'space_shooter2' }
  ]);

  const spaceShooterSheet = PIXIAssets.get('space_shooter');
  const spaceShooter2Sheet = PIXIAssets.get('space_shooter2');
  const allTextures = {
    ...spaceShooterSheet.textures,
    ...spaceShooter2Sheet.textures
  };
  const textureNames = Object.keys(allTextures);

  console.log(`✅ Loaded ${textureNames.length} textures from space-shooter series`);

  createStarfield(scene, scene.renderer.width, scene.renderer.height);

  const spriteContainer = new Container();
  scene.addChild(spriteContainer);

  const gridPlacer = new GridSpritePlacer(
    1000,
    spriteContainer,
    allTextures,
    textureNames,
    scene.renderer.width,
    scene.renderer.height
  );

  let spawnTimer = 0;
  engine.ticker.add((ticker) => {
    const deltaTime = ticker.deltaTime / 60;
    spawnTimer += deltaTime;
    if (spawnTimer >= 0.05) {
      spawnTimer = 0;
      gridPlacer.spawn();
    }
    gridPlacer.update(deltaTime);
  });

  scene.init();
  engine.start();

  console.log('✅ Enhanced Basic Sprite example loaded');
  console.log(`💡 Placing sprites in grid from ${textureNames.length} textures, max 1000 active`);
}
