import { Logic, asEntity, setupMoxi } from 'moxi-kit';
import * as PIXI from 'pixi.js';
import { Assets, BitmapFont } from 'pixi.js';
import { ASSETS } from '../assets-config';

/**
 * Progress Bar Example
 * Demonstrates a custom Logic component that creates an animated progress bar
 */

export interface ProgressBarOptions {
  barWidth?: number;
  barHeight?: number;
  max?: number;
  min?: number;
  color?: string | number;
  backgroundColor?: string | number;
  barPadding?: PIXI.Point;
  value?: number;
  bitmapText?: {
    fontFamily?: string;
    fontSize?: number;
  };
}

export const defaultProgressBarOptions: ProgressBarOptions = {
  barWidth: 200,
  barHeight: 20,
  max: 100,
  min: 0,
  color: 0x00ff00,
  backgroundColor: 0x555555,
  barPadding: new PIXI.Point(5, 5),
  bitmapText: {
    fontFamily: 'PixelOperator8',
    fontSize: 32
  }
};

export class ProgressBarLogic extends Logic<PIXI.Container> {
  backgroundBar: PIXI.Graphics;
  forgroundBar: PIXI.Graphics;
  bitmapText: PIXI.BitmapText;
  value: number;
  nextBar?: ProgressBarLogic;
  autoIncrement: boolean = false;

  constructor(public options: ProgressBarOptions = {}, nextBar?: ProgressBarLogic, autoIncrement: boolean = false) {
    super();
    this.forgroundBar = new PIXI.Graphics();
    this.backgroundBar = new PIXI.Graphics();
    this.value = 0;
    this.nextBar = nextBar;
    this.autoIncrement = autoIncrement;
    this.options = { ...defaultProgressBarOptions, ...options };
  }

  setValue(value: number) {
    this.value = value;
  }

  addBean() {
    this.value += 1;

    // Check if this bar is now full
    if (this.value >= this.options.max!) {
      // Add a bean to the next bar
      if (this.nextBar) {
        this.nextBar.addBean();
      }
      // Reset this bar
      this.value = 0;
    }
  }

  init(entity: PIXI.Container, renderer: PIXI.Renderer<HTMLCanvasElement>) {
    const { width, height } = renderer.canvas;
    const { backgroundColor, color, barWidth, barHeight, barPadding, bitmapText } = this.options;
    const padding = new PIXI.Point(barPadding.x, barPadding.y);

    this.value = 0;

    this.backgroundBar = new PIXI.Graphics();
    this.backgroundBar.rect(0, 0, barWidth, barHeight);
    this.backgroundBar.fill(backgroundColor);
       
    this.forgroundBar = new PIXI.Graphics(); 
    this.forgroundBar.rect(padding.x, padding.y, 0, barHeight - padding.y);
    this.forgroundBar.fill(color);
    
    this.bitmapText = new PIXI.BitmapText({
      text: `${this.value}%`,
      style: {
        fontFamily: bitmapText?.fontFamily || 'PixelOperator8',
        fontSize: bitmapText?.fontSize || 32
      }
    });
    
    this.bitmapText.position.set(
      (barWidth / 2) - (this.bitmapText.width / 2), 
      (barHeight / 2) - (this.bitmapText.height / 2)
    );

    this.backgroundBar.eventMode = 'none';
    this.forgroundBar.eventMode = 'none';
    this.bitmapText.eventMode = 'none';

    entity.addChild(this.backgroundBar);
    entity.addChild(this.forgroundBar);
    entity.addChild(this.bitmapText);

    // Position will be set externally in initProgressBar
  }

  update(entity: PIXI.Container, deltaTime: number) {
    const { max, barWidth, barHeight, color, backgroundColor, barPadding } = this.options;
    const padding = new PIXI.Point(barPadding.x, barPadding.y);

    // Only auto-increment if this bar is set to auto-increment
    if (this.autoIncrement) {
      this.value += (deltaTime * 10);

      // Check if we completed
      if (this.value >= max) {
        // Add a bean to the next bar
        if (this.nextBar) {
          this.nextBar.addBean();
        }
        // Reset
        this.value = 0;
      }
    }

    const paddedWidth = (barWidth - padding.x * 2);
    const percent = (this.value / max);
    const width = Math.min(paddedWidth * percent, paddedWidth);

    this.backgroundBar.clear();
    this.backgroundBar.rect(0, 0, barWidth, barHeight);
    this.backgroundBar.fill(backgroundColor);

    this.forgroundBar.clear();
    this.forgroundBar.rect(padding.x, padding.y, width, barHeight - (padding.y * 2));
    this.forgroundBar.fill(color);

    const textvalue = Math.floor(percent * 100);
    if (this.bitmapText) {
      this.bitmapText.text = `${textvalue}%`;
    }
  }
}

// Logic to keep progress bars centered on screen resize
class CenterBarsLogic extends Logic<PIXI.Container> {
  private bars: PIXI.Container[];
  private barWidth: number;
  private spacing: number;
  private renderer: PIXI.Renderer<HTMLCanvasElement>;

  constructor(bars: PIXI.Container[], barWidth: number, spacing: number, renderer: PIXI.Renderer<HTMLCanvasElement>) {
    super();
    this.bars = bars;
    this.barWidth = barWidth;
    this.spacing = spacing;
    this.renderer = renderer;
  }

  update(entity: PIXI.Container, deltaTime: number) {
    const width = this.renderer.width;
    const height = this.renderer.height;
    const startY = (height / 2) - (this.spacing * 1.5); // Center all 3 bars vertically

    // Update positions to keep bars centered
    this.bars.forEach((bar, index) => {
      bar.x = (width / 2) - (this.barWidth / 2);
      bar.y = startY + (index * this.spacing);
    });
  }
}

export async function initProgressBar() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  const { scene, engine, loadAssets } = await setupMoxi({ 
    hostElement: root,
    showLoadingScene: true
  });

  // Load the font for the percentage text
  await Assets.load(ASSETS.PIXEL_OPERATOR8_FONT);

  // Install bitmap font
  BitmapFont.install({
    name: 'PixelOperator8',
    style: {
      fontFamily: 'PixelOperator8',
      fontSize: 32,
      fill: 0x000000
    }
  });

  const { width, height } = scene.renderer.canvas;
  const barWidth = 400;
  const barHeight = 55;
  const spacing = 80;
  const startY = (height / 2) - (spacing * 1.5); // Center all 3 bars vertically

  // Create bars in reverse order so we can chain them
  // Bar 3 (orange) - static counter, just displays beans
  const progressBar3 = asEntity<PIXI.Container>(new PIXI.Container());
  const bar3Logic = new ProgressBarLogic({
    ...defaultProgressBarOptions,
    backgroundColor: 'silver',
    color: 0xff6600, // Orange
    barWidth,
    barHeight,
    bitmapText: {
      fontFamily: 'PixelOperator8',
      fontSize: 32
    }
  }, undefined, false); // No next bar, doesn't auto-increment
  progressBar3.moxiEntity.addLogic(bar3Logic);
  progressBar3.position.set((width / 2) - (barWidth / 2), startY + (spacing * 2));
  scene.addChild(progressBar3);
  progressBar3.moxiEntity.init(scene.renderer);

  // Bar 2 (cyan) - static counter, accumulates beans from bar 1, sends to bar 3
  const progressBar2 = asEntity<PIXI.Container>(new PIXI.Container());
  const bar2Logic = new ProgressBarLogic({
    ...defaultProgressBarOptions,
    backgroundColor: 'silver',
    color: 0x00d4ff, // Cyan
    barWidth,
    barHeight,
    bitmapText: {
      fontFamily: 'PixelOperator8',
      fontSize: 32
    }
  }, bar3Logic, false); // Links to bar 3, doesn't auto-increment
  progressBar2.moxiEntity.addLogic(bar2Logic);
  progressBar2.position.set((width / 2) - (barWidth / 2), startY + spacing);
  scene.addChild(progressBar2);
  progressBar2.moxiEntity.init(scene.renderer);

  // Bar 1 (green) - ONLY bar that auto-increments
  const progressBar1 = asEntity<PIXI.Container>(new PIXI.Container());
  const bar1Logic = new ProgressBarLogic({
    ...defaultProgressBarOptions,
    backgroundColor: 'silver',
    color: 0x00ff00, // Green
    barWidth,
    barHeight,
    bitmapText: {
      fontFamily: 'PixelOperator8',
      fontSize: 32
    }
  }, bar2Logic, true); // Links to bar 2, auto-increments!
  progressBar1.moxiEntity.addLogic(bar1Logic);
  progressBar1.position.set((width / 2) - (barWidth / 2), startY);
  scene.addChild(progressBar1);
  progressBar1.moxiEntity.init(scene.renderer);

  // Create a container to manage centering of all bars
  const barsContainer = asEntity<PIXI.Container>(new PIXI.Container());
  
  // Add logic to keep bars centered on resize
  const centerLogic = new CenterBarsLogic([progressBar1, progressBar2, progressBar3], barWidth, spacing, scene.renderer);
  barsContainer.moxiEntity.addLogic(centerLogic);
  scene.addChild(barsContainer);

  scene.init();
  engine.start();

}

