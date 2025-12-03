// Mock window for Node.js environment
if (typeof window === 'undefined') {
  (global as any).window = {
    devicePixelRatio: 1,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
}

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

  const mockTexture = class {
    source: any;
    frame: any;
    constructor(args?: any) {
      this.source = args?.source;
      this.frame = args?.frame || new mockRectangle();
    }
  };

  return {
    Point: mockPoint,
    ObservablePoint: mockObservablePoint,
    Rectangle: mockRectangle,
    Texture: Object.assign(mockTexture, {
      EMPTY: {} as any,
    }),
    BitmapText: class {
      text: string | number | any;
      x: number = 0;
      y: number = 0;
      anchor: any;
      scale: any;
      pivot: any;
      rotation: number = 0;
      alpha: number = 1;
      visible: boolean = true;
      constructor(args: any) {
        this.text = args?.text || '';
        this.anchor = new mockObservablePoint(0, 0);
        this.scale = new mockObservablePoint(1, 1);
        this.pivot = new mockObservablePoint(0, 0);
      }
    },
    Sprite: class {
      texture: any;
      x: number = 0;
      y: number = 0;
      anchor: any;
      scale: any;
      pivot: any;
      position: any;
      rotation: number = 0;
      alpha: number = 1;
      visible: boolean = true;
      tint: number = 0xffffff;
      eventMode: string = 'auto';
      constructor(args: any) {
        this.texture = args?.texture;
        this.anchor = new mockObservablePoint(0, 0);
        this.scale = new mockObservablePoint(1, 1);
        this.pivot = new mockObservablePoint(0, 0);
        this.position = new mockObservablePoint(0, 0);
      }
    },
    Text: class {
      text: string | number | any;
      x: number = 0;
      y: number = 0;
      anchor: any;
      scale: any;
      pivot: any;
      rotation: number = 0;
      alpha: number = 1;
      visible: boolean = true;
      tint: number = 0xffffff;
      eventMode: string = 'auto';
      constructor(args: any) {
        this.text = args?.text || '';
        this.anchor = new mockObservablePoint(0, 0);
        this.scale = new mockObservablePoint(1, 1);
        this.pivot = new mockObservablePoint(0, 0);
      }
    },
    Graphics: class {
      x: number = 0;
      y: number = 0;
      rotation: number = 0;
      alpha: number = 1;
      visible: boolean = true;
      rect() { return this; }
      circle() { return this; }
      fill() { return this; }
      stroke() { return this; }
      clear() { return this; }
    },
    Container: class {
      x: number = 0;
      y: number = 0;
      position: any;
      rotation: number = 0;
      alpha: number = 1;
      visible: boolean = true;
      eventMode: string = 'auto';
      children: any[] = [];
      constructor() {
        this.position = new mockObservablePoint(0, 0);
      }
      addChild(child: any) {
        this.children.push(child);
        return child;
      }
    },
    Ticker: class {
      static shared: any = {
        autoStart: false,
        start: jest.fn(),
        stop: jest.fn(),
        add: jest.fn(),
      };
      autoStart: boolean = false;
      start() {}
      stop() {}
      add(callback: any) {}
    },
    Renderer: class {
      render() {}
      canvas: HTMLCanvasElement;
      constructor() {
        this.canvas = {
          width: 1280,
          height: 720
        } as HTMLCanvasElement;
      }
    },
  };
});

