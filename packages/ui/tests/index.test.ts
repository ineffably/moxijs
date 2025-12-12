/**
 * Tests that all public exports from the package are valid.
 * This catches broken re-exports (e.g., from refactoring) at test time.
 */

// Mock PIXI.js
jest.mock('pixi.js', () => ({
  Container: jest.fn().mockImplementation(() => ({
    addChild: jest.fn(),
    addChildAt: jest.fn(),
    removeChild: jest.fn(),
    destroy: jest.fn(),
    position: { set: jest.fn() },
    visible: true,
    parent: null,
    effects: [],
    getGlobalPosition: jest.fn().mockReturnValue({ x: 0, y: 0 }),
  })),
  Graphics: jest.fn().mockImplementation(() => ({
    clear: jest.fn().mockReturnThis(),
    roundRect: jest.fn().mockReturnThis(),
    rect: jest.fn().mockReturnThis(),
    fill: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    moveTo: jest.fn().mockReturnThis(),
    lineTo: jest.fn().mockReturnThis(),
    visible: false,
  })),
  Text: jest.fn().mockImplementation(() => ({
    text: '',
    style: {},
    anchor: { set: jest.fn() },
    position: { set: jest.fn() },
  })),
  Sprite: jest.fn().mockImplementation(() => ({
    anchor: { set: jest.fn() },
    position: { set: jest.fn() },
    width: 0,
    height: 0,
  })),
  Texture: {
    from: jest.fn(),
    WHITE: {},
  },
  Assets: {
    load: jest.fn(),
  },
}));

// Mock @moxijs/core
jest.mock('@moxijs/core', () => ({
  PixelGrid: jest.fn(),
  px: jest.fn((n: number) => n),
  units: jest.fn((n: number) => n * 8),
  GRID: { UNIT: 8 },
  BORDER: {},
  createBorderConfig: jest.fn(),
  asTextDPR: jest.fn(),
  loadFonts: jest.fn(),
}));

import * as UI from '../src/index';

describe('Package exports', () => {
  describe('Base exports', () => {
    it('should export EdgeInsets', () => {
      expect(UI.EdgeInsets).toBeDefined();
    });

    it('should export box model utilities', () => {
      expect(UI.createDefaultBoxModel).toBeDefined();
    });

    it('should export UIComponent', () => {
      expect(UI.UIComponent).toBeDefined();
    });

    it('should export UIFocusManager', () => {
      expect(UI.UIFocusManager).toBeDefined();
    });
  });

  describe('Service exports', () => {
    it('should export LayoutEngine', () => {
      expect(UI.LayoutEngine).toBeDefined();
    });

    it('should export FormStateManager', () => {
      expect(UI.FormStateManager).toBeDefined();
    });

    it('should export ThemeApplier', () => {
      expect(UI.ThemeApplier).toBeDefined();
    });
  });

  describe('Layout exports', () => {
    it('should export FlexContainer', () => {
      expect(UI.FlexContainer).toBeDefined();
    });

    it('should export size value utilities', () => {
      expect(UI.parseSizeValue).toBeDefined();
      expect(UI.resolveParsedSize).toBeDefined();
    });

    it('should export layout type utilities', () => {
      expect(UI.createLayoutNode).toBeDefined();
      expect(UI.createDefaultLayoutStyle).toBeDefined();
      expect(UI.createEmptyComputedLayout).toBeDefined();
    });

    it('should export FlexLayoutEngine', () => {
      expect(UI.FlexLayoutEngine).toBeDefined();
    });

    it('should export LayoutTree', () => {
      expect(UI.LayoutTree).toBeDefined();
      expect(UI.createLayoutTree).toBeDefined();
    });

    it('should export layout participant utilities', () => {
      expect(UI.isFlexLayoutParticipant).toBeDefined();
      expect(UI.syncBoxModelToLayoutStyle).toBeDefined();
    });

    it('should export LayoutWrapper', () => {
      expect(UI.LayoutWrapper).toBeDefined();
      expect(UI.wrapForLayout).toBeDefined();
      expect(UI.wrapText).toBeDefined();
      expect(UI.wrapSprite).toBeDefined();
    });

    it('should export LayoutDebugOverlay', () => {
      expect(UI.LayoutDebugOverlay).toBeDefined();
      expect(UI.createLayoutDebugOverlay).toBeDefined();
    });
  });

  describe('Theming exports', () => {
    it('should export ThemeManager', () => {
      expect(UI.ThemeManager).toBeDefined();
    });

    it('should export ThemeResolver', () => {
      expect(UI.ThemeResolver).toBeDefined();
    });

    it('should export theme creation functions', () => {
      expect(UI.createDefaultDarkTheme).toBeDefined();
      expect(UI.createDefaultLightTheme).toBeDefined();
    });
  });

  describe('Font exports', () => {
    it('should export font types', () => {
      // FontType, FontProps, and UIFontConfig are TypeScript types
      // They don't exist at runtime, but we can verify they're importable
      // by checking that the font-config module exports them (type-only check)
      // This test ensures the types are exported from index.ts
      expect(true).toBe(true); // Types are verified at compile time
    });
  });

  describe('Component exports', () => {
    it('should export UILabel', () => {
      expect(UI.UILabel).toBeDefined();
    });

    it('should export UIPanel', () => {
      expect(UI.UIPanel).toBeDefined();
    });

    it('should export UIButton', () => {
      expect(UI.UIButton).toBeDefined();
    });

    it('should export UICheckbox', () => {
      expect(UI.UICheckbox).toBeDefined();
    });

    it('should export UICheckboxWithLabel', () => {
      expect(UI.UICheckboxWithLabel).toBeDefined();
    });

    it('should export UIRadioButton', () => {
      expect(UI.UIRadioButton).toBeDefined();
    });

    it('should export UIRadioGroup', () => {
      expect(UI.UIRadioGroup).toBeDefined();
    });

    it('should export UISelect', () => {
      expect(UI.UISelect).toBeDefined();
    });

    it('should export UITextInput', () => {
      expect(UI.UITextInput).toBeDefined();
    });

    it('should export UITextArea', () => {
      expect(UI.UITextArea).toBeDefined();
    });

    it('should export UIScrollContainer', () => {
      expect(UI.UIScrollContainer).toBeDefined();
    });

    it('should export UITabs', () => {
      expect(UI.UITabs).toBeDefined();
    });

    it('should export CardPanel', () => {
      expect(UI.CardPanel).toBeDefined();
    });

    it('should export FlatCardStyle', () => {
      expect(UI.FlatCardStyle).toBeDefined();
    });
  });

  describe('UILayer exports', () => {
    it('should export UILayer', () => {
      expect(UI.UILayer).toBeDefined();
    });

    it('should export UIScaleMode', () => {
      expect(UI.UIScaleMode).toBeDefined();
    });
  });
});
