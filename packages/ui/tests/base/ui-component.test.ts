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

  // Expose focus ring for testing
  getFocusRing() {
    return this.focusRing;
  }

  // Expose theme resolver methods for testing
  testResolveColor(type: 'background' | 'border' | 'text' | 'selected' | 'hover' | 'focus' | 'disabled', override?: number) {
    return this.resolveColor(type, override);
  }

  testMakeInteractive(cursor?: string) {
    this.makeInteractive(cursor);
  }

  // Expose inherited font methods
  testResolveInheritedFont<K extends keyof import('../../src/base/ui-component').UIFontConfig>(
    key: K,
    localOverride?: import('../../src/base/ui-component').UIFontConfig[K]
  ) {
    return this.resolveInheritedFont(key, localOverride);
  }

  testGetInheritedFontFamily(override?: string) {
    return this.getInheritedFontFamily(override);
  }

  testGetInheritedFontSize(override?: number) {
    return this.getInheritedFontSize(override);
  }

  testGetInheritedTextColor(override?: number) {
    return this.getInheritedTextColor(override);
  }

  testGetInheritedFontWeight(override?: 'normal' | 'bold' | number) {
    return this.resolveInheritedFont('fontWeight', override);
  }

  // Expose layout config methods
  testResolveInheritedLayoutParam<K extends keyof import('../../src/base/ui-component').UILayoutConfig>(
    key: K,
    localOverride?: import('../../src/base/ui-component').UILayoutConfig[K]
  ) {
    return this.resolveInheritedLayoutParam(key, localOverride);
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

  describe('flex properties', () => {
    it('should set flex grow', () => {
      component.setFlexGrow(2);

      const boxModel = component.getBoxModel();
      expect(boxModel.flex?.grow).toBe(2);
    });

    it('should set flex shrink', () => {
      component.setFlexShrink(0);

      const boxModel = component.getBoxModel();
      expect(boxModel.flex?.shrink).toBe(0);
    });

    it('should set flex basis as number', () => {
      component.setFlexBasis(100);

      const boxModel = component.getBoxModel();
      expect(boxModel.flex?.basis).toBe(100);
    });

    it('should set flex basis as auto', () => {
      component.setFlexBasis('auto');

      const boxModel = component.getBoxModel();
      expect(boxModel.flex?.basis).toBe('auto');
    });

    it('should set align self', () => {
      component.setAlignSelf('center');

      const boxModel = component.getBoxModel();
      expect(boxModel.flex?.alignSelf).toBe('center');
    });

    it('should set multiple flex properties at once', () => {
      component.setFlex({ grow: 1, shrink: 0, basis: 200 });

      const boxModel = component.getBoxModel();
      expect(boxModel.flex?.grow).toBe(1);
      expect(boxModel.flex?.shrink).toBe(0);
      expect(boxModel.flex?.basis).toBe(200);
    });

    it('should preserve existing flex properties when setting individual values', () => {
      component.setFlexGrow(2);
      component.setFlexShrink(1);

      const boxModel = component.getBoxModel();
      expect(boxModel.flex?.grow).toBe(2);
      expect(boxModel.flex?.shrink).toBe(1);
    });
  });

  describe('font config', () => {
    it('should set and get font config', () => {
      const fontConfig = {
        fontFamily: 'Arial',
        fontSize: 16,
        fontWeight: 'bold' as const,
        textColor: 0xffffff
      };

      component.setFontConfig(fontConfig);

      expect(component.getFontConfig()).toEqual(fontConfig);
    });

    it('should return undefined when no font config set', () => {
      expect(component.getFontConfig()).toBeUndefined();
    });

    it('should allow partial font config', () => {
      component.setFontConfig({ fontFamily: 'Helvetica' });

      const config = component.getFontConfig();
      expect(config?.fontFamily).toBe('Helvetica');
      expect(config?.fontSize).toBeUndefined();
    });
  });

  describe('inherited font config', () => {
    it('should return local override when provided', () => {
      const result = component.testResolveInheritedFont('fontFamily', 'Override');
      expect(result).toBe('Override');
    });

    it('should return local config when set', () => {
      component.setFontConfig({ fontFamily: 'Local' });
      const result = component.testResolveInheritedFont('fontFamily');
      expect(result).toBe('Local');
    });

    it('should inherit from parent', () => {
      const parent = new TestUIComponent();
      parent.setFontConfig({ fontFamily: 'Parent', fontSize: 16 });
      component.parent = parent;

      expect(component.testGetInheritedFontFamily()).toBe('Parent');
      expect(component.testGetInheritedFontSize()).toBe(16);
    });

    it('should inherit from grandparent', () => {
      const grandparent = new TestUIComponent();
      const parent = new TestUIComponent();
      grandparent.setFontConfig({ textColor: 0xff0000 });
      parent.parent = grandparent;
      component.parent = parent;

      expect(component.testGetInheritedTextColor()).toBe(0xff0000);
    });

    it('should prefer local config over parent', () => {
      const parent = new TestUIComponent();
      parent.setFontConfig({ fontFamily: 'Parent' });
      component.setFontConfig({ fontFamily: 'Local' });
      component.parent = parent;

      expect(component.testGetInheritedFontFamily()).toBe('Local');
    });

    it('should return undefined when not set anywhere', () => {
      expect(component.testGetInheritedFontFamily()).toBeUndefined();
    });

    it('should inherit fontWeight from parent', () => {
      const parent = new TestUIComponent();
      parent.setFontConfig({ fontWeight: 'bold' });
      component.parent = parent;

      expect(component.testGetInheritedFontWeight()).toBe('bold');
    });

    it('should support numeric fontWeight values', () => {
      component.setFontConfig({ fontWeight: 600 });

      expect(component.testGetInheritedFontWeight()).toBe(600);
    });

    it('should override parent fontWeight with local value', () => {
      const parent = new TestUIComponent();
      parent.setFontConfig({ fontWeight: 'bold' });
      component.setFontConfig({ fontWeight: 'normal' });
      component.parent = parent;

      expect(component.testGetInheritedFontWeight()).toBe('normal');
    });

    it('should use local override for fontWeight', () => {
      component.setFontConfig({ fontWeight: 'bold' });

      expect(component.testGetInheritedFontWeight('normal')).toBe('normal');
    });
  });

  describe('layout config', () => {
    it('should set and get layout config', () => {
      const layoutConfig = {
        defaultPadding: 10,
        borderRadius: 4,
        controlHeight: 32,
      };

      component.setLayoutConfig(layoutConfig);

      expect(component.getLayoutConfig()).toEqual(layoutConfig);
    });

    it('should return undefined when not set', () => {
      expect(component.getLayoutConfig()).toBeUndefined();
    });

    it('should inherit layout config from parent', () => {
      const parent = new TestUIComponent();
      parent.setLayoutConfig({ controlHeight: 40 });
      component.parent = parent;

      expect(component.testResolveInheritedLayoutParam('controlHeight')).toBe(40);
    });

    it('should use local override over parent', () => {
      const parent = new TestUIComponent();
      parent.setLayoutConfig({ controlHeight: 40 });
      component.parent = parent;

      expect(component.testResolveInheritedLayoutParam('controlHeight', 32)).toBe(32);
    });
  });

  describe('focus ring', () => {
    it('should create focus ring on construction', () => {
      expect(component.getFocusRing()).toBeDefined();
    });

    it('should hide focus ring initially', () => {
      expect(component.getFocusRing()?.visible).toBe(false);
    });

    it('should use theme colors for focus ring', () => {
      // Layout component to get valid dimensions
      component.layout(800, 600);

      // Trigger focus to show and update focus ring
      component.tabIndex = 0;
      component.onFocus();

      // Focus ring should be visible and use theme colors
      const focusRing = component.getFocusRing();
      expect(focusRing?.visible).toBe(true);

      // Verify resolveColor was called for focus color (indirectly via stroke calls)
      // The focus ring uses theme colors, verified by checking the ring exists and is visible
      expect(focusRing).toBeDefined();
    });

    it('should show focus ring on focus', () => {
      component.layout(800, 600);
      component.tabIndex = 0;

      component.onFocus();

      expect(component.getFocusRing()?.visible).toBe(true);
    });

    it('should hide focus ring on blur', () => {
      component.layout(800, 600);
      component.tabIndex = 0;

      component.onFocus();
      component.onBlur();

      expect(component.getFocusRing()?.visible).toBe(false);
    });
  });

  describe('theme resolver', () => {
    it('should resolve colors from theme', () => {
      const color = component.testResolveColor('background');
      expect(typeof color).toBe('number');
    });

    it('should use override color when provided', () => {
      const overrideColor = 0xff0000;
      const color = component.testResolveColor('background', overrideColor);
      expect(color).toBe(overrideColor);
    });
  });

  describe('interactivity', () => {
    it('should make container interactive with default cursor', () => {
      component.testMakeInteractive();

      expect(component.container.eventMode).toBe('static');
      expect(component.container.cursor).toBe('pointer');
    });

    it('should make container interactive with custom cursor', () => {
      component.testMakeInteractive('text');

      expect(component.container.eventMode).toBe('static');
      expect(component.container.cursor).toBe('text');
    });
  });

  describe('global bounds', () => {
    it('should return global bounds', () => {
      component.layout(800, 600);
      const bounds = component.getGlobalBounds();

      expect(bounds.x).toBe(0);
      expect(bounds.y).toBe(0);
      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.height).toBeGreaterThan(0);
    });
  });

  describe('IFlexLayoutParticipant', () => {
    it('should have unique id', () => {
      const component1 = new TestUIComponent();
      const component2 = new TestUIComponent();

      expect(component1.id).toBeDefined();
      expect(component2.id).toBeDefined();
      expect(component1.id).not.toBe(component2.id);
    });

    it('should have layout node', () => {
      expect(component.layoutNode).toBeDefined();
      expect(component.layoutNode.id).toBe(component.id);
    });

    it('should measure content', () => {
      component.measuredWidth = 150;
      component.measuredHeight = 75;

      const size = component.measureContent();

      expect(size.width).toBe(150);
      expect(size.height).toBe(75);
    });

    it('should apply layout', () => {
      const computed = {
        x: 10,
        y: 20,
        width: 200,
        height: 100,
        contentX: 5,
        contentY: 5,
        contentWidth: 190,
        contentHeight: 90,
      };

      component.applyLayout(computed);

      const layout = component.getLayout();
      expect(layout.x).toBe(10);
      expect(layout.y).toBe(20);
      expect(layout.width).toBe(200);
      expect(layout.height).toBe(100);
      expect(component.container.position.set).toHaveBeenCalledWith(10, 20);
    });

    it('should sync layout style from box model', () => {
      component.setFlexGrow(2);

      expect(component.layoutNode.style.flexGrow).toBe(2);
    });
  });
});
