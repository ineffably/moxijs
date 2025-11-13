import { Logic, asEntity, setupMoxi } from 'moxi';
import * as PIXI from 'pixi.js';
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
  bitmapText?: Partial<PIXI.TextStyle>;
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
    fontFamily: 'kenney-future-thin',
    fontSize: 32,
    fontStyle: 'normal',
    fill: 'black',
  }
};

export class ProgressBarLogic extends Logic<PIXI.Sprite> {
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

  init(entity: PIXI.Sprite, renderer: PIXI.Renderer<HTMLCanvasElement>) {
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
      text: `%${this.value}`,
      style: bitmapText
    } as PIXI.TextOptions);
    
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

  update(entity: PIXI.Sprite, deltaTime: number) {
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

export async function initProgressBar() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  const { scene, engine, loadAssets } = await setupMoxi({ hostElement: root });

  // Load the font for the percentage text
  await loadAssets([
    { src: ASSETS.KENNEY_FUTURE_THIN_FONT, alias: 'kenney-future-thin' }
  ]);

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
      ...defaultProgressBarOptions.bitmapText,
      fontSize: 32,
      align: 'center',
      fill: 'black'
    }
  }, undefined, false); // No next bar, doesn't auto-increment
  progressBar3.moxiEntity.addLogic(bar3Logic);
  progressBar3.position.set((width / 2) - (barWidth / 2), startY + (spacing * 2));
  scene.addChild(progressBar3);

  // Bar 2 (cyan) - static counter, accumulates beans from bar 1, sends to bar 3
  const progressBar2 = asEntity<PIXI.Container>(new PIXI.Container());
  const bar2Logic = new ProgressBarLogic({
    ...defaultProgressBarOptions,
    backgroundColor: 'silver',
    color: 0x00d4ff, // Cyan
    barWidth,
    barHeight,
    bitmapText: {
      ...defaultProgressBarOptions.bitmapText,
      fontSize: 32,
      align: 'center',
      fill: 'black'
    }
  }, bar3Logic, false); // Links to bar 3, doesn't auto-increment
  progressBar2.moxiEntity.addLogic(bar2Logic);
  progressBar2.position.set((width / 2) - (barWidth / 2), startY + spacing);
  scene.addChild(progressBar2);

  // Bar 1 (green) - ONLY bar that auto-increments
  const progressBar1 = asEntity<PIXI.Container>(new PIXI.Container());
  const bar1Logic = new ProgressBarLogic({
    ...defaultProgressBarOptions,
    backgroundColor: 'silver',
    color: 0x00ff00, // Green
    barWidth,
    barHeight,
    bitmapText: {
      ...defaultProgressBarOptions.bitmapText,
      fontSize: 32,
      align: 'center',
      fill: 'black'
    }
  }, bar2Logic, true); // Links to bar 2, auto-increments!
  progressBar1.moxiEntity.addLogic(bar1Logic);
  progressBar1.position.set((width / 2) - (barWidth / 2), startY);
  scene.addChild(progressBar1);

  scene.init();
  engine.start();

}

