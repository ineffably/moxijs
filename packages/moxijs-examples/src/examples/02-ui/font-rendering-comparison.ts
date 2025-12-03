/**
 * Example 12: Font Rendering Comparison
 *
 * Side-by-side comparison of the two main text rendering methods in PixiJS v8:
 * - Text: Rich styling with gradients, shadows, and strokes
 * - BitmapText: High performance for frequently updated text
 *
 * This demo helps developers choose the right method for their use case.
 */
import { setupMoxi, Logic, asEntity, asMSDFText } from '@moxijs/core';
import { UIScrollContainer, UIComponent, EdgeInsets } from '@moxijs/ui';
import type { MeasuredSize } from '@moxijs/ui';
import * as PIXI from 'pixi.js';
import { Assets, BitmapText, Text } from 'pixi.js';
import { ASSETS } from '../../assets-config';

export async function initFontRenderingComparison() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('Canvas container not found');

  const { scene, engine, renderer } = await setupMoxi({
    hostElement: root,
    showLoadingScene: true,
    pixelPerfect: false, // Disabled for MSDF rendering (requires smooth texture filtering)
    renderOptions: {
      width: 1600,
      height: 900,
      backgroundColor: 0x0a0a0a,
      antialias: true,
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

  // Load MSDF font
  await Assets.load({
    alias: 'PixelOperator8-MSDF',
    src: ASSETS.PIXEL_OPERATOR8_MSDF_JSON
  });

  // Generate bitmap fonts from TTF - data-driven approach
  // Pixel fonts use smaller sizes for crisp rasterization
  const fontConfigs = [
    { name: 'KenneyBlocks', fontFamily: 'Kenney Blocks', fontSize: 32 },
    { name: 'KenneyFuture', fontFamily: 'Kenney Future', fontSize: 24 },
    { name: 'KenneyFutureNarrow', fontFamily: 'Kenney Future Narrow', fontSize: 24 },
    { name: 'KenneyBold', fontFamily: 'Kenney Bold', fontSize: 24 },
    { name: 'KenvectorFuture', fontFamily: 'Kenvector Future', fontSize: 24 },
    { name: 'KenvectorFutureThin', fontFamily: 'Kenvector Future Thin', fontSize: 24 },
    { name: 'PixelOperator8', fontFamily: 'PixelOperator8', fontSize: 16 },
    { name: 'PixelOperator8Bold', fontFamily: 'PixelOperator8-Bold', fontSize: 16 },
    { name: 'PixelOperator', fontFamily: 'PixelOperator', fontSize: 16 },
    { name: 'PixelOperatorBold', fontFamily: 'PixelOperator-Bold', fontSize: 16 },
    { name: 'Minecraft', fontFamily: 'Minecraft', fontSize: 16 },
    { name: 'DogicaPixel', fontFamily: 'Dogica Pixel', fontSize: 16 },
    { name: 'DogicaPixelBold', fontFamily: 'Dogica Pixel Bold', fontSize: 16 },
    { name: 'RetroGaming', fontFamily: 'Retro Gaming', fontSize: 16 },
    { name: 'VHSGothic', fontFamily: 'VHS Gothic', fontSize: 16 },
    { name: 'RainyHearts', fontFamily: 'RainyHearts', fontSize: 16 }
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

  // Create four columns for comparison
  const columnWidths = [360, 360, 360, 480];
  const columnX = [20, 400, 780, 1160];
  const startY = 20;

  // ===== COLUMN 1: Text =====
  createTextColumn(scene, columnX[0], startY, columnWidths[0]);

  // ===== COLUMN 2: BitmapText =====
  createBitmapTextColumn(scene, engine, columnX[1], startY, columnWidths[1]);

  // ===== COLUMN 3: MSDF Text =====
  createMSDFColumn(scene, engine, columnX[2], startY, columnWidths[2]);

  // ===== COLUMN 4: Font Samples =====
  createFontSamplesColumn(scene, columnX[3], startY, columnWidths[3]);

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

// ===== COLUMN 3: MSDF Text =====
function createMSDFColumn(scene: PIXI.Container, engine: any, x: number, y: number, width: number) {
  // Header
  const header = new PIXI.Graphics();
  header.rect(0, 0, width, 50);
  header.fill({ color: 0xe67e22 });
  header.position.set(x, y);
  scene.addChild(header);

  const headerText = new Text({
    text: 'MSDF Text',
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
  panel.fill({ color: 0xd35400 });
  panel.alpha = 0.3;
  panel.position.set(x, y + 55);
  scene.addChild(panel);

  let currentY = y + 75;

  // Example 1: Basic MSDF Text
  const basic = asMSDFText({
    text: 'MSDF Text',
    style: { fontFamily: 'PixelOperator8', fontSize: 26 }
  }, { x: x + 20, y: currentY });
  scene.addChild(basic);
  currentY += 40;

  // Example 2: Tinted MSDF
  const tinted = asMSDFText({
    text: 'Color Tinted',
    style: { fontFamily: 'PixelOperator8', fontSize: 26 }
  }, { x: x + 20, y: currentY });
  tinted.tint = 0xff6b35;
  scene.addChild(tinted);
  currentY += 50;

  // Example 3: Multiple sizes (same as BitmapText column)
  [8, 12, 16, 20, 24, 28, 32].forEach(size => {
    const sizeText = asMSDFText({
      text: `${size}px MSDF Text`,
      style: { fontFamily: 'PixelOperator8', fontSize: size }
    }, { x: x + 20, y: currentY });
    scene.addChild(sizeText);
    currentY += size + 10;
  });
  currentY += 10;

  // Example 4: Live counter (MSDF)
  const counterLabel = new Text({
    text: 'Live Counter (MSDF):',
    style: { fontSize: 14, fill: 0xcccccc }
  });
  counterLabel.position.set(x + 20, currentY);
  scene.addChild(counterLabel);
  currentY += 20;

  const counter = asMSDFText({
    text: '00000000',
    style: { fontFamily: 'PixelOperator8', fontSize: 28 }
  }, { x: x + 20, y: currentY });
  scene.addChild(counter);

  let count = 0;
  engine.ticker.add(() => {
    count += 123;
    counter.text = count.toString().padStart(8, '0');
  });
  currentY += 60;

  // Pros/Cons
  const prosLabel = new Text({
    text: '✅ Crisp at any scale\n✅ Small texture size\n✅ GPU efficient\n✅ Unity-quality text\n\n❌ Requires font prep\n❌ Smooths pixel edges',
    style: {
      fontSize: 14,
      fill: 0xcccccc,
      lineHeight: 18
    },
    resolution: 2
  });
  prosLabel.position.set(x + 20, currentY);
  scene.addChild(prosLabel);
}

// ===== COLUMN 4: Font Samples =====
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

  // Tab buttons for Regular vs Pixel Perfect
  let activeTab: 'regular' | 'pixel-perfect' = 'regular';
  const tabContainer = new PIXI.Container();
  tabContainer.position.set(x + width / 2 - 140, y + 60);
  scene.addChild(tabContainer);

  const createTabButton = (label: string, offsetX: number, tabType: 'regular' | 'pixel-perfect', buttonWidth: number) => {
    const bg = new PIXI.Graphics();
    const isActive = activeTab === tabType;

    bg.rect(0, 0, buttonWidth, 28);
    bg.fill({ color: isActive ? 0x9b59b6 : 0x5a3a6b });
    bg.stroke({ color: 0xffffff, width: 2 });

    const text = new PIXI.BitmapText({
      text: label,
      style: {
        fontFamily: 'KenneyFuture',
        fontSize: 14,
        fill: 0xffffff
      }
    });
    text.anchor.set(0.5);
    text.position.set(buttonWidth / 2, 14);

    bg.addChild(text);
    bg.position.set(offsetX, 0);
    bg.eventMode = 'static';
    bg.cursor = 'pointer';

    bg.on('pointerdown', () => {
      activeTab = tabType;
      updateTabs();
    });

    return bg;
  };

  let regularTabButton: PIXI.Graphics;
  let pixelPerfectTabButton: PIXI.Graphics;

  const updateTabs = () => {
    tabContainer.removeChildren();
    regularTabButton = createTabButton('Regular', 0, 'regular', 130);
    pixelPerfectTabButton = createTabButton('Pixel Perfect', 145, 'pixel-perfect', 180);
    tabContainer.addChild(regularTabButton);
    tabContainer.addChild(pixelPerfectTabButton);

    // Toggle scroll container visibility
    regularScrollView.container.visible = activeTab === 'regular';
    pixelPerfectScrollView.container.visible = activeTab === 'pixel-perfect';
  };

  // Background panel
  const panel = new PIXI.Graphics();
  panel.rect(0, 0, width, 735);
  panel.fill({ color: 0x8e44ad });
  panel.alpha = 0.3;
  panel.position.set(x, y + 95);
  scene.addChild(panel);

  // Create scroll container for REGULAR font samples
  const regularScrollView = new UIScrollContainer({
    width: width,
    height: 735,
    backgroundColor: 0x8e44ad,
    scrollbarWidth: 14,
    scrollbarTrackColor: 0x2d2d44,
    scrollbarThumbColor: 0x4a4a6a,
    scrollbarThumbHoverColor: 0x6a6a8a,
    padding: EdgeInsets.all(0)
  });
  regularScrollView.container.x = x;
  regularScrollView.container.y = y + 95;
  scene.addChild(regularScrollView.container);

  // Create scroll container for PIXEL PERFECT font samples
  const pixelPerfectScrollView = new UIScrollContainer({
    width: width,
    height: 735,
    backgroundColor: 0x8e44ad,
    scrollbarWidth: 14,
    scrollbarTrackColor: 0x2d2d44,
    scrollbarThumbColor: 0x4a4a6a,
    scrollbarThumbHoverColor: 0x6a6a8a,
    padding: EdgeInsets.all(0)
  });
  pixelPerfectScrollView.container.x = x;
  pixelPerfectScrollView.container.y = y + 95;
  scene.addChild(pixelPerfectScrollView.container);

  // Create content containers for both regular and pixel-perfect
  const regularContentContainer = new PIXI.Container();
  const pixelPerfectContentContainer = new PIXI.Container();

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

  const regularFontSamplesContent = new FontSamplesContent(regularContentContainer);
  regularScrollView.addChild(regularFontSamplesContent);

  const pixelPerfectFontSamplesContent = new FontSamplesContent(pixelPerfectContentContainer);
  pixelPerfectScrollView.addChild(pixelPerfectFontSamplesContent);

  // Font showcase section - all fonts including new ones
  // bitmapFontFamily is for BitmapText, cssFontFamily is for Text
  const fontSamples = [
    { name: 'Kenney Blocks', bitmapFontFamily: 'KenneyBlocks', cssFontFamily: 'Kenney Blocks', size: 20, lineHeight: 25 },
    { name: 'Kenvector Future', bitmapFontFamily: 'KenvectorFuture', cssFontFamily: 'Kenvector Future', size: 20, lineHeight: 25 },
    { name: 'Kenvector Future Thin', bitmapFontFamily: 'KenvectorFutureThin', cssFontFamily: 'Kenvector Future Thin', size: 20, lineHeight: 25 },
    { name: 'PixelOperator8 Regular', bitmapFontFamily: 'PixelOperator8', cssFontFamily: 'PixelOperator8', size: 20, lineHeight: 25 },
    { name: 'PixelOperator8 Bold', bitmapFontFamily: 'PixelOperator8Bold', cssFontFamily: 'PixelOperator8-Bold', size: 20, lineHeight: 25 },
    { name: 'PixelOperator Regular', bitmapFontFamily: 'PixelOperator', cssFontFamily: 'PixelOperator', size: 20, lineHeight: 25 },
    { name: 'PixelOperator Bold', bitmapFontFamily: 'PixelOperatorBold', cssFontFamily: 'PixelOperator-Bold', size: 20, lineHeight: 25 },
    { name: 'Minecraft', bitmapFontFamily: 'Minecraft', cssFontFamily: 'Minecraft', size: 20, lineHeight: 25 },
    { name: 'Dogica Pixel Regular', bitmapFontFamily: 'DogicaPixel', cssFontFamily: 'Dogica Pixel', size: 20, lineHeight: 25 },
    { name: 'Dogica Pixel Bold', bitmapFontFamily: 'DogicaPixelBold', cssFontFamily: 'Dogica Pixel Bold', size: 20, lineHeight: 25 },
    { name: 'Retro Gaming', bitmapFontFamily: 'RetroGaming', cssFontFamily: 'Retro Gaming', size: 20, lineHeight: 25 },
    { name: 'VHS Gothic', bitmapFontFamily: 'VHSGothic', cssFontFamily: 'VHS Gothic', size: 20, lineHeight: 25 },
    { name: 'RainyHearts', bitmapFontFamily: 'RainyHearts', cssFontFamily: 'RainyHearts', size: 20, lineHeight: 25 }
  ];

  const sampleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n0123456789 !@#$%^&*()_+-=';

  // Populate REGULAR content (using Text for anti-aliased rendering)
  let regularY = 20;
  fontSamples.forEach(font => {
    // Font name label
    const fontNameLabel = new Text({
      text: font.name + ':',
      style: {
        fontFamily: 'Kenney Future',
        fontSize: 18,
        fill: 0xffffff
      },
      resolution: 2
    });
    fontNameLabel.position.set(20, regularY);
    regularContentContainer.addChild(fontNameLabel);
    regularY += 25;

    // Character sample using Text (anti-aliased)
    const sample = new Text({
      text: sampleChars,
      style: {
        fontFamily: font.cssFontFamily,
        fontSize: font.size,
        fill: 0xffffff
      },
      resolution: 2
    });
    sample.position.set(20, regularY);
    regularContentContainer.addChild(sample);
    regularY += 100;
  });

  // Populate PIXEL PERFECT content
  let pixelPerfectY = 20;
  fontSamples.forEach(font => {
    // Font name label
    const fontNameLabel = new BitmapText({
      text: font.name + ':',
      style: {
        fontFamily: 'KenneyFuture',
        fontSize: 18
      }
    });
    fontNameLabel.roundPixels = true; // Pixel perfect!
    fontNameLabel.position.set(20, pixelPerfectY);
    pixelPerfectContentContainer.addChild(fontNameLabel);
    pixelPerfectY += 25;

    // Character sample with pixel perfect rendering
    const sample = new BitmapText({
      text: sampleChars,
      style: {
        fontFamily: font.bitmapFontFamily,
        fontSize: font.size,
        lineHeight: font.lineHeight
      }
    });
    sample.roundPixels = true; // Pixel perfect!
    sample.position.set(20, pixelPerfectY);
    pixelPerfectContentContainer.addChild(sample);
    pixelPerfectY += 100;
  });

  // Update scroll container layouts
  regularFontSamplesContent.markLayoutDirty();
  regularScrollView.layout(width, 735);

  pixelPerfectFontSamplesContent.markLayoutDirty();
  pixelPerfectScrollView.layout(width, 735);

  // Initialize tabs
  updateTabs();
}

