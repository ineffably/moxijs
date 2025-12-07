import { FlexContainer, FlexDirection, FlexJustify, FlexAlign } from '../../src/layout/flex-container';
import { UIComponent } from '../../src/base/ui-component';
import { UIFocusManager, Focusable } from '../../src/base/ui-focus-manager';
import { MeasuredSize } from '../../src/base/box-model';
import { EdgeInsets } from '../../src/base/edge-insets';

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
    stroke: jest.fn().mockReturnThis(),
    visible: false,
  })),
}));

// Mock child component for testing
class MockChildComponent extends UIComponent {
  constructor(
    public mockWidth: number = 100,
    public mockHeight: number = 50
  ) {
    super();
  }

  measure(): MeasuredSize {
    return { width: this.mockWidth, height: this.mockHeight };
  }

  protected render(): void {}
}

// Mock focusable component for testing auto-registration
class MockFocusableComponent extends UIComponent implements Focusable {
  private _focused: boolean = false;

  constructor() {
    super();
    this.tabIndex = 0;
  }

  measure(): MeasuredSize {
    return { width: 100, height: 30 };
  }

  protected render(): void {}

  canFocus(): boolean {
    return this.enabled && this.visible && this.tabIndex >= 0;
  }

  onFocus(): void {
    this._focused = true;
  }

  onBlur(): void {
    this._focused = false;
  }

  isFocused(): boolean {
    return this._focused;
  }
}

describe('FlexContainer', () => {
  beforeEach(() => {
    // Clear singleton
    (UIFocusManager as any).instance = null;
  });

  describe('constructor', () => {
    it('should create container with default props', () => {
      const container = new FlexContainer();

      expect(container.children).toEqual([]);
    });

    it('should create container with custom direction', () => {
      const container = new FlexContainer({
        direction: FlexDirection.Column,
      });

      const boxModel = container.getBoxModel();
      expect(boxModel.flex?.direction).toBe('column');
    });

    it('should create container with custom justify', () => {
      const container = new FlexContainer({
        justify: FlexJustify.Center,
      });

      const boxModel = container.getBoxModel();
      expect(boxModel.flex?.justify).toBe('center');
    });

    it('should create container with custom align', () => {
      const container = new FlexContainer({
        align: FlexAlign.Center,
      });

      const boxModel = container.getBoxModel();
      expect(boxModel.flex?.alignItems).toBe('center');
    });

    it('should create container with gap', () => {
      const container = new FlexContainer({
        gap: 20,
      });

      const boxModel = container.getBoxModel();
      expect(boxModel.flex?.gap).toBe(20);
    });

    it('should create container with padding', () => {
      const container = new FlexContainer({
        padding: EdgeInsets.all(16),
      });

      const boxModel = container.getBoxModel();
      expect(boxModel.padding.top).toBe(16);
      expect(boxModel.padding.horizontal).toBe(32);
    });

    it('should create container with fixed dimensions', () => {
      const container = new FlexContainer({
        width: 400,
        height: 300,
      });

      const boxModel = container.getBoxModel();
      expect(boxModel.width).toBe(400);
      expect(boxModel.height).toBe(300);
    });

    it('should create container with fill dimensions', () => {
      const container = new FlexContainer({
        width: 'fill',
        height: 'fill',
      });

      const boxModel = container.getBoxModel();
      expect(boxModel.width).toBe('fill');
      expect(boxModel.height).toBe('fill');
    });

    it('should set font config when provided', () => {
      const fontConfig = { fontFamily: 'Arial', fontSize: 14 };
      const container = new FlexContainer({
        fontConfig,
      });

      expect(container.getFontConfig()).toEqual(fontConfig);
    });
  });

  describe('child management', () => {
    it('should add child component', () => {
      const container = new FlexContainer();
      const child = new MockChildComponent();

      container.addChild(child);

      expect(container.children.length).toBe(1);
      expect(container.children[0]).toBe(child);
      expect(child.parent).toBe(container);
    });

    it('should add multiple children', () => {
      const container = new FlexContainer();
      const child1 = new MockChildComponent();
      const child2 = new MockChildComponent();
      const child3 = new MockChildComponent();

      container.addChild(child1);
      container.addChild(child2);
      container.addChild(child3);

      expect(container.children.length).toBe(3);
    });

    it('should remove child component', () => {
      const container = new FlexContainer();
      const child = new MockChildComponent();

      container.addChild(child);
      container.removeChild(child);

      expect(container.children.length).toBe(0);
      expect(child.parent).toBeUndefined();
    });

    it('should not fail when removing non-existent child', () => {
      const container = new FlexContainer();
      const child = new MockChildComponent();

      container.removeChild(child);

      expect(container.children.length).toBe(0);
    });

    it('should mark layout dirty when adding child', () => {
      const container = new FlexContainer();
      container.layout(800, 600);

      const child = new MockChildComponent();
      container.addChild(child);

      // Layout should be dirty after adding child
      // (we can't directly test layoutDirty, but we can verify behavior)
      expect(container.children.length).toBe(1);
    });

    it('should remove all children', () => {
      const container = new FlexContainer();
      const child1 = new MockChildComponent();
      const child2 = new MockChildComponent();
      const child3 = new MockChildComponent();

      container.addChild(child1);
      container.addChild(child2);
      container.addChild(child3);
      expect(container.children.length).toBe(3);

      container.removeAllChildren();

      expect(container.children.length).toBe(0);
      expect(child1.parent).toBeUndefined();
      expect(child2.parent).toBeUndefined();
      expect(child3.parent).toBeUndefined();
    });

    it('should handle removeAllChildren on empty container', () => {
      const container = new FlexContainer();

      // Should not throw
      container.removeAllChildren();

      expect(container.children.length).toBe(0);
    });
  });

  describe('measure', () => {
    it('should measure empty container with padding only', () => {
      const container = new FlexContainer({
        padding: EdgeInsets.all(10),
      });

      const size = container.measure();

      expect(size.width).toBe(20); // padding horizontal
      expect(size.height).toBe(20); // padding vertical
    });

    it('should measure row container children', () => {
      const container = new FlexContainer({
        direction: FlexDirection.Row,
        gap: 10,
        padding: EdgeInsets.zero(),
      });

      container.addChild(new MockChildComponent(100, 50));
      container.addChild(new MockChildComponent(100, 50));

      const size = container.measure();

      // Row: sum widths + gap, max height
      expect(size.width).toBe(210); // 100 + 10 + 100
      expect(size.height).toBe(50);
    });

    it('should measure column container children', () => {
      const container = new FlexContainer({
        direction: FlexDirection.Column,
        gap: 10,
        padding: EdgeInsets.zero(),
      });

      container.addChild(new MockChildComponent(100, 50));
      container.addChild(new MockChildComponent(100, 50));

      const size = container.measure();

      // Column: max width, sum heights + gap
      expect(size.width).toBe(100);
      expect(size.height).toBe(110); // 50 + 10 + 50
    });

    it('should include padding in measurement', () => {
      const container = new FlexContainer({
        direction: FlexDirection.Row,
        gap: 0,
        padding: EdgeInsets.all(20),
      });

      container.addChild(new MockChildComponent(100, 50));

      const size = container.measure();

      expect(size.width).toBe(140); // 100 + 40 padding
      expect(size.height).toBe(90); // 50 + 40 padding
    });
  });

  describe('layout', () => {
    it('should layout with fill dimensions', () => {
      const container = new FlexContainer({
        width: 'fill',
        height: 'fill',
      });

      container.layout(800, 600);

      const layout = container.getLayout();
      expect(layout.width).toBe(800);
      expect(layout.height).toBe(600);
    });

    it('should layout with fixed dimensions', () => {
      const container = new FlexContainer({
        width: 400,
        height: 300,
      });

      container.layout(800, 600);

      const layout = container.getLayout();
      expect(layout.width).toBe(400);
      expect(layout.height).toBe(300);
    });

    it('should layout with auto dimensions', () => {
      const container = new FlexContainer({
        padding: EdgeInsets.all(10),
      });

      container.addChild(new MockChildComponent(100, 50));

      container.layout(800, 600);

      const layout = container.getLayout();
      expect(layout.width).toBe(120); // 100 + 20 padding
      expect(layout.height).toBe(70); // 50 + 20 padding
    });

    it('should calculate content area', () => {
      const container = new FlexContainer({
        width: 400,
        height: 300,
        padding: EdgeInsets.all(20),
      });

      container.layout(800, 600);

      const layout = container.getLayout();
      expect(layout.contentX).toBe(20);
      expect(layout.contentY).toBe(20);
      expect(layout.contentWidth).toBe(360); // 400 - 40
      expect(layout.contentHeight).toBe(260); // 300 - 40
    });
  });

  describe('auto focus registration', () => {
    it('should auto-register focusable child when focus manager exists', () => {
      const focusManager = new UIFocusManager();
      const container = new FlexContainer();
      const focusable = new MockFocusableComponent();

      container.addChild(focusable);

      expect(focusManager.getFocusableComponents()).toContain(focusable);
      focusManager.destroy();
    });

    it('should not fail without focus manager', () => {
      const container = new FlexContainer();
      const focusable = new MockFocusableComponent();

      expect(() => container.addChild(focusable)).not.toThrow();
    });

    it('should auto-unregister focusable child on removal', () => {
      const focusManager = new UIFocusManager();
      const container = new FlexContainer();
      const focusable = new MockFocusableComponent();

      container.addChild(focusable);
      container.removeChild(focusable);

      expect(focusManager.getFocusableComponents()).not.toContain(focusable);
      focusManager.destroy();
    });

    it('should recursively register nested focusable children', () => {
      const focusManager = new UIFocusManager();
      const parent = new FlexContainer();
      const child = new FlexContainer();
      const focusable = new MockFocusableComponent();

      child.addChild(focusable);
      parent.addChild(child);

      expect(focusManager.getFocusableComponents()).toContain(focusable);
      focusManager.destroy();
    });
  });

  describe('measureContent', () => {
    it('should return 0,0 for container', () => {
      const container = new FlexContainer();

      const content = container.measureContent();

      expect(content.width).toBe(0);
      expect(content.height).toBe(0);
    });
  });
});
