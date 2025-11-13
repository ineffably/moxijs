/**
 * Example 10: Text Rendering
 * Showcases different ways to render text in PixiJS
 * Features: mechanical scrolling counter, BitmapText, styled text, and effects
 */
import { setupMoxi } from 'moxi';
import * as PIXI from 'pixi.js';
import { Assets } from 'pixi.js';
import { ASSETS } from '../assets-config';

export async function initTextRendering() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  const { scene, engine, renderer } = await setupMoxi({
    hostElement: root,
    renderOptions: {
      width: 1280,
      height: 720,
      backgroundColor: 0x1a1a2e
    }
  });

  // Load fonts
  await Assets.load([ASSETS.KENNEY_FUTURE_FONT, ASSETS.KENNEY_BLOCKS_FONT]);

  // Generate bitmap font from TTF using BitmapFont.install
  PIXI.BitmapFont.install({
    name: 'KenneyBlocks',
    style: {
      fontFamily: 'Kenney Blocks',
      fontSize: 48,
      fill: 0xffffff
    }
  });

  // Create title
  const title = new PIXI.Text({
    text: 'Text Rendering Showcase',
    style: {
      fontSize: 48,
      fill: 0xffffff,
      fontWeight: 'bold'
    },
    resolution: 2
  });
  title.anchor.set(0.5, 0);
  title.position.set(640, 20);
  scene.addChild(title);

  // ===== BITMAP TEXT COUNTER =====
  const bitmapLabel = new PIXI.Text({
    text: 'BitmapText Counter (High Performance):',
    style: {
      fontSize: 24,
      fill: 0xaaaaaa
    },
    resolution: 2
  });
  bitmapLabel.position.set(100, 100);
  scene.addChild(bitmapLabel);

  // BitmapText counter - generated from TTF using BitmapFont.install
  const bitmapCounter = new PIXI.BitmapText({
    text: '0',
    style: {
      fontFamily: 'KenneyBlocks',
      fontSize: 64
    }
  });
  bitmapCounter.tint = 0x00ff00; // Green
  bitmapCounter.position.set(100, 140);
  scene.addChild(bitmapCounter);

  // Animate counter - keeps counting indefinitely
  let currentValue = 0;
  const incrementSpeed = 1234; // Increase by this much per frame

  engine.ticker.add(() => {
    currentValue += incrementSpeed;
    bitmapCounter.text = currentValue.toString();
  });

  // Multi-color counter - each digit has different rainbow color (ROYGBP)
  const coloredCounterContainer = new PIXI.Container();
  coloredCounterContainer.position.set(100, 230);
  scene.addChild(coloredCounterContainer);

  let coloredValue = 0;
  const coloredDigits: PIXI.BitmapText[] = [];

  // Function to get rainbow color based on digit value (0-9)
  // Maps digits to rainbow spectrum: Red → Orange → Yellow → Green → Blue → Purple
  const getRainbowColor = (digit: number): number => {
    const rainbowColors = [
      0xff0000,  // 0 = Red
      0xff9900,  // 1 = Orange (brighter)
      0xffff00,  // 2 = Yellow
      0xaaff00,  // 3 = Lime (more yellow, distinct from green)
      0x00ff00,  // 4 = Green
      0x00ffaa,  // 5 = Spring Green/Turquoise (more cyan, distinct from green)
      0x00ddff,  // 6 = Cyan (bright)
      0x0088ff,  // 7 = Sky Blue
      0xaa00ff,  // 8 = Purple/Violet
      0xff00ff   // 9 = Magenta
    ];
    return rainbowColors[digit] || 0xffffff;
  };

  // Update colored counter digits
  const updateColoredCounter = (value: number) => {
    const digits = value.toString().split('');

    // Remove excess digits if number got smaller
    while (coloredDigits.length > digits.length) {
      const digit = coloredDigits.pop();
      if (digit) coloredCounterContainer.removeChild(digit);
    }

    // Update or create digits
    for (let i = 0; i < digits.length; i++) {
      const digitValue = parseInt(digits[i]);

      if (!coloredDigits[i]) {
        // Create new digit
        const digitText = new PIXI.BitmapText({
          text: digits[i],
          style: {
            fontFamily: 'KenneyBlocks',
            fontSize: 64
          }
        });
        coloredDigits.push(digitText);
        coloredCounterContainer.addChild(digitText);
      } else {
        // Update existing digit
        coloredDigits[i].text = digits[i];
      }

      // Set tint based on digit value
      coloredDigits[i].tint = getRainbowColor(digitValue);

      // Position digit
      coloredDigits[i].x = i * 45; // Space between digits
    }
  };

  engine.ticker.add(() => {
    coloredValue += incrementSpeed;
    updateColoredCounter(coloredValue);
  });

  // Scrolling odometer counter - digits roll up like old mechanical displays
  const odometerContainer = new PIXI.Container();
  odometerContainer.position.set(100, 320);
  scene.addChild(odometerContainer);

  let odometerValue = 0;
  const digitHeight = 64;
  const odometerDigitSlots: { container: PIXI.Container; scrollContainer: PIXI.Container; currentY: number; targetY: number; lastDigit: number }[] = [];

  // Create scrolling digit slot
  const createDigitSlot = (index: number) => {
    const slotContainer = new PIXI.Container();
    slotContainer.x = index * 45;

    // Create mask for scrolling window
    const mask = new PIXI.Graphics();
    mask.rect(0, 0, 45, digitHeight);
    mask.fill(0xffffff);
    slotContainer.addChild(mask);

    // Create scrolling container with digits rendered twice (0-9, 0-9) for seamless loop
    const scrollContainer = new PIXI.Container();
    scrollContainer.mask = mask;

    // Render digits in REVERSE order (0,1,2...9) twice for seamless wrapping
    // Position them ABOVE the mask, scroll DOWN (positive y) to reveal them
    // This makes numbers appear to move UP when counting UP
    for (let i = 0; i < 20; i++) {
      const displayDigit = i % 10; // 0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9
      const digitText = new PIXI.BitmapText({
        text: displayDigit.toString(),
        style: {
          fontFamily: 'KenneyBlocks',
          fontSize: 64
        }
      });
      digitText.tint = 0xff6600; // Orange
      digitText.anchor.set(0.5, 0.5); // Center both horizontally and vertically
      digitText.x = 22.5; // Center in 45px wide slot
      digitText.y = -i * digitHeight + 29; // Adjusted up 3px from center (32 - 3 = 29)
      scrollContainer.addChild(digitText);
    }

    slotContainer.addChild(scrollContainer);
    odometerContainer.addChild(slotContainer);

    return { container: slotContainer, scrollContainer, currentY: 0, targetY: 0, lastDigit: 0 };
  };

  let previousValue = 0;

  // Update odometer with scrolling animation
  const updateOdometer = (value: number) => {
    const digits = value.toString().split('');

    // Add more digit slots if needed
    while (odometerDigitSlots.length < digits.length) {
      odometerDigitSlots.push(createDigitSlot(odometerDigitSlots.length));
    }

    // Calculate how much the value changed
    const delta = value - previousValue;
    previousValue = value;

    // Update each digit's scroll position
    for (let i = 0; i < digits.length; i++) {
      const digitValue = parseInt(digits[i]);
      const slot = odometerDigitSlots[i];

      // Only update target when digit actually changes (prevents bouncing)
      if (digitValue !== slot.lastDigit) {
        const idealY = digitValue * digitHeight; // POSITIVE for reverse scroll

        // Check if we need to wrap (going forward would mean wrap backward)
        if (idealY < slot.targetY) {
          // Wrapped (9→0): scroll to position 10, then snap back
          slot.targetY = (digitValue + 10) * digitHeight;
        } else {
          // Normal case: scroll forward to new digit
          slot.targetY = idealY;
        }

        slot.lastDigit = digitValue;
      }

      // Smooth scrolling animation with lerp
      const diff = slot.targetY - slot.currentY;
      if (Math.abs(diff) > 0.5) {
        slot.currentY += diff * 0.15;
      } else {
        slot.currentY = slot.targetY;
      }

      // Snap back from position 10 to 0 after wrapping
      if (slot.currentY >= (10 * digitHeight - 1)) {
        slot.currentY -= 10 * digitHeight;
        slot.targetY -= 10 * digitHeight;
      }

      slot.scrollContainer.y = slot.currentY;
    }
  };

  engine.ticker.add(() => {
    odometerValue += incrementSpeed;
    updateOdometer(odometerValue);
  });

  // Frequently updating counter (shows BitmapText performance)
  let frameCount = 0;
  const fpsCounter = new PIXI.BitmapText({
    text: 'FPS: 60',
    style: {
      fontFamily: 'KenneyBlocks',
      fontSize: 24
    }
  });
  fpsCounter.tint = 0x00ff00;
  fpsCounter.anchor.set(1, 0); // Anchor to top-right
  fpsCounter.position.set(1260, 20); // Top right corner (20px from edges)
  scene.addChild(fpsCounter);

  // Update FPS counter every frame (demonstrates BitmapText performance)
  let lastTime = performance.now();
  let fps = 60;
  engine.ticker.add(() => {
    frameCount++;
    const currentTime = performance.now();
    const delta = currentTime - lastTime;

    if (delta >= 1000) {
      fps = Math.round((frameCount * 1000) / delta);
      fpsCounter.text = `FPS: ${fps}`;
      frameCount = 0;
      lastTime = currentTime;
    }
  });

  // ===== STYLED TEXT EXAMPLES =====
  const stylesLabel = new PIXI.Text({
    text: 'Text Styles (Rich Formatting):',
    style: {
      fontSize: 24,
      fill: 0xaaaaaa
    },
    resolution: 2
  });
  stylesLabel.position.set(100, 420);
  scene.addChild(stylesLabel);

  // Stroke text
  const strokeText = new PIXI.Text({
    text: 'Bold Stroke',
    style: {
      fontSize: 32,
      fill: 0xffffff,
      stroke: { color: 0xff6b35, width: 4 },
      padding: 4
    },
    resolution: 2
  });
  strokeText.position.set(100, 460);
  scene.addChild(strokeText);

  // Gradient text (using array of colors)
  const gradientFill = new PIXI.FillGradient(0, 0, 0, 32 * 1.7);
  gradientFill.addColorStop(0, 0xff00ff);
  gradientFill.addColorStop(1, 0x00ffff);

  const gradientText = new PIXI.Text({
    text: 'Gradient Fill',
    style: {
      fontSize: 32,
      fill: gradientFill
    },
    resolution: 2
  });
  gradientText.position.set(100, 510);
  scene.addChild(gradientText);

  // Shadow text
  const shadowText = new PIXI.Text({
    text: 'Drop Shadow',
    style: {
      fontSize: 32,
      fill: 0xffffff,
      dropShadow: {
        alpha: 0.8,
        angle: Math.PI / 4,
        blur: 4,
        color: 0x000000,
        distance: 5
      },
      padding: 10
    },
    resolution: 2
  });
  shadowText.position.set(100, 560);
  scene.addChild(shadowText);

  // Multi-line wrapped text
  const wrappedText = new PIXI.Text({
    text: 'This is an example of word-wrapped text. It automatically breaks into multiple lines when it reaches the specified width.',
    style: {
      fontSize: 18,
      fill: 0xdddddd,
      wordWrap: true,
      wordWrapWidth: 400,
      lineHeight: 24
    },
    resolution: 2
  });
  wrappedText.position.set(100, 620);
  scene.addChild(wrappedText);

  // Outline text (stroke only, no fill)
  const outlineText = new PIXI.Text({
    text: 'OUTLINE',
    style: {
      fontSize: 48,
      fill: 'transparent',
      stroke: { color: 0x00ff00, width: 3 },
      padding: 4
    },
    resolution: 2
  });
  outlineText.position.set(600, 460);
  scene.addChild(outlineText);

  // Animated tint example
  const animatedText = new PIXI.Text({
    text: 'ANIMATED',
    style: {
      fontSize: 36,
      fill: 0xffffff,
      fontWeight: 'bold'
    },
    resolution: 2
  });
  animatedText.position.set(600, 540);
  scene.addChild(animatedText);

  // Animate the tint color
  let hue = 0;
  engine.ticker.add(() => {
    hue = (hue + 1) % 360;
    animatedText.tint = hslToHex(hue, 100, 50);
  });

  // Initialize and start
  scene.init();
  engine.start();

  console.log('✅ Text Rendering example loaded!');
  console.log('   🔢 BitmapText counter (high performance)');
  console.log('   ⚡ Live FPS counter');
  console.log('   ✨ Rich text styles: gradients, shadows, strokes');
  console.log('   🎨 Animated color-changing text');
}

/**
 * Convert HSL to Hex color
 */
function hslToHex(h: number, s: number, l: number): number {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color);
  };
  return (f(0) << 16) | (f(8) << 8) | f(4);
}

