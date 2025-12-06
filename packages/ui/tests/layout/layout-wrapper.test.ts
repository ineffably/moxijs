import {
  LayoutWrapper,
  wrapForLayout,
  wrapText,
  wrapSprite,
} from '../../src/layout/layout-wrapper';

// Mock PIXI.js
const mockContainer = {
  getBounds: jest.fn().mockReturnValue({ width: 100, height: 50 }),
  position: { set: jest.fn() },
};

const mockText = {
  width: 80,
  height: 20,
  getBounds: jest.fn().mockReturnValue({ width: 80, height: 20 }),
  position: { set: jest.fn() },
};

const mockSprite = {
  width: 64,
  height: 64,
  getBounds: jest.fn().mockReturnValue({ width: 64, height: 64 }),
  position: { set: jest.fn() },
};

jest.mock('pixi.js', () => ({
  Container: jest.fn().mockImplementation(() => mockContainer),
  Text: jest.fn().mockImplementation(() => mockText),
  Sprite: jest.fn().mockImplementation(() => mockSprite),
}));

describe('LayoutWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create wrapper with display object', () => {
      const wrapper = new LayoutWrapper({
        displayObject: mockContainer as any,
      });

      expect(wrapper.displayObject).toBe(mockContainer);
      expect(wrapper.id).toMatch(/^wrapper-\d+$/);
    });

    it('should create wrapper with custom id', () => {
      const wrapper = new LayoutWrapper({
        displayObject: mockContainer as any,
        id: 'my-wrapper',
      });

      expect(wrapper.id).toBe('my-wrapper');
    });

    it('should create wrapper with style', () => {
      const wrapper = new LayoutWrapper({
        displayObject: mockContainer as any,
        style: {
          width: 200,
          height: 100,
          flexGrow: 1,
        },
      });

      const style = wrapper.getStyle();
      expect(style.width).toBe(200);
      expect(style.height).toBe(100);
      expect(style.flexGrow).toBe(1);
    });

    it('should create wrapper with custom measure function', () => {
      const customMeasure = jest.fn().mockReturnValue({ width: 150, height: 75 });
      const wrapper = new LayoutWrapper({
        displayObject: mockContainer as any,
        measureFn: customMeasure,
      });

      const size = wrapper.measureContent();

      expect(customMeasure).toHaveBeenCalled();
      expect(size.width).toBe(150);
      expect(size.height).toBe(75);
    });
  });

  describe('layoutNode', () => {
    it('should return layout node', () => {
      const wrapper = new LayoutWrapper({
        displayObject: mockContainer as any,
        id: 'test-node',
      });

      expect(wrapper.layoutNode).toBeDefined();
      expect(wrapper.layoutNode.id).toBe('test-node');
    });

    it('should have measure function set on layout node', () => {
      const wrapper = new LayoutWrapper({
        displayObject: mockContainer as any,
      });

      expect(wrapper.layoutNode.measureFn).not.toBeNull();
    });
  });

  describe('measureContent', () => {
    it('should use display object bounds by default', () => {
      const wrapper = new LayoutWrapper({
        displayObject: mockContainer as any,
      });

      const size = wrapper.measureContent();

      expect(mockContainer.getBounds).toHaveBeenCalled();
      expect(size.width).toBe(100);
      expect(size.height).toBe(50);
    });

    it('should use custom measure function when provided', () => {
      const customMeasure = jest.fn().mockReturnValue({ width: 200, height: 100 });
      const wrapper = new LayoutWrapper({
        displayObject: mockContainer as any,
        measureFn: customMeasure,
      });

      const size = wrapper.measureContent();

      expect(customMeasure).toHaveBeenCalled();
      expect(mockContainer.getBounds).not.toHaveBeenCalled();
      expect(size.width).toBe(200);
      expect(size.height).toBe(100);
    });
  });

  describe('applyLayout', () => {
    it('should set display object position', () => {
      const wrapper = new LayoutWrapper({
        displayObject: mockContainer as any,
      });

      wrapper.applyLayout({
        x: 100,
        y: 200,
        width: 300,
        height: 150,
        contentX: 0,
        contentY: 0,
        contentWidth: 300,
        contentHeight: 150,
      });

      expect(mockContainer.position.set).toHaveBeenCalledWith(100, 200);
    });
  });

  describe('syncLayoutStyle', () => {
    it('should be a no-op', () => {
      const wrapper = new LayoutWrapper({
        displayObject: mockContainer as any,
      });

      expect(() => wrapper.syncLayoutStyle()).not.toThrow();
    });
  });

  describe('setStyle', () => {
    it('should set width and height', () => {
      const wrapper = new LayoutWrapper({
        displayObject: mockContainer as any,
      });

      wrapper.setStyle({ width: 300, height: 200 });

      const style = wrapper.getStyle();
      expect(style.width).toBe(300);
      expect(style.height).toBe(200);
    });

    it('should set min/max constraints', () => {
      const wrapper = new LayoutWrapper({
        displayObject: mockContainer as any,
      });

      wrapper.setStyle({
        minWidth: 100,
        maxWidth: 500,
        minHeight: 50,
        maxHeight: 300,
      });

      const style = wrapper.getStyle();
      expect(style.minWidth).toBe(100);
      expect(style.maxWidth).toBe(500);
      expect(style.minHeight).toBe(50);
      expect(style.maxHeight).toBe(300);
    });

    it('should set margin as number', () => {
      const wrapper = new LayoutWrapper({
        displayObject: mockContainer as any,
      });

      wrapper.setStyle({ margin: 10 });

      const style = wrapper.getStyle();
      expect(style.margin).toBe(10);
    });

    it('should set margin as object', () => {
      const wrapper = new LayoutWrapper({
        displayObject: mockContainer as any,
      });

      wrapper.setStyle({
        margin: { top: 10, right: 20, bottom: 10, left: 20 },
      });

      const style = wrapper.getStyle();
      expect(style.margin).toEqual({ top: 10, right: 20, bottom: 10, left: 20 });
    });

    it('should set flex item properties', () => {
      const wrapper = new LayoutWrapper({
        displayObject: mockContainer as any,
      });

      wrapper.setStyle({
        flexGrow: 2,
        flexShrink: 0,
        flexBasis: 100,
        alignSelf: 'center',
      });

      const style = wrapper.getStyle();
      expect(style.flexGrow).toBe(2);
      expect(style.flexShrink).toBe(0);
      expect(style.flexBasis).toBe(100);
      expect(style.alignSelf).toBe('center');
    });
  });

  describe('dispose', () => {
    it('should clear layout node references', () => {
      const wrapper = new LayoutWrapper({
        displayObject: mockContainer as any,
      });

      wrapper.dispose();

      expect(wrapper.layoutNode.measureFn).toBeNull();
      expect(wrapper.layoutNode.parent).toBeNull();
      expect(wrapper.layoutNode.children).toEqual([]);
    });
  });
});

describe('wrapForLayout', () => {
  it('should create wrapper with factory function', () => {
    const wrapper = wrapForLayout(mockContainer as any);

    expect(wrapper).toBeInstanceOf(LayoutWrapper);
    expect(wrapper.displayObject).toBe(mockContainer);
  });

  it('should create wrapper with style', () => {
    const wrapper = wrapForLayout(mockContainer as any, { width: 200 });

    expect(wrapper.getStyle().width).toBe(200);
  });

  it('should create wrapper with measure function', () => {
    const measureFn = () => ({ width: 50, height: 25 });
    const wrapper = wrapForLayout(mockContainer as any, undefined, measureFn);

    expect(wrapper.measureContent()).toEqual({ width: 50, height: 25 });
  });
});

describe('wrapText', () => {
  it('should create wrapper for text', () => {
    const wrapper = wrapText(mockText as any);

    expect(wrapper).toBeInstanceOf(LayoutWrapper);
    expect(wrapper.displayObject).toBe(mockText);
  });

  it('should use text dimensions for measurement', () => {
    const wrapper = wrapText(mockText as any);

    const size = wrapper.measureContent();

    expect(size.width).toBe(80);
    expect(size.height).toBe(20);
  });

  it('should apply style', () => {
    const wrapper = wrapText(mockText as any, { flexGrow: 1 });

    expect(wrapper.getStyle().flexGrow).toBe(1);
  });
});

describe('wrapSprite', () => {
  it('should create wrapper for sprite', () => {
    const wrapper = wrapSprite(mockSprite as any);

    expect(wrapper).toBeInstanceOf(LayoutWrapper);
    expect(wrapper.displayObject).toBe(mockSprite);
  });

  it('should use sprite dimensions for measurement', () => {
    const wrapper = wrapSprite(mockSprite as any);

    const size = wrapper.measureContent();

    expect(size.width).toBe(64);
    expect(size.height).toBe(64);
  });

  it('should apply style', () => {
    const wrapper = wrapSprite(mockSprite as any, { margin: 5 });

    expect(wrapper.getStyle().margin).toBe(5);
  });
});
