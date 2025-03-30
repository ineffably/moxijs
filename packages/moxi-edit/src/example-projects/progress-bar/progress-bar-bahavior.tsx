import { Behavior } from 'moxi';
import PIXI, { BitmapText, Point } from 'pixi.js';

export interface ProgressBarOptions {
  barWidth?: number;
  barHeight?: number;
  max?: number;
  min?: number;
  color?: string | number;
  backgroundColor?: string | number;
  barPadding?: Point;
  value?: number;
  bitmapText?: Partial<PIXI.TextStyle>;
}

export interface TextStyle {
  fontName?: string;
  fontSize?: number;
  align?: string;
  maxWidth?: number;
}

export const defaultProgressBarOptions: ProgressBarOptions = {
  barWidth: 200, // default width of the progress bar
  barHeight: 20, // default height of the progress bar
  max: 100, // default max value
  min: 0, // default min value
  color: 0x00ff00, // default color of the progress bar
  backgroundColor: 0x555555, // default background color of the progress bar
  barPadding: new Point(5, 5),
  bitmapText: {
    fontFamily: 'kenfuture-thin', 
    fontSize: 32, 
    fontStyle: 'normal', 
    fill: 'black', 
  }
};

export class ProgressBarBehavior extends Behavior {
  graphics: PIXI.Graphics;
  backgroundBar: PIXI.Graphics; // the background bar
  forgroundBar: PIXI.Graphics; // the actual bar that will be drawn
  bitmapText: PIXI.BitmapText; // for displaying the percentage text
  name: string;
  value: number;

  constructor(public options: ProgressBarOptions = {}) {
    super();
    this.graphics = new PIXI.Graphics();
    this.forgroundBar = new PIXI.Graphics();
    this.backgroundBar = new PIXI.Graphics();
    this.value = 0;
    
    // You can initialize options here
    this.options = options || {};
    
  }

  setValue(value: number) {
    this.value = value;
  }

  init(renderer: PIXI.Renderer<HTMLCanvasElement>) {
    const { width, height } = renderer.view.canvas;
    const { entity } = this; // get the entity this behavior is attached to
    const { backgroundColor, color, barWidth, barHeight, barPadding, bitmapText } = this.options;
    const padding = new Point(barPadding.x, barPadding.y);

    this.name = 'bartest';
    this.value = 0;

    this.backgroundBar = new PIXI.Graphics();
    this.backgroundBar.fill(backgroundColor);
    this.backgroundBar.rect(0, 0, barWidth, barHeight);
       
    this.forgroundBar = new PIXI.Graphics(); 
    this.forgroundBar.fill(color);
    this.forgroundBar.rect(padding.x, padding.y, 0, barHeight - padding.y);
    
    this.bitmapText = new BitmapText({ text: (this.value + ''), style: bitmapText });
    this.bitmapText.position.set((barWidth / 2) - (this.bitmapText.width / 2), (barHeight / 2) - (this.bitmapText.height / 2));

    // TODO: ok this is annoying. gonig to have to figure out defaults, handlers, overwriters. 
    this.backgroundBar.eventMode = 'none'; // set event mode to none to avoid interaction
    this.forgroundBar.eventMode = 'none'; // set event mode to none to avoid interaction
    this.bitmapText.eventMode = 'none';

    entity.addChild(this.backgroundBar);
    entity.addChild(this.forgroundBar);
    entity.addChild(this.bitmapText);

    entity.position.set(
       (width / 2) - barWidth / 2,
       (height / 3) - barHeight / 2
    );
    
    console.log('ProgressBar initialized with options:', this.options);
  }

  update(deltaTime: number) {
    const {
      max,
      barWidth,
      barHeight,
      color,
      backgroundColor,
      barPadding
    } = this.options;
    const padding = new Point(barPadding.x, barPadding.y);

    const paddedWidth = (barWidth - padding.x * 2);
    const percent = (this.value / max);
    const width = Math.min(paddedWidth * percent, paddedWidth);

    this.backgroundBar.fill(backgroundColor);
    this.backgroundBar.rect(0, 0, barWidth, barHeight);

    this.forgroundBar.fill(color);
    this.forgroundBar.rect(padding.x, padding.y, width, barHeight - (padding.y * 2));

    const textvalue = Math.floor(percent * 100);
    this.bitmapText.text = ('%' + textvalue);

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
