import PIXI from 'pixi.js';
import { Container, Graphics, Text } from 'pixi.js';

export interface LoadingSceneOptions {
  backgroundColor?: number;
  squareSize?: number;
  numSquares?: number;
  text?: string;
  textStyle?: Partial<PIXI.TextStyle>;
}

const PALETTE = [0xf0dab1, 0xe39aac, 0xc45d9f, 0x634b7d, 0x6461c2, 0x2ba9b4, 0x93d4b5, 0xf0f6e8];

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
 * Default loading scene component for Moxi
 * Displays animated pixel squares falling above loading text
 * 
 * @category Library
 */
export class LoadingScene extends Container {
  private particles: Particle[] = [];
  private text: Text;
  private background: Graphics;
  private ticker: PIXI.Ticker;
  private renderer: PIXI.Renderer | null = null;
  private time: number = 0;
  private nextSpawn: number = 0;
  private maxParticles: number;
  private baseSize: number;
  private backgroundColor: number;

  constructor(options: LoadingSceneOptions = {}) {
    super();

    const {
      backgroundColor = 0x1a1a1a,
      squareSize = 20,
      numSquares = 30,
      text = 'LOADING...',
      textStyle = {}
    } = options;

    this.maxParticles = numSquares;
    this.baseSize = squareSize;
    this.backgroundColor = backgroundColor;

    // Background
    this.background = new Graphics();
    this.addChild(this.background);

    // Text
    this.text = new Text({
      text,
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 16,
        fill: 0xffffff,
        fontWeight: 'bold',
        ...textStyle
      }
    });
    this.text.anchor.set(0.5);
    this.addChild(this.text);

    // Ticker
    this.ticker = new PIXI.Ticker();
    this.ticker.autoStart = false;
    this.ticker.add(() => {
      if (this.visible && this.renderer) {
        this.time += this.ticker.deltaTime / 60;
        this.update(this.renderer.width, this.renderer.height);
        this.renderer.render(this);
      }
    });
  }

  private spawnParticle(width: number, height: number): void {
    if (this.particles.length >= this.maxParticles || this.time < this.nextSpawn) return;

    const size = this.baseSize * (0.7 + Math.random() * 0.6);
    const sprite = new Graphics();
    sprite.rect(0, 0, size, size);
    sprite.fill({ color: PALETTE[Math.floor(Math.random() * PALETTE.length)] });
    sprite.pivot.set(size / 2, size / 2);
    this.addChild(sprite);

    const textY = height / 2 + 60;
    const textWidth = this.text.width || 200;
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

    this.nextSpawn = this.time + Math.random() * 0.5;
  }

  private update(width: number, height: number): void {
    // Background
    this.background.clear();
    this.background.rect(0, 0, width, height);
    this.background.fill({ color: this.backgroundColor });

    // Text position
    this.text.x = width / 2 - 4;
    this.text.y = height / 2 + 60;

    // Spawn particles
    this.spawnParticle(width, height);

    // Update particles
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

  init(renderer: PIXI.Renderer): void {
    this.renderer = renderer;
  }

  show(): void {
    this.visible = true;
    this.time = 0;
    this.nextSpawn = 0;
    this.particles.forEach(p => p.sprite.destroy());
    this.particles = [];
    if (!this.ticker.started) {
      this.ticker.start();
    }
  }

  hide(): void {
    this.visible = false;
    if (this.ticker.started) {
      this.ticker.stop();
    }
  }

  destroy(): void {
    if (this.ticker.started) {
      this.ticker.stop();
    }
    this.ticker.destroy();
    this.particles.forEach(p => p.sprite.destroy());
    super.destroy();
  }
}
