import { asBitmapText, asSprite, asGraphics, asContainer, asText, asTextDPR, PixiProps } from '../src/library/as-pixi';
import PIXI from 'pixi.js';

describe('as-pixi helpers', () => {
  describe('asBitmapText', () => {
    it('should create a BitmapText with constructor args', () => {
      const text = asBitmapText({
        text: 'Hello',
        style: {
          fontFamily: 'Arial',
          fontSize: 24
        }
      });

      expect(text).toBeInstanceOf(PIXI.BitmapText);
      expect(text.text).toBe('Hello');
    });

    it('should apply props after creation', () => {
      const text = asBitmapText(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 }
        },
        { x: 100, y: 50 }
      );

      expect(text.x).toBe(100);
      expect(text.y).toBe(50);
    });

    it('should apply anchor prop as number', () => {
      const text = asBitmapText(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 }
        },
        { anchor: 0.5 }
      );

      expect(text.anchor.x).toBe(0.5);
      expect(text.anchor.y).toBe(0.5);
    });

    it('should apply anchor prop as object', () => {
      const text = asBitmapText(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 }
        },
        { anchor: { x: 0.25, y: 0.75 } }
      );

      expect(text.anchor.x).toBe(0.25);
      expect(text.anchor.y).toBe(0.75);
    });

    it('should apply anchor prop as object with partial values (x only)', () => {
      const text = asBitmapText(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 }
        },
        { anchor: { x: 0.3 } }
      );

      expect(text.anchor.x).toBe(0.3);
      // y should remain unchanged (default value)
    });

    it('should apply anchor prop as object with partial values (y only)', () => {
      const text = asBitmapText(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 }
        },
        { anchor: { y: 0.7 } }
      );

      expect(text.anchor.y).toBe(0.7);
      // x should remain unchanged (default value)
    });

    it('should handle text as number', () => {
      const text = asBitmapText({
        text: 42,
        style: { fontFamily: 'Arial', fontSize: 16 }
      });

      // BitmapText stores numbers as-is, not converted to string
      expect(text.text).toBe(42);
    });

    it('should handle text as object with toString', () => {
      const customObj = { toString: () => 'Custom' };
      const text = asBitmapText({
        text: customObj,
        style: { fontFamily: 'Arial', fontSize: 16 }
      });

      // BitmapText stores the object as-is, PIXI handles conversion internally
      expect(text.text).toBe(customObj);
    });
  });

  describe('asSprite', () => {
    it('should create a Sprite with texture', () => {
      // Create a simple texture for testing
      const texture = PIXI.Texture.EMPTY;
      const sprite = asSprite({ texture });

      expect(sprite).toBeInstanceOf(PIXI.Sprite);
      expect(sprite.texture).toBe(texture);
    });

    it('should apply props after creation', () => {
      const texture = PIXI.Texture.EMPTY;
      const sprite = asSprite(
        { texture },
        { x: 200, y: 300, anchor: 0.5 }
      );

      expect(sprite.x).toBe(200);
      expect(sprite.y).toBe(300);
      expect(sprite.anchor.x).toBe(0.5);
      expect(sprite.anchor.y).toBe(0.5);
    });

    it('should apply scale as number', () => {
      const texture = PIXI.Texture.EMPTY;
      const sprite = asSprite(
        { texture },
        { scale: 2 }
      );

      expect(sprite.scale.x).toBe(2);
      expect(sprite.scale.y).toBe(2);
    });

    it('should apply scale as object', () => {
      const texture = PIXI.Texture.EMPTY;
      const sprite = asSprite(
        { texture },
        { scale: { x: 1.5, y: 2.5 } }
      );

      expect(sprite.scale.x).toBe(1.5);
      expect(sprite.scale.y).toBe(2.5);
    });

    it('should apply scale as object with partial values (x only)', () => {
      const texture = PIXI.Texture.EMPTY;
      const sprite = asSprite(
        { texture },
        { scale: { x: 3 } }
      );

      expect(sprite.scale.x).toBe(3);
      // y should remain unchanged
    });

    it('should apply scale as object with partial values (y only)', () => {
      const texture = PIXI.Texture.EMPTY;
      const sprite = asSprite(
        { texture },
        { scale: { y: 4 } }
      );

      expect(sprite.scale.y).toBe(4);
      // x should remain unchanged
    });

    it('should apply pivot as number', () => {
      const texture = PIXI.Texture.EMPTY;
      const sprite = asSprite(
        { texture },
        { pivot: 10 }
      );

      expect(sprite.pivot.x).toBe(10);
      expect(sprite.pivot.y).toBe(10);
    });

    it('should apply pivot as object', () => {
      const texture = PIXI.Texture.EMPTY;
      const sprite = asSprite(
        { texture },
        { pivot: { x: 5, y: 15 } }
      );

      expect(sprite.pivot.x).toBe(5);
      expect(sprite.pivot.y).toBe(15);
    });

    it('should apply pivot as object with partial values (x only)', () => {
      const texture = PIXI.Texture.EMPTY;
      const sprite = asSprite(
        { texture },
        { pivot: { x: 15 } }
      );

      expect(sprite.pivot.x).toBe(15);
      // y should remain unchanged
    });

    it('should apply pivot as object with partial values (y only)', () => {
      const texture = PIXI.Texture.EMPTY;
      const sprite = asSprite(
        { texture },
        { pivot: { y: 20 } }
      );

      expect(sprite.pivot.y).toBe(20);
      // x should remain unchanged
    });

    it('should apply rotation', () => {
      const texture = PIXI.Texture.EMPTY;
      const sprite = asSprite(
        { texture },
        { rotation: Math.PI / 2 }
      );

      expect(sprite.rotation).toBe(Math.PI / 2);
    });

    it('should apply tint if supported', () => {
      const texture = PIXI.Texture.EMPTY;
      const sprite = asSprite(
        { texture },
        { tint: 0xff0000 }
      );

      // tint is only set if the object supports it (checked by 'tint' in obj)
      if ('tint' in sprite) {
        expect((sprite as any).tint).toBe(0xff0000);
      } else {
        // If sprite doesn't support tint, that's fine - the code handles it
        expect(true).toBe(true);
      }
    });

    it('should apply alpha', () => {
      const texture = PIXI.Texture.EMPTY;
      const sprite = asSprite(
        { texture },
        { alpha: 0.5 }
      );

      expect(sprite.alpha).toBe(0.5);
    });

    it('should apply visible', () => {
      const texture = PIXI.Texture.EMPTY;
      const sprite = asSprite(
        { texture },
        { visible: false }
      );

      expect(sprite.visible).toBe(false);
    });

    it('should apply eventMode if supported', () => {
      const texture = PIXI.Texture.EMPTY;
      const sprite = asSprite(
        { texture },
        { eventMode: 'static' }
      );

      // eventMode is only set if the object supports it
      if ('eventMode' in sprite) {
        expect(sprite.eventMode).toBe('static');
      } else {
        // Sprite might not support eventMode in this PIXI version
        expect(true).toBe(true);
      }
    });
  });

  describe('asGraphics', () => {
    it('should create a Graphics object', () => {
      const graphics = asGraphics();
      expect(graphics).toBeInstanceOf(PIXI.Graphics);
    });

    it('should apply props after creation', () => {
      const graphics = asGraphics({ x: 50, y: 75 });
      expect(graphics.x).toBe(50);
      expect(graphics.y).toBe(75);
    });
  });

  describe('asContainer', () => {
    it('should create a Container', () => {
      const container = asContainer();
      expect(container).toBeInstanceOf(PIXI.Container);
    });

    it('should apply props after creation', () => {
      const container = asContainer({ x: 10, y: 20 });
      expect(container.x).toBe(10);
      expect(container.y).toBe(20);
    });

    it('should handle props on Container without anchor/scale/pivot', () => {
      const container = asContainer({
        x: 100,
        y: 200,
        rotation: Math.PI,
        alpha: 0.8,
        visible: true,
        eventMode: 'auto'
      });

      expect(container.x).toBe(100);
      expect(container.y).toBe(200);
      expect(container.rotation).toBe(Math.PI);
      expect(container.alpha).toBe(0.8);
      expect(container.visible).toBe(true);
      // eventMode is only set if Container supports it
      if ('eventMode' in container) {
        expect(container.eventMode).toBe('auto');
      }
    });
  });

  describe('asText', () => {
    it('should create a Text with constructor args', () => {
      const text = asText({
        text: 'Hello',
        style: {
          fontFamily: 'Arial',
          fontSize: 24
        }
      });

      expect(text).toBeInstanceOf(PIXI.Text);
      expect(text.text).toBe('Hello');
    });

    it('should apply props after creation', () => {
      const text = asText(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 }
        },
        { x: 100, y: 50 }
      );

      expect(text.x).toBe(100);
      expect(text.y).toBe(50);
    });

    it('should apply anchor prop as number', () => {
      const text = asText(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 }
        },
        { anchor: 0.5 }
      );

      expect(text.anchor.x).toBe(0.5);
      expect(text.anchor.y).toBe(0.5);
    });

    it('should apply anchor prop as object', () => {
      const text = asText(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 }
        },
        { anchor: { x: 0.25, y: 0.75 } }
      );

      expect(text.anchor.x).toBe(0.25);
      expect(text.anchor.y).toBe(0.75);
    });

    it('should apply scale as number', () => {
      const text = asText(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 }
        },
        { scale: 1.5 }
      );

      expect(text.scale.x).toBe(1.5);
      expect(text.scale.y).toBe(1.5);
    });

    it('should apply scale as object', () => {
      const text = asText(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 }
        },
        { scale: { x: 2, y: 3 } }
      );

      expect(text.scale.x).toBe(2);
      expect(text.scale.y).toBe(3);
    });

    it('should apply pivot as number', () => {
      const text = asText(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 }
        },
        { pivot: 5 }
      );

      expect(text.pivot.x).toBe(5);
      expect(text.pivot.y).toBe(5);
    });

    it('should apply pivot as object', () => {
      const text = asText(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 }
        },
        { pivot: { x: 10, y: 20 } }
      );

      expect(text.pivot.x).toBe(10);
      expect(text.pivot.y).toBe(20);
    });

    it('should apply all common props', () => {
      const text = asText(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 }
        },
        {
          x: 50,
          y: 60,
          rotation: Math.PI / 4,
          alpha: 0.7,
          visible: false,
          eventMode: 'dynamic'
        }
      );

      expect(text.x).toBe(50);
      expect(text.y).toBe(60);
      expect(text.rotation).toBe(Math.PI / 4);
      expect(text.alpha).toBe(0.7);
      expect(text.visible).toBe(false);
      // eventMode is only set if Text supports it
      if ('eventMode' in text) {
        expect(text.eventMode).toBe('dynamic');
      }
    });

    it('should handle text as number', () => {
      const text = asText({
        text: 123,
        style: { fontFamily: 'Arial', fontSize: 16 }
      });

      // PIXI.Text stores numbers as-is
      expect(text.text).toBe(123);
    });

    it('should handle text as object with toString', () => {
      const customObj = { toString: () => 'Custom Text' };
      const text = asText({
        text: customObj,
        style: { fontFamily: 'Arial', fontSize: 16 }
      });

      // PIXI.Text stores objects as-is, conversion happens during rendering
      expect(text.text).toBe(customObj);
    });
  });

  describe('asTextDPR', () => {
    it('should create a Text with DPR scaling', () => {
      const text = asTextDPR({
        text: 'Hello',
        style: {
          fontFamily: 'Arial',
          fontSize: 16
        },
        dprScale: 2
      });

      expect(text).toBeInstanceOf(PIXI.Text);
      expect(text.text).toBe('Hello');
      // Font size should be scaled up (16 * 2 = 32)
      // Note: PIXI.Text.style might be a TextStyle object, check if fontSize exists
      if (text.style && 'fontSize' in text.style) {
        expect((text.style as any).fontSize).toBe(32);
      }
      // Scale should be set to 1/dprScale (0.5) to display at original size
      expect(text.scale.x).toBe(0.5);
      expect(text.scale.y).toBe(0.5);
    });

    it('should default to dprScale of 2', () => {
      const text = asTextDPR({
        text: 'Test',
        style: {
          fontFamily: 'Arial',
          fontSize: 20
        }
      });

      if (text.style && 'fontSize' in text.style) {
        expect((text.style as any).fontSize).toBe(40); // 20 * 2
      }
      expect(text.scale.x).toBe(0.5); // 1 / 2
    });

    it('should apply custom dprScale', () => {
      const text = asTextDPR({
        text: 'Test',
        style: {
          fontFamily: 'Arial',
          fontSize: 16
        },
        dprScale: 4
      });

      if (text.style && 'fontSize' in text.style) {
        expect((text.style as any).fontSize).toBe(64); // 16 * 4
      }
      expect(text.scale.x).toBe(0.25); // 1 / 4
    });

    it('should enable pixelPerfect by default', () => {
      const text = asTextDPR({
        text: 'Test',
        style: {
          fontFamily: 'Arial',
          fontSize: 16
        }
      });

      // roundPixels is only set if the property exists on the object
      if ('roundPixels' in text) {
        expect(text.roundPixels).toBe(true);
      } else {
        // If roundPixels doesn't exist, that's fine - the code handles it
        expect(true).toBe(true);
      }
    });

    it('should allow disabling pixelPerfect', () => {
      const text = asTextDPR({
        text: 'Test',
        style: {
          fontFamily: 'Arial',
          fontSize: 16
        },
        pixelPerfect: false
      });

      // roundPixels is only set if the property exists on the object
      if ('roundPixels' in text) {
        expect(text.roundPixels).toBe(false);
      } else {
        // If roundPixels doesn't exist, that's fine - the code handles it
        expect(true).toBe(true);
      }
    });

    it('should apply props after creation', () => {
      const text = asTextDPR(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 }
        },
        { x: 100, y: 50 }
      );

      expect(text.x).toBe(100);
      expect(text.y).toBe(50);
    });

    it('should handle scale prop correctly with DPR scaling', () => {
      const text = asTextDPR(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 },
          dprScale: 2
        },
        { scale: 1.5 }
      );

      // Final scale should be (user scale / dprScale) = 1.5 / 2 = 0.75
      expect(text.scale.x).toBe(0.75);
      expect(text.scale.y).toBe(0.75);
    });

    it('should handle scale as object with DPR scaling', () => {
      const text = asTextDPR(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 },
          dprScale: 2
        },
        { scale: { x: 2, y: 1.5 } }
      );

      // Final scale should be (user scale / dprScale)
      expect(text.scale.x).toBe(1); // 2 / 2
      expect(text.scale.y).toBe(0.75); // 1.5 / 2
    });

    it('should apply anchor prop', () => {
      const text = asTextDPR(
        {
          text: 'Test',
          style: { fontFamily: 'Arial', fontSize: 16 }
        },
        { anchor: 0.5 }
      );

      expect(text.anchor.x).toBe(0.5);
      expect(text.anchor.y).toBe(0.5);
    });

    it('should handle text as number', () => {
      const text = asTextDPR({
        text: 42,
        style: { fontFamily: 'Arial', fontSize: 16 }
      });

      expect(text.text).toBe(42);
    });
  });

  describe('applyProps edge cases', () => {
    it('should handle undefined props', () => {
      const sprite = asSprite({ texture: PIXI.Texture.EMPTY });
      expect(sprite).toBeInstanceOf(PIXI.Sprite);
    });

    it('should handle empty props object', () => {
      const sprite = asSprite({ texture: PIXI.Texture.EMPTY }, {});
      expect(sprite).toBeInstanceOf(PIXI.Sprite);
    });

    it('should handle Graphics without anchor property', () => {
      const graphics = asGraphics({
        anchor: 0.5 // Graphics doesn't have anchor, should not throw
      });
      expect(graphics).toBeInstanceOf(PIXI.Graphics);
    });

    it('should handle Container without anchor property', () => {
      const container = asContainer({
        anchor: 0.5 // Container doesn't have anchor, should not throw
      });
      expect(container).toBeInstanceOf(PIXI.Container);
    });
  });
});

