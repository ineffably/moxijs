import { UIComponent } from '../../src/base/ui-component';
import { MeasuredSize, BoxModel, createDefaultBoxModel } from '../../src/base/box-model';
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

// Concrete implementation for testing abstract UIComponent
class TestUIComponent extends UIComponent {
  public measuredWidth: number = 100;
  public measuredHeight: number = 50;
  public renderCalled: boolean = false;

  measure(): MeasuredSize {
    return {
      width: this.measuredWidth,
      height: this.measuredHeight
    };
  }

  protected render(): void {
    this.renderCalled = true;
  }

  // Expose protected members for testing
  getBoxModelTest(): BoxModel {
    return this.boxModel;
  }

  getLayoutDirty(): boolean {
    return this.layoutDirty;
  }

  setHovered(value: boolean): void {
    this.hovered = value;
  }

  setPressed(value: boolean): void {
    this.pressed = value;
  }

  getHovered(): boolean {
    return this.hovered;
  }

  getPressed(): boolean {
    return this.pressed;
  }
}

describe('UIComponent', () => {
  let component: TestUIComponent;

  beforeEach(() => {
    component = new TestUIComponent();
  });

  describe('constructor', () => {
    it('should create component with default box model', () => {
      const boxModel = component.getBoxModelTest();

      expect(boxModel.width).toBe('auto');
      expect(boxModel.height).toBe('auto');
    });

    it('should create component with custom box model', () => {
      const customComponent = new TestUIComponent({
        width: 200,
        height: 100,
        padding: EdgeInsets.all(10)
      });

      const boxModel = customComponent.getBoxModelTest();
      expect(boxModel.width).toBe(200);
      expect(boxModel.height).toBe(100);
      expect(boxModel.padding.top).toBe(10);
    });

    it('should initialize with default state', () => {
      expect(component.visible).toBe(true);
      expect(component.enabled).toBe(true);
      expect(component.tabIndex).toBe(-1);
    });
  });

  describe('visibility', () => {
    it('should show component', () => {
      component.hide();
      component.show();

      expect(component.visible).toBe(true);
      expect(component.container.visible).toBe(true);
    });

    it('should hide component', () => {
      component.hide();

      expect(component.visible).toBe(false);
      expect(component.container.visible).toBe(false);
    });
  });

  describe('focus', () => {
    it('should not be focusable by default (tabIndex -1)', () => {
      expect(component.canFocus()).toBe(false);
    });

    it('should be focusable when tabIndex >= 0', () => {
      component.tabIndex = 0;
      expect(component.canFocus()).toBe(true);
    });

    it('should not be focusable when disabled', () => {
      component.tabIndex = 0;
      component.enabled = false;
      expect(component.canFocus()).toBe(false);
    });

    it('should not be focusable when hidden', () => {
      component.tabIndex = 0;
      component.hide();
      expect(component.canFocus()).toBe(false);
    });

    it('should report focused state', () => {
      expect(component.isFocused()).toBe(false);

      component.onFocus();
      expect(component.isFocused()).toBe(true);

      component.onBlur();
      expect(component.isFocused()).toBe(false);
    });
  });

  describe('layout', () => {
    it('should be dirty by default', () => {
      expect(component.getLayoutDirty()).toBe(true);
    });

    it('should perform layout and call render', () => {
      component.layout(800, 600);

      expect(component.renderCalled).toBe(true);
      expect(component.getLayoutDirty()).toBe(false);
    });

    it('should set computed layout', () => {
      component.layout(800, 600);

      const layout = component.getLayout();
      expect(layout.width).toBeGreaterThan(0);
      expect(layout.height).toBeGreaterThan(0);
    });

    it('should mark layout dirty', () => {
      component.layout(800, 600);
      expect(component.getLayoutDirty()).toBe(false);

      component.markLayoutDirty();
      expect(component.getLayoutDirty()).toBe(true);
    });

    it('should propagate dirty flag to parent', () => {
      const parent = new TestUIComponent();
      const child = new TestUIComponent();
      child.parent = parent;

      parent.layout(800, 600);
      expect(parent.getLayoutDirty()).toBe(false);

      child.markLayoutDirty();
      expect(parent.getLayoutDirty()).toBe(true);
    });
  });

  describe('position', () => {
    it('should set position', () => {
      component.setPosition(100, 200);

      const layout = component.getLayout();
      expect(layout.x).toBe(100);
      expect(layout.y).toBe(200);
    });
  });

  describe('state', () => {
    it('should track hovered state', () => {
      expect(component.getHovered()).toBe(false);

      component.setHovered(true);
      expect(component.getHovered()).toBe(true);
    });

    it('should track pressed state', () => {
      expect(component.getPressed()).toBe(false);

      component.setPressed(true);
      expect(component.getPressed()).toBe(true);
    });
  });

  describe('box model accessors', () => {
    it('should return box model', () => {
      const boxModel = component.getBoxModel();

      expect(boxModel).toBeDefined();
      expect(boxModel.width).toBe('auto');
    });

    it('should return computed layout', () => {
      component.layout(800, 600);

      const layout = component.getLayout();
      expect(layout).toBeDefined();
      expect(layout.width).toBeGreaterThan(0);
    });
  });

  describe('destroy', () => {
    it('should destroy container', () => {
      component.destroy();

      expect(component.container.destroy).toHaveBeenCalled();
    });
  });
});
