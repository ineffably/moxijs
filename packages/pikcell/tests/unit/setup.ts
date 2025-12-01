// Mock PIXI.js for unit tests
jest.mock('pixi.js', () => {
  const mockPoint = class {
    x: number;
    y: number;
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
    set(x: number, y?: number) {
      this.x = x;
      this.y = y ?? x;
    }
  };

  const mockObservablePoint = class extends mockPoint {
    set(x: number, y?: number) {
      this.x = x;
      this.y = y ?? x;
    }
  };

  const mockRectangle = class {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
  };

  return {
    Point: mockPoint,
    ObservablePoint: mockObservablePoint,
    Rectangle: mockRectangle,
    Texture: Object.assign(class {
      source: any;
      frame: any;
      constructor(args?: any) {
        this.source = args?.source;
        this.frame = args?.frame || new mockRectangle();
      }
    }, { EMPTY: {} as any }),
    Graphics: class {
      x = 0;
      y = 0;
      alpha = 1;
      visible = true;
      eventMode = 'auto';
      rect() { return this; }
      circle() { return this; }
      fill() { return this; }
      stroke() { return this; }
      clear() { return this; }
      destroy() {}
    },
    Container: class {
      x = 0;
      y = 0;
      position = new mockObservablePoint(0, 0);
      alpha = 1;
      visible = true;
      eventMode = 'auto';
      children: any[] = [];
      addChild(child: any) { this.children.push(child); return child; }
      removeChild(child: any) {
        const idx = this.children.indexOf(child);
        if (idx >= 0) this.children.splice(idx, 1);
        return child;
      }
      destroy() {}
      emit() {}
      on() { return this; }
      off() { return this; }
    },
    BitmapText: class {
      text = '';
      x = 0;
      y = 0;
      anchor = new mockObservablePoint(0, 0);
      scale = new mockObservablePoint(1, 1);
      constructor(args: any) { this.text = args?.text || ''; }
    },
    Sprite: class {
      texture: any;
      x = 0;
      y = 0;
      anchor = new mockObservablePoint(0, 0);
      scale = new mockObservablePoint(1, 1);
      position = new mockObservablePoint(0, 0);
      tint = 0xffffff;
      constructor(args: any) { this.texture = args?.texture; }
    },
    Renderer: class {
      width = 1280;
      height = 720;
      canvas = { width: 1280, height: 720 } as HTMLCanvasElement;
      render() {}
    },
    FederatedPointerEvent: class {},
  };
});

// Mock moxi/core
jest.mock('moxi', () => ({
  GRID: { unit: 4, fontScale: 0.5 },
  px: (units: number) => units * 4,
  asBitmapText: jest.fn(() => ({ width: 100, height: 20, position: { set: jest.fn() } })),
}));
