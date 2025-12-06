import { UIFocusManager, Focusable } from '../../src/base/ui-focus-manager';
import { UIComponent } from '../../src/base/ui-component';
import { MeasuredSize } from '../../src/base/box-model';

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

// Mock focusable component for testing
class MockFocusableComponent extends UIComponent implements Focusable {
  private _canFocus: boolean = true;
  private _focused: boolean = false;
  public focusCalled: boolean = false;
  public blurCalled: boolean = false;

  constructor(tabIdx: number = 0) {
    super();
    this.tabIndex = tabIdx;
  }

  measure(): MeasuredSize {
    return { width: 100, height: 50 };
  }

  protected render(): void {}

  canFocus(): boolean {
    return this._canFocus && this.enabled && this.visible;
  }

  onFocus(): void {
    this._focused = true;
    this.focusCalled = true;
  }

  onBlur(): void {
    this._focused = false;
    this.blurCalled = true;
  }

  isFocused(): boolean {
    return this._focused;
  }

  setCanFocus(value: boolean): void {
    this._canFocus = value;
  }
}

describe('UIFocusManager', () => {
  let focusManager: UIFocusManager;

  beforeEach(() => {
    // Clear singleton
    (UIFocusManager as any).instance = null;
    focusManager = new UIFocusManager();
  });

  afterEach(() => {
    focusManager.destroy();
  });

  describe('singleton', () => {
    it('should set instance on construction', () => {
      expect(UIFocusManager.getInstance()).toBe(focusManager);
    });

    it('should replace instance on new construction', () => {
      const newManager = new UIFocusManager();
      expect(UIFocusManager.getInstance()).toBe(newManager);
      newManager.destroy();
    });
  });

  describe('register', () => {
    it('should register a focusable component', () => {
      const component = new MockFocusableComponent(0);

      focusManager.register(component);

      expect(focusManager.getFocusableComponents()).toContain(component);
    });

    it('should not register duplicate components', () => {
      const component = new MockFocusableComponent(0);

      focusManager.register(component);
      focusManager.register(component);

      expect(focusManager.getFocusableComponents().length).toBe(1);
    });

    it('should sort components by tabIndex', () => {
      const comp1 = new MockFocusableComponent(2);
      const comp2 = new MockFocusableComponent(1);
      const comp3 = new MockFocusableComponent(3);

      focusManager.register(comp1);
      focusManager.register(comp2);
      focusManager.register(comp3);

      const components = focusManager.getFocusableComponents();
      expect(components[0].tabIndex).toBe(1);
      expect(components[1].tabIndex).toBe(2);
      expect(components[2].tabIndex).toBe(3);
    });
  });

  describe('unregister', () => {
    it('should remove a component', () => {
      const component = new MockFocusableComponent(0);

      focusManager.register(component);
      focusManager.unregister(component);

      expect(focusManager.getFocusableComponents()).not.toContain(component);
    });

    it('should blur component if it was focused', () => {
      const component = new MockFocusableComponent(0);

      focusManager.register(component);
      focusManager.focus(component);
      focusManager.unregister(component);

      expect(component.blurCalled).toBe(true);
    });
  });

  describe('focus', () => {
    it('should focus a component', () => {
      const component = new MockFocusableComponent(0);

      focusManager.register(component);
      focusManager.focus(component);

      expect(component.focusCalled).toBe(true);
      expect(focusManager.getCurrentFocus()).toBe(component);
    });

    it('should not focus unregistered component', () => {
      const component = new MockFocusableComponent(0);

      focusManager.focus(component);

      expect(component.focusCalled).toBe(false);
      expect(focusManager.getCurrentFocus()).toBeNull();
    });

    it('should not focus component that cannot focus', () => {
      const component = new MockFocusableComponent(0);
      component.setCanFocus(false);

      focusManager.register(component);
      focusManager.focus(component);

      expect(component.focusCalled).toBe(false);
    });

    it('should blur previous component when focusing new one', () => {
      const comp1 = new MockFocusableComponent(0);
      const comp2 = new MockFocusableComponent(1);

      focusManager.register(comp1);
      focusManager.register(comp2);

      focusManager.focus(comp1);
      focusManager.focus(comp2);

      expect(comp1.blurCalled).toBe(true);
      expect(comp2.focusCalled).toBe(true);
    });
  });

  describe('blur', () => {
    it('should blur current focus', () => {
      const component = new MockFocusableComponent(0);

      focusManager.register(component);
      focusManager.focus(component);
      focusManager.blur();

      expect(component.blurCalled).toBe(true);
      expect(focusManager.getCurrentFocus()).toBeNull();
    });

    it('should do nothing if nothing focused', () => {
      focusManager.blur();
      expect(focusManager.getCurrentFocus()).toBeNull();
    });
  });

  describe('focusNext', () => {
    it('should focus next component', () => {
      const comp1 = new MockFocusableComponent(0);
      const comp2 = new MockFocusableComponent(1);

      focusManager.register(comp1);
      focusManager.register(comp2);
      focusManager.focus(comp1);

      focusManager.focusNext();

      expect(focusManager.getCurrentFocus()).toBe(comp2);
    });

    it('should wrap around to first component', () => {
      const comp1 = new MockFocusableComponent(0);
      const comp2 = new MockFocusableComponent(1);

      focusManager.register(comp1);
      focusManager.register(comp2);
      focusManager.focus(comp2);

      focusManager.focusNext();

      expect(focusManager.getCurrentFocus()).toBe(comp1);
    });

    it('should skip unfocusable components', () => {
      const comp1 = new MockFocusableComponent(0);
      const comp2 = new MockFocusableComponent(1);
      const comp3 = new MockFocusableComponent(2);
      comp2.setCanFocus(false);

      focusManager.register(comp1);
      focusManager.register(comp2);
      focusManager.register(comp3);
      focusManager.focus(comp1);

      focusManager.focusNext();

      expect(focusManager.getCurrentFocus()).toBe(comp3);
    });

    it('should do nothing with empty list', () => {
      focusManager.focusNext();
      expect(focusManager.getCurrentFocus()).toBeNull();
    });
  });

  describe('focusPrevious', () => {
    it('should focus previous component', () => {
      const comp1 = new MockFocusableComponent(0);
      const comp2 = new MockFocusableComponent(1);

      focusManager.register(comp1);
      focusManager.register(comp2);
      focusManager.focus(comp2);

      focusManager.focusPrevious();

      expect(focusManager.getCurrentFocus()).toBe(comp1);
    });

    it('should wrap around to last component', () => {
      const comp1 = new MockFocusableComponent(0);
      const comp2 = new MockFocusableComponent(1);

      focusManager.register(comp1);
      focusManager.register(comp2);
      focusManager.focus(comp1);

      focusManager.focusPrevious();

      expect(focusManager.getCurrentFocus()).toBe(comp2);
    });

    it('should skip unfocusable components', () => {
      const comp1 = new MockFocusableComponent(0);
      const comp2 = new MockFocusableComponent(1);
      const comp3 = new MockFocusableComponent(2);
      comp2.setCanFocus(false);

      focusManager.register(comp1);
      focusManager.register(comp2);
      focusManager.register(comp3);
      focusManager.focus(comp3);

      focusManager.focusPrevious();

      expect(focusManager.getCurrentFocus()).toBe(comp1);
    });
  });

  describe('focusFirst', () => {
    it('should focus first focusable component', () => {
      const comp1 = new MockFocusableComponent(0);
      const comp2 = new MockFocusableComponent(1);

      focusManager.register(comp1);
      focusManager.register(comp2);

      focusManager.focusFirst();

      expect(focusManager.getCurrentFocus()).toBe(comp1);
    });

    it('should skip unfocusable first component', () => {
      const comp1 = new MockFocusableComponent(0);
      const comp2 = new MockFocusableComponent(1);
      comp1.setCanFocus(false);

      focusManager.register(comp1);
      focusManager.register(comp2);

      focusManager.focusFirst();

      expect(focusManager.getCurrentFocus()).toBe(comp2);
    });

    it('should do nothing with empty list', () => {
      focusManager.focusFirst();
      expect(focusManager.getCurrentFocus()).toBeNull();
    });
  });

  describe('focusLast', () => {
    it('should focus last focusable component', () => {
      const comp1 = new MockFocusableComponent(0);
      const comp2 = new MockFocusableComponent(1);

      focusManager.register(comp1);
      focusManager.register(comp2);

      focusManager.focusLast();

      expect(focusManager.getCurrentFocus()).toBe(comp2);
    });

    it('should skip unfocusable last component', () => {
      const comp1 = new MockFocusableComponent(0);
      const comp2 = new MockFocusableComponent(1);
      comp2.setCanFocus(false);

      focusManager.register(comp1);
      focusManager.register(comp2);

      focusManager.focusLast();

      expect(focusManager.getCurrentFocus()).toBe(comp1);
    });
  });

  describe('requestFocus', () => {
    it('should be alias for focus', () => {
      const component = new MockFocusableComponent(0);

      focusManager.register(component);
      focusManager.requestFocus(component);

      expect(focusManager.getCurrentFocus()).toBe(component);
    });
  });

  describe('clear', () => {
    it('should remove all components', () => {
      const comp1 = new MockFocusableComponent(0);
      const comp2 = new MockFocusableComponent(1);

      focusManager.register(comp1);
      focusManager.register(comp2);
      focusManager.focus(comp1);

      focusManager.clear();

      expect(focusManager.getFocusableComponents().length).toBe(0);
      expect(focusManager.getCurrentFocus()).toBeNull();
    });
  });

  describe('getFocusableComponents', () => {
    it('should return copy of components array', () => {
      const component = new MockFocusableComponent(0);
      focusManager.register(component);

      const components = focusManager.getFocusableComponents();
      components.push(new MockFocusableComponent(1));

      expect(focusManager.getFocusableComponents().length).toBe(1);
    });
  });

  describe('registerContainer', () => {
    it('should discover focusable components in container', () => {
      const container = new MockContainerComponent();
      const child1 = new MockFocusableComponent(0);
      const child2 = new MockFocusableComponent(1);
      container.children = [child1, child2];

      focusManager.registerContainer(container);

      const components = focusManager.getFocusableComponents();
      expect(components).toContain(child1);
      expect(components).toContain(child2);
    });

    it('should discover nested focusable components', () => {
      const container = new MockContainerComponent();
      const nestedContainer = new MockContainerComponent();
      const nestedChild = new MockFocusableComponent(0);
      nestedContainer.children = [nestedChild];
      container.children = [nestedContainer];

      focusManager.registerContainer(container);

      expect(focusManager.getFocusableComponents()).toContain(nestedChild);
    });

    it('should register container itself if focusable', () => {
      const container = new MockFocusableContainerComponent(0);

      focusManager.registerContainer(container);

      expect(focusManager.getFocusableComponents()).toContain(container);
    });

    it('should sort all discovered components by tabIndex', () => {
      const container = new MockContainerComponent();
      const child1 = new MockFocusableComponent(2);
      const child2 = new MockFocusableComponent(0);
      const child3 = new MockFocusableComponent(1);
      container.children = [child1, child2, child3];

      focusManager.registerContainer(container);

      const components = focusManager.getFocusableComponents();
      expect(components[0].tabIndex).toBe(0);
      expect(components[1].tabIndex).toBe(1);
      expect(components[2].tabIndex).toBe(2);
    });
  });

  describe('unregister edge cases', () => {
    it('should adjust focus index when unregistering before current', () => {
      const comp1 = new MockFocusableComponent(0);
      const comp2 = new MockFocusableComponent(1);
      const comp3 = new MockFocusableComponent(2);

      focusManager.register(comp1);
      focusManager.register(comp2);
      focusManager.register(comp3);
      focusManager.focus(comp3);

      focusManager.unregister(comp1);

      // comp3 should still be focused
      expect(focusManager.getCurrentFocus()).toBe(comp3);
    });

    it('should handle unregistering non-existent component', () => {
      const component = new MockFocusableComponent(0);

      // Should not throw
      expect(() => focusManager.unregister(component)).not.toThrow();
    });
  });

  describe('focusNext edge cases', () => {
    it('should handle all components being unfocusable', () => {
      const comp1 = new MockFocusableComponent(0);
      const comp2 = new MockFocusableComponent(1);
      comp1.setCanFocus(false);
      comp2.setCanFocus(false);

      focusManager.register(comp1);
      focusManager.register(comp2);

      focusManager.focusNext();

      expect(focusManager.getCurrentFocus()).toBeNull();
    });
  });

  describe('focusPrevious edge cases', () => {
    it('should do nothing with empty list', () => {
      focusManager.focusPrevious();
      expect(focusManager.getCurrentFocus()).toBeNull();
    });

    it('should handle all components being unfocusable', () => {
      const comp1 = new MockFocusableComponent(0);
      const comp2 = new MockFocusableComponent(1);
      comp1.setCanFocus(false);
      comp2.setCanFocus(false);

      focusManager.register(comp1);
      focusManager.register(comp2);

      focusManager.focusPrevious();

      expect(focusManager.getCurrentFocus()).toBeNull();
    });
  });

  describe('focusLast edge cases', () => {
    it('should do nothing with empty list', () => {
      focusManager.focusLast();
      expect(focusManager.getCurrentFocus()).toBeNull();
    });
  });
});

// Mock container component for registerContainer tests
class MockContainerComponent extends UIComponent {
  public children: UIComponent[] = [];

  measure(): MeasuredSize {
    return { width: 200, height: 100 };
  }

  protected render(): void {}
}

// Mock focusable container component
class MockFocusableContainerComponent extends UIComponent implements Focusable {
  public children: UIComponent[] = [];
  private _focused = false;

  constructor(tabIdx: number) {
    super();
    this.tabIndex = tabIdx;
  }

  measure(): MeasuredSize {
    return { width: 200, height: 100 };
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
