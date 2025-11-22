/**
 * Example 12: Font Rendering Comparison
 *
 * Side-by-side comparison of the two main text rendering methods in PixiJS v8:
 * - Text: Rich styling with gradients, shadows, and strokes
 * - BitmapText: High performance for frequently updated text
 *
 * This demo helps developers choose the right method for their use case.
 */
import { setupMoxi, Logic, asEntity, UIScrollContainer, UIComponent, EdgeInsets } from 'moxi';
import type { MeasuredSize } from 'moxi';
import * as PIXI from 'pixi.js';
import { Assets, BitmapText, Text } from 'pixi.js';
import { ASSETS } from '../assets-config';

export async function initFontRenderingComparison() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('Canvas container not found');

  const { scene, engine, renderer } = await setupMoxi({
    hostElement: root,
    renderOptions: {
      width: 1600,
      height: 900,
      backgroundColor: 0x0a0a0a,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: false,
      roundPixels: true
    }
  });

  // Load fonts
  await Assets.load([
    ASSETS.KENNEY_BLOCKS_FONT,
    ASSETS.KENNEY_FUTURE_FONT,
    ASSETS.KENNEY_FUTURE_NARROW_FONT,
    ASSETS.KENNEY_BOLD_FONT,
    ASSETS.KENVECTOR_FUTURE_FONT,
    ASSETS.KENVECTOR_FUTURE_THIN_FONT,
    ASSETS.PIXEL_OPERATOR8_FONT,
    ASSETS.PIXEL_OPERATOR8_BOLD_FONT,
    ASSETS.PIXEL_OPERATOR_FONT,
    ASSETS.PIXEL_OPERATOR_BOLD_FONT,
    ASSETS.MINECRAFT_FONT,
    ASSETS.DOGICA_PIXEL_FONT,
    ASSETS.DOGICA_PIXEL_BOLD_FONT,
    ASSETS.RETRO_GAMING_FONT,
    ASSETS.VHS_GOTHIC_FONT,
    ASSETS.RAINYHEARTS_FONT
  ]);

  // Generate bitmap fonts from TTF - data-driven approach
  const fontConfigs = [
    { name: 'KenneyBlocks', fontFamily: 'Kenney Blocks', fontSize: 32 },
    { name: 'KenneyFuture', fontFamily: 'Kenney Future', fontSize: 24 },
    { name: 'KenneyFutureNarrow', fontFamily: 'Kenney Future Narrow', fontSize: 24 },
    { name: 'KenneyBold', fontFamily: 'Kenney Bold', fontSize: 24 },
    { name: 'KenvectorFuture', fontFamily: 'Kenvector Future', fontSize: 24 },
    { name: 'KenvectorFutureThin', fontFamily: 'Kenvector Future Thin', fontSize: 24 },
    { name: 'PixelOperator8', fontFamily: 'PixelOperator8', fontSize: 24 },
    { name: 'PixelOperator8Bold', fontFamily: 'PixelOperator8-Bold', fontSize: 24 },
    { name: 'PixelOperator', fontFamily: 'PixelOperator', fontSize: 24 },
    { name: 'PixelOperatorBold', fontFamily: 'PixelOperator-Bold', fontSize: 24 },
    { name: 'Minecraft', fontFamily: 'Minecraft', fontSize: 24 },
    { name: 'DogicaPixel', fontFamily: 'Dogica Pixel', fontSize: 24 },
    { name: 'DogicaPixelBold', fontFamily: 'Dogica Pixel Bold', fontSize: 24 },
    { name: 'RetroGaming', fontFamily: 'Retro Gaming', fontSize: 24 },
    { name: 'VHSGothic', fontFamily: 'VHS Gothic', fontSize: 24 },
    { name: 'RainyHearts', fontFamily: 'RainyHearts', fontSize: 24 }
  ];

  fontConfigs.forEach(config => {
    PIXI.BitmapFont.install({
      name: config.name,
      style: {
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        fill: 0xffffff
      }
    });
  });

  // Create three columns for comparison
  const columnWidths = [420, 420, 640];
  const columnX = [50, 500, 950];
  const startY = 20;

  // ===== COLUMN 1: Text =====
  createTextColumn(scene, columnX[0], startY, columnWidths[0]);

  // ===== COLUMN 2: BitmapText =====
  createBitmapTextColumn(scene, engine, columnX[1], startY, columnWidths[1]);

  // ===== COLUMN 3: Font Samples =====
  createFontSamplesColumn(scene, columnX[2], startY, columnWidths[2]);

  // Initialize and start
  scene.init();
  engine.start();

  console.log('✅ Font Rendering Comparison loaded');
}

// ===== COLUMN 1: Text =====
function createTextColumn(scene: PIXI.Container, x: number, y: number, width: number) {
  // Header
  const header = new PIXI.Graphics();
  header.rect(0, 0, width, 50);
  header.fill({ color: 0x3498db });
  header.position.set(x, y);
  scene.addChild(header);

  const headerText = new Text({
    text: 'Text',
    style: {
      fontSize: 26,
      fill: 0xffffff,
      fontWeight: 'bold'
    },
    resolution: 2
  });
  headerText.anchor.set(0.5, 0.5);
  headerText.position.set(x + width / 2, y + 25);
  scene.addChild(headerText);

  // Background panel
  const panel = new PIXI.Graphics();
  panel.rect(0, 0, width, 825);
  panel.fill({ color: 0x2c3e50 });
  panel.position.set(x, y + 55);
  scene.addChild(panel);

  let currentY = y + 75;

  // Example 1: Basic Text
  const basic = new Text({
    text: 'Basic Text',
    style: {
      fontSize: 26,
      fill: 0xffffff
    },
    resolution: 2
  });
  basic.position.set(x + 20, currentY);
  scene.addChild(basic);
  currentY += 40;

  // Example 2: Styled Text
  const styled = new Text({
    text: 'Bold & Styled',
    style: {
      fontSize: 26,
      fill: 0xff6b35,
      fontWeight: 'bold',
      fontStyle: 'italic'
    },
    resolution: 2
  });
  styled.position.set(x + 20, currentY);
  scene.addChild(styled);
  currentY += 50;

  // Example 3: Gradient Text
  const gradientFill = new PIXI.FillGradient(0, 0, 0, 30 * 1.7);
  gradientFill.addColorStop(0, 0xff00ff);
  gradientFill.addColorStop(0.5, 0x00ffff);
  gradientFill.addColorStop(1, 0xffff00);

  const gradient = new Text({
    text: 'Gradient Fill',
    style: {
      fontSize: 30,
      fill: gradientFill
    },
    resolution: 2
  });
  gradient.position.set(x + 20, currentY);
  scene.addChild(gradient);
  currentY += 50;

  // Example 4: Stroke Text
  const stroke = new Text({
    text: 'Outlined Text',
    style: {
      fontSize: 30,
      fill: 0xffffff,
      stroke: { color: 0x000000, width: 4 }
    },
    resolution: 2
  });
  stroke.position.set(x + 20, currentY);
  scene.addChild(stroke);
  currentY += 50;

  // Example 5: Shadow Text
  const shadow = new Text({
    text: 'Drop Shadow',
    style: {
      fontSize: 30,
      fill: 0xffffff,
      dropShadow: {
        alpha: 0.8,
        angle: Math.PI / 4,
        blur: 4,
        color: 0x000000,
        distance: 5
      }
    },
    resolution: 2
  });
  shadow.position.set(x + 20, currentY);
  scene.addChild(shadow);
  currentY += 50;

  // Example 6: Word Wrap
  const wordWrap = new Text({
    text: 'This text demonstrates word wrapping with a maximum width constraint. Perfect for dialogue boxes!',
    style: {
      fontSize: 18,
      fill: 0xeeeeee,
      wordWrap: true,
      wordWrapWidth: width - 40
    },
    resolution: 2
  });
  wordWrap.position.set(x + 20, currentY);
  scene.addChild(wordWrap);
  currentY += 90;

  // Pros/Cons label
  const prosLabel = new Text({
    text: '✅ Rich styling\n✅ Gradients & effects\n✅ Easy to use\n\n❌ Slower performance\n❌ Texture per text',
    style: {
      fontSize: 16,
      fill: 0xcccccc,
      lineHeight: 20
    },
    resolution: 2
  });
  prosLabel.position.set(x + 20, currentY);
  scene.addChild(prosLabel);
}

// ===== COLUMN 2: BitmapText =====
function createBitmapTextColumn(scene: PIXI.Container, engine: any, x: number, y: number, width: number) {
  // Header
  const header = new PIXI.Graphics();
  header.rect(0, 0, width, 50);
  header.fill({ color: 0x2ecc71 });
  header.position.set(x, y);
  scene.addChild(header);

  const headerText = new BitmapText({
    text: 'BitmapText',
    style: {
      fontFamily: 'KenneyFuture',
      fontSize: 26
    }
  });
  headerText.anchor.set(0.5, 0.5);
  headerText.position.set(x + width / 2, y + 25);
  scene.addChild(headerText);

  // Background panel
  const panel = new PIXI.Graphics();
  panel.rect(0, 0, width, 825);
  panel.fill({ color: 0x27ae60 });
  panel.alpha = 0.3;
  panel.position.set(x, y + 55);
  scene.addChild(panel);

  let currentY = y + 75;

  // Example 1: Basic BitmapText
  const basic = new BitmapText({
    text: 'Fast BitmapText',
    style: {
      fontFamily: 'KenneyBlocks',
      fontSize: 30
    }
  });
  basic.position.set(x + 20, currentY);
  scene.addChild(basic);
  currentY += 50;

  // Example 2: Tinted BitmapText
  const tinted = new BitmapText({
    text: 'Color Tinted',
    style: {
      fontFamily: 'KenneyBlocks',
      fontSize: 30
    }
  });
  tinted.tint = 0xff6b35;
  tinted.position.set(x + 20, currentY);
  scene.addChild(tinted);
  currentY += 50;

  // Example 3: Performance Counter (updates every frame!)
  const counterLabel = new BitmapText({
    text: 'Live Counter (60 FPS):',
    style: {
      fontFamily: 'KenneyFuture',
      fontSize: 18
    }
  });
  counterLabel.position.set(x + 20, currentY);
  scene.addChild(counterLabel);

  const counter = new BitmapText({
    text: '0',
    style: {
      fontFamily: 'KenneyBlocks',
      fontSize: 34
    }
  });
  counter.tint = 0xffff00;
  counter.position.set(x + 20, currentY + 25);
  scene.addChild(counter);

  // Counter logic
  class CounterLogic extends Logic<BitmapText> {
    private counter = 0;
    constructor(private text: BitmapText) {
      super();
    }
    update() {
      this.counter += 123;
      this.text.text = this.counter.toString();
    }
  }

  const counterEntity = asEntity(counter);
  counterEntity.moxiEntity.addLogic(new CounterLogic(counter));
  engine.ticker.add(() => counterEntity.moxiEntity.update(0));

  currentY += 90;

  // Example 4: Multiple instances
  const multiLabel = new BitmapText({
    text: 'Multiple instances (100):',
    style: {
      fontFamily: 'KenneyFuture',
      fontSize: 18
    }
  });
  multiLabel.position.set(x + 20, currentY);
  scene.addChild(multiLabel);
  currentY += 30;

  const container = new PIXI.Container();
  container.position.set(x + 20, currentY);
  scene.addChild(container);

  for (let i = 0; i < 100; i++) {
    const item = new BitmapText({
      text: (i % 10).toString(),
      style: {
        fontFamily: 'KenneyBlocks',
        fontSize: 14
      }
    });
    item.tint = [0xff0000, 0xff9900, 0xffff00, 0x00ff00, 0x00ffff,
                 0x0088ff, 0xff00ff, 0xff6666, 0xaaaaaa, 0xffffff][i % 10];
    item.position.set((i % 20) * 18, Math.floor(i / 20) * 20);
    container.addChild(item);
  }
  currentY += 120;

  // Pros/Cons label
  const prosLabel = new BitmapText({
    text: '✅ Very fast updates\n✅ Low memory\n✅ Many instances\n✅ Best for mobile\n\n❌ Limited styling\n❌ Requires font prep',
    style: {
      fontFamily: 'KenneyFuture',
      fontSize: 16
    }
  });
  prosLabel.position.set(x + 20, currentY);
  scene.addChild(prosLabel);
}

// ===== COLUMN 3: Font Samples =====
function createFontSamplesColumn(scene: PIXI.Container, x: number, y: number, width: number) {
  // Header
  const header = new PIXI.Graphics();
  header.rect(0, 0, width, 50);
  header.fill({ color: 0x9b59b6 });
  header.position.set(x, y);
  scene.addChild(header);

  const headerText = new Text({
    text: 'Font Samples',
    style: {
      fontSize: 26,
      fill: 0xffffff,
      fontWeight: 'bold'
    },
    resolution: 2
  });
  headerText.anchor.set(0.5, 0.5);
  headerText.position.set(x + width / 2, y + 25);
  scene.addChild(headerText);

  // Background panel
  const panel = new PIXI.Graphics();
  panel.rect(0, 0, width, 825);
  panel.fill({ color: 0x8e44ad });
  panel.alpha = 0.3;
  panel.position.set(x, y + 55);
  scene.addChild(panel);

  // Create scroll container for font samples
  const scrollView = new UIScrollContainer({
    width: width,
    height: 825,
    backgroundColor: 0x8e44ad,
    scrollbarWidth: 14,
    scrollbarTrackColor: 0x2d2d44,
    scrollbarThumbColor: 0x4a4a6a,
    scrollbarThumbHoverColor: 0x6a6a8a,
    padding: EdgeInsets.all(0)
  });
  scrollView.container.x = x;
  scrollView.container.y = y + 55;
  scene.addChild(scrollView.container);

  // Create content container for font samples
  const contentContainer = new PIXI.Container();
  
  // Create a UIComponent wrapper for the content
  class FontSamplesContent extends UIComponent {
    private contentHeight: number = 0;

    constructor(private pixiContainer: PIXI.Container) {
      super();
      this.container.addChild(pixiContainer);
    }

    measure(): MeasuredSize {
      // Calculate height from children
      let maxY = 0;
      this.pixiContainer.children.forEach(child => {
        const bounds = child.getBounds();
        const bottom = bounds.y + bounds.height;
        if (bottom > maxY) {
          maxY = bottom;
        }
      });
      this.contentHeight = maxY + 20; // Add padding at bottom
      return {
        width: width,
        height: this.contentHeight
      };
    }

    layout(availableWidth: number, availableHeight: number): void {
      // No-op, children are positioned absolutely
    }

    protected render(): void {
      // No-op, children are rendered directly
    }
  }

  const fontSamplesContent = new FontSamplesContent(contentContainer);
  scrollView.addChild(fontSamplesContent);

  let currentY = 20;

  // Font showcase section - all fonts including new ones
  const fontSamples = [
    { name: 'Kenney Blocks', fontFamily: 'KenneyBlocks', size: 20, lineHeight: 25 },
    { name: 'Kenney Bold', fontFamily: 'KenneyBold', size: 20, lineHeight: 32 },
    { name: 'Kenney Future Narrow', fontFamily: 'KenneyFutureNarrow', size: 20, lineHeight: 25 },
    { name: 'Kenvector Future', fontFamily: 'KenvectorFuture', size: 20, lineHeight: 25 },
    { name: 'Kenvector Future Thin', fontFamily: 'KenvectorFutureThin', size: 20, lineHeight: 25 },
    { name: 'PixelOperator8 Regular', fontFamily: 'PixelOperator8', size: 20, lineHeight: 25 },
    { name: 'PixelOperator8 Bold', fontFamily: 'PixelOperator8Bold', size: 20, lineHeight: 25 },
    { name: 'PixelOperator Regular', fontFamily: 'PixelOperator', size: 20, lineHeight: 25 },
    { name: 'PixelOperator Bold', fontFamily: 'PixelOperatorBold', size: 20, lineHeight: 25 },
    { name: 'Minecraft', fontFamily: 'Minecraft', size: 20, lineHeight: 25 },
    { name: 'Dogica Pixel Regular', fontFamily: 'DogicaPixel', size: 20, lineHeight: 25 },
    { name: 'Dogica Pixel Bold', fontFamily: 'DogicaPixelBold', size: 20, lineHeight: 25 },
    { name: 'Retro Gaming', fontFamily: 'RetroGaming', size: 20, lineHeight: 25 },
    { name: 'VHS Gothic', fontFamily: 'VHSGothic', size: 20, lineHeight: 25 },
    { name: 'RainyHearts', fontFamily: 'RainyHearts', size: 20, lineHeight: 25 }
  ];

  const sampleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n0123456789 !@#$%^&*()_+-=';

  fontSamples.forEach(font => {
    // Font name label
    const fontNameLabel = new BitmapText({
      text: font.name + ':',
      style: {
        fontFamily: 'KenneyFuture',
        fontSize: 18
      }
    });
    fontNameLabel.position.set(20, currentY);
    contentContainer.addChild(fontNameLabel);
    currentY += 25;

    // Character sample
    const sample = new BitmapText({
      text: sampleChars,
      style: {
        fontFamily: font.fontFamily,
        fontSize: font.size,
        lineHeight: font.lineHeight
      }
    });
    sample.position.set(20, currentY);
    contentContainer.addChild(sample);
    currentY += 100;
  });

  // Update scroll container layout after adding all children
  fontSamplesContent.markLayoutDirty();
  scrollView.layout(width, 825);
}

