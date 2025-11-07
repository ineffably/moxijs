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
    fontFamily: 'kenfuture-thin', 
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

  constructor(public options: ProgressBarOptions = {}) {
    super();
    this.forgroundBar = new PIXI.Graphics();
    this.backgroundBar = new PIXI.Graphics();
    this.value = 0;
    this.options = { ...defaultProgressBarOptions, ...options };
  }

  setValue(value: number) {
    this.value = value;
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

    entity.position.set(
       (width / 2) - barWidth / 2,
       (height / 3) - barHeight / 2
    );
  }

  update(entity: PIXI.Sprite, deltaTime: number) {
    const { max, barWidth, barHeight, color, backgroundColor, barPadding } = this.options;
    const padding = new PIXI.Point(barPadding.x, barPadding.y);

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
      this.bitmapText.text = '%' + textvalue;
    }

    if (this.value > max) {
      this.forgroundBar.clear();
      this.setValue(0);
    }
    if (this.value <= max) {
      const nextValue = this.value += (deltaTime);
      this.setValue(nextValue);
    }
  }
}

export async function initProgressBar() {
  const root = document.getElementById('app');
  if (!root) throw new Error('App element not found');

  const { scene, engine, loadAssets } = await setupMoxi({ hostElement: root });
  
  // Load the font for the percentage text
  await loadAssets([
    { src: ASSETS.KENFUTURE_THIN_FONT, alias: 'kenfuture-thin' }
  ]);

  const moxiProgressBar = asEntity<PIXI.Container>(new PIXI.Container());
    
  const barOptions: ProgressBarOptions = { 
    backgroundColor: 'silver',
    color: 'green',
    barHeight: 55,
    bitmapText: { 
      ...defaultProgressBarOptions.bitmapText,
      fontSize: 32, 
      align: 'center',
      fill: 'black' 
    }
  };
  
  moxiProgressBar.moxiEntity.addLogic(
    new ProgressBarLogic({ ...defaultProgressBarOptions, ...barOptions })
  );
  
  scene.addChild(moxiProgressBar);
  scene.init();
  engine.start();

  console.log('✅ Progress Bar example loaded');
}

