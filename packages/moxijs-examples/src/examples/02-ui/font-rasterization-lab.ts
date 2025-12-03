/**
 * Example: Font Rasterization Lab
 *
 * Exploring solutions to remove Canvas 2D anti-aliasing from pixel fonts.
 * The key insight: Canvas 2D ALWAYS anti-aliases text. We need post-processing.
 */
import { setupMoxi, GRID, px, asBitmapText } from '@moxijs/core';
import * as PIXI from 'pixi.js';
import { Assets, BitmapFont, BitmapText, Text, Container, Graphics, Texture, Sprite, RenderTexture, Filter, GlProgram } from 'pixi.js';
import { ASSETS } from '../../assets-config';

// ============================================
// THRESHOLD FILTER - Removes anti-aliasing!
// ============================================
// This filter converts semi-transparent pixels to fully opaque or fully transparent
// based on a threshold. This effectively removes the "blur" from anti-aliased text.

const thresholdVertex = `
  in vec2 aPosition;
  out vec2 vTextureCoord;
  uniform vec4 uInputSize;
  uniform vec4 uOutputFrame;
  uniform vec4 uOutputTexture;

  vec4 filterVertexPosition(void) {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    return vec4(position, 0.0, 1.0);
  }

  vec2 filterTextureCoord(void) {
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
  }

  void main(void) {
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
  }
`;

const thresholdFragment = `
  in vec2 vTextureCoord;
  out vec4 finalColor;
  uniform sampler2D uTexture;
  uniform float uThreshold;

  void main(void) {
    vec4 color = texture(uTexture, vTextureCoord);
    // If alpha is above threshold, make it fully opaque; otherwise fully transparent
    float newAlpha = color.a >= uThreshold ? 1.0 : 0.0;
    finalColor = vec4(color.rgb, newAlpha);
  }
`;

class ThresholdFilter extends Filter {
  constructor(threshold = 0.5) {
    const glProgram = GlProgram.from({
      vertex: thresholdVertex,
      fragment: thresholdFragment,
      name: 'threshold-filter',
    });

    super({
      glProgram,
      resources: {
        thresholdUniforms: {
          uThreshold: { value: threshold, type: 'f32' },
        },
      },
    });
  }

  get threshold(): number {
    return this.resources.thresholdUniforms.uniforms.uThreshold;
  }

  set threshold(value: number) {
    this.resources.thresholdUniforms.uniforms.uThreshold = value;
  }
}

export async function initFontRasterizationLab() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('Canvas container not found');

  const { scene, engine, renderer } = await setupMoxi({
    hostElement: root,
    showLoadingScene: true,
    pixelPerfect: true,
    renderOptions: {
      width: 1280,
      height: 720,
      backgroundColor: 0x0a0a15,
      antialias: false,
      roundPixels: true,
    }
  });

  const canvas = renderer.canvas as HTMLCanvasElement;
  canvas.style.imageRendering = 'pixelated';

  // Load font
  await Assets.load(ASSETS.PIXEL_OPERATOR8_FONT);

  // ========================================
  // Install fonts at different base sizes
  // ========================================

  // Standard PIKCELL approach (64px base)
  BitmapFont.install({
    name: 'PixelOp-64',
    style: { fontFamily: 'PixelOperator8', fontSize: 64, fill: 0xffffff },
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?\'"-:;',
    resolution: 1,
    padding: 4,
    textureStyle: { scaleMode: 'nearest' }
  });

  // Native 8px (what the font was designed for)
  BitmapFont.install({
    name: 'PixelOp-8',
    style: { fontFamily: 'PixelOperator8', fontSize: 8, fill: 0xffffff },
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?\'"-:;',
    resolution: 1,
    padding: 1,
    textureStyle: { scaleMode: 'nearest' }
  });

  // ========================================
  // Title
  // ========================================
  
  const title = new Text({
    text: 'Threshold Filter: Removing Canvas 2D Anti-Aliasing',
    style: { fontSize: 20, fill: 0x00ff88, fontWeight: 'bold' }
  });
  title.position.set(40, 15);
  scene.addChild(title);

  const subtitle = new Text({
    text: 'The threshold filter converts semi-transparent pixels to fully opaque/transparent',
    style: { fontSize: 11, fill: 0xffff00 }
  });
  subtitle.position.set(40, 40);
  scene.addChild(subtitle);

  // ========================================
  // Column headers
  // ========================================

  const col1 = 40;
  const col2 = 350;
  const col3 = 660;
  let y = 70;

  const headers = [
    { x: col1, text: 'Original (with AA)', color: 0xff6666 },
    { x: col2, text: 'Threshold 0.5', color: 0x66ff66 },
    { x: col3, text: 'Threshold 0.3', color: 0x6666ff },
  ];

  for (const h of headers) {
    const header = new Text({
      text: h.text,
      style: { fontSize: 14, fill: h.color }
    });
    header.position.set(h.x, y);
    scene.addChild(header);
  }

  y += 30;

  // ========================================
  // Test text at different scales
  // ========================================

  const testText = 'HELLO WORLD';
  const thresholdFilter05 = new ThresholdFilter(0.5);
  const thresholdFilter03 = new ThresholdFilter(0.3);

  // Test 1: 64px base scaled to various display sizes
  const scales = [
    { label: 'PIKCELL default (64px × 0.25 = 16px)', scale: 0.25 },
    { label: '64px × 0.125 = 8px', scale: 0.125 },
    { label: '64px × 0.5 = 32px', scale: 0.5 },
  ];

  for (const { label, scale } of scales) {
    // Label
    const rowLabel = new Text({
      text: label,
      style: { fontSize: 10, fill: 0x888888 }
    });
    rowLabel.position.set(col1, y);
    scene.addChild(rowLabel);
    y += 16;

    // Column 1: Original (no filter)
    const text1 = new BitmapText({
      text: testText,
      style: { fontFamily: 'PixelOp-64', fontSize: 64 }
    });
    text1.scale.set(scale);
    text1.roundPixels = true;
    text1.position.set(col1, y);
    text1.tint = 0xff6666;
    scene.addChild(text1);

    // Column 2: With threshold 0.5
    const text2 = new BitmapText({
      text: testText,
      style: { fontFamily: 'PixelOp-64', fontSize: 64 }
    });
    text2.scale.set(scale);
    text2.roundPixels = true;
    text2.position.set(col2, y);
    text2.tint = 0x66ff66;
    text2.filters = [thresholdFilter05];
    scene.addChild(text2);

    // Column 3: With threshold 0.3
    const text3 = new BitmapText({
      text: testText,
      style: { fontFamily: 'PixelOp-64', fontSize: 64 }
    });
    text3.scale.set(scale);
    text3.roundPixels = true;
    text3.position.set(col3, y);
    text3.tint = 0x6666ff;
    text3.filters = [thresholdFilter03];
    scene.addChild(text3);

    y += scale * 64 + 15;
  }

  // ========================================
  // Native 8px font comparison
  // ========================================

  y += 20;

  const nativeLabel = new Text({
    text: 'Native 8px font (scaled up):',
    style: { fontSize: 14, fill: 0xffffff }
  });
  nativeLabel.position.set(col1, y);
  scene.addChild(nativeLabel);
  y += 25;

  const nativeScales = [
    { label: '8px × 2 = 16px', scale: 2 },
    { label: '8px × 4 = 32px', scale: 4 },
  ];

  for (const { label, scale } of nativeScales) {
    const rowLabel = new Text({
      text: label,
      style: { fontSize: 10, fill: 0x888888 }
    });
    rowLabel.position.set(col1, y);
    scene.addChild(rowLabel);
    y += 14;

    // Original
    const text1 = new BitmapText({
      text: testText,
      style: { fontFamily: 'PixelOp-8', fontSize: 8 }
    });
    text1.scale.set(scale);
    text1.roundPixels = true;
    text1.position.set(col1, y);
    text1.tint = 0xff6666;
    scene.addChild(text1);

    // With threshold 0.5
    const text2 = new BitmapText({
      text: testText,
      style: { fontFamily: 'PixelOp-8', fontSize: 8 }
    });
    text2.scale.set(scale);
    text2.roundPixels = true;
    text2.position.set(col2, y);
    text2.tint = 0x66ff66;
    text2.filters = [thresholdFilter05];
    scene.addChild(text2);

    // With threshold 0.3
    const text3 = new BitmapText({
      text: testText,
      style: { fontFamily: 'PixelOp-8', fontSize: 8 }
    });
    text3.scale.set(scale);
    text3.roundPixels = true;
    text3.position.set(col3, y);
    text3.tint = 0x6666ff;
    text3.filters = [thresholdFilter03];
    scene.addChild(text3);

    y += scale * 8 + 12;
  }

  // ========================================
  // Zoomed single letter comparison
  // ========================================

  y += 20;

  const zoomLabel = new Text({
    text: 'Zoomed "A" (64px base, scale 1.0):',
    style: { fontSize: 14, fill: 0xffffff }
  });
  zoomLabel.position.set(col1, y);
  scene.addChild(zoomLabel);
  y += 25;

  // Big A - Original
  const bigA1 = new BitmapText({
    text: 'A',
    style: { fontFamily: 'PixelOp-64', fontSize: 64 }
  });
  bigA1.position.set(col1, y);
  bigA1.tint = 0xff6666;
  scene.addChild(bigA1);

  const label1 = new Text({ text: 'Original\n(blurry edges)', style: { fontSize: 9, fill: 0xff6666, lineHeight: 12 } });
  label1.position.set(col1, y + 70);
  scene.addChild(label1);

  // Big A - Threshold 0.5
  const bigA2 = new BitmapText({
    text: 'A',
    style: { fontFamily: 'PixelOp-64', fontSize: 64 }
  });
  bigA2.position.set(col2, y);
  bigA2.tint = 0x66ff66;
  bigA2.filters = [thresholdFilter05];
  scene.addChild(bigA2);

  const label2 = new Text({ text: 'Threshold 0.5\n(crisp!)', style: { fontSize: 9, fill: 0x66ff66, lineHeight: 12 } });
  label2.position.set(col2, y + 70);
  scene.addChild(label2);

  // Big A - Threshold 0.3
  const bigA3 = new BitmapText({
    text: 'A',
    style: { fontFamily: 'PixelOp-64', fontSize: 64 }
  });
  bigA3.position.set(col3, y);
  bigA3.tint = 0x6666ff;
  bigA3.filters = [thresholdFilter03];
  scene.addChild(bigA3);

  const label3 = new Text({ text: 'Threshold 0.3\n(thicker strokes)', style: { fontSize: 9, fill: 0x6666ff, lineHeight: 12 } });
  label3.position.set(col3, y + 70);
  scene.addChild(label3);

  // ========================================
  // Observations
  // ========================================

  const obs = new Text({
    text: [
      'Key findings:',
      '• Canvas 2D ALWAYS anti-aliases text - there\'s no way to disable it',
      '• The threshold filter removes semi-transparent pixels, making text crisp',
      '• Threshold 0.5 = balanced, 0.3 = thicker strokes, 0.7 = thinner strokes',
      '• This could be applied to PIKCELL\'s asBitmapText() for pixel-perfect fonts!',
    ].join('\n'),
    style: { fontSize: 10, fill: 0x888888, lineHeight: 15 }
  });
  obs.position.set(40, 640);
  scene.addChild(obs);

  // Initialize and start
  scene.init();
  engine.start();

  console.log('✅ Font Rasterization Lab loaded');

  return () => {
    engine.stop();
    scene.destroy({ children: true });
  };
}
