import { Engine } from '../src/main/engine';
import { Scene } from '../src/main/scene';
import PIXI from 'pixi.js';

describe('Engine', () => {
  const createMockRenderer = (): PIXI.Renderer<HTMLCanvasElement> => {
    return {
      render: jest.fn(),
      canvas: {
        width: 1280,
        height: 720
      } as HTMLCanvasElement
    } as any;
  };

  const createMockTicker = (): PIXI.Ticker => {
    const ticker = {
      autoStart: false,
      start: jest.fn(),
      stop: jest.fn(),
      add: jest.fn(),
    } as any;
    
    // Mock Ticker.shared
    (PIXI.Ticker as any).shared = ticker;
    return ticker;
  };

  describe('constructor', () => {
    it('should create an Engine with optional scene', () => {
      const renderer = createMockRenderer();
      const scene = new Scene(renderer);
      const engine = new Engine(scene);
      
      expect(engine.root).toBe(scene);
      expect(engine.ticker).toBeDefined();
    });

    it('should create an Engine without scene', () => {
      const engine = new Engine();
      
      expect(engine.root).toBeNull();
      expect(engine.ticker).toBeDefined();
    });

    it('should initialize logger with no-op function', () => {
      const engine = new Engine();
      
      expect(typeof engine.logger).toBe('function');
      expect(() => engine.logger('test')).not.toThrow();
    });

    it('should set default logger frequency', () => {
      const engine = new Engine();
      
      expect(engine.loggerFrequencyMs).toBe(500);
    });
  });

  describe('start', () => {
    it('should start the ticker', () => {
      const ticker = createMockTicker();
      const engine = new Engine();
      engine.ticker = ticker;
      
      const result = engine.start();
      
      expect(ticker.start).toHaveBeenCalled();
      expect(result).toBe(engine);
    });
  });

  describe('stop', () => {
    it('should stop the ticker', () => {
      const ticker = createMockTicker();
      const engine = new Engine();
      engine.ticker = ticker;
      
      const result = engine.stop();
      
      expect(ticker.stop).toHaveBeenCalled();
      expect(result).toBe(engine);
    });
  });

  describe('loadStage', () => {
    it('should set a new scene', () => {
      const renderer = createMockRenderer();
      const scene1 = new Scene(renderer);
      const scene2 = new Scene(renderer);
      const engine = new Engine(scene1);
      
      const result = engine.loadStage(scene2);
      
      expect(engine.root).toBe(scene2);
      expect(result).toBe(engine);
    });
  });

  describe('addPhysicsWorld', () => {
    it('should add physics world to engine', () => {
      const engine = new Engine();
      const mockPhysicsWorld = {
        step: jest.fn()
      } as any;
      
      const result = engine.addPhysicsWorld(mockPhysicsWorld);
      
      expect(engine.physicsWorld).toBe(mockPhysicsWorld);
      expect(result).toBe(engine);
    });
  });

  describe('gameLoop', () => {
    it('should update and draw scene when root exists', () => {
      const renderer = createMockRenderer();
      const scene = new Scene(renderer);
      const engine = new Engine(scene);
      
      const updateSpy = jest.spyOn(scene, 'update');
      const drawSpy = jest.spyOn(scene, 'draw');
      
      const mockTicker = {
        deltaTime: 0.016,
        deltaMS: 16
      } as any;
      
      engine.gameLoop(mockTicker);
      
      expect(updateSpy).toHaveBeenCalledWith(0.016);
      expect(drawSpy).toHaveBeenCalledWith(0.016);
    });

    it('should step physics world if present', () => {
      const renderer = createMockRenderer();
      const scene = new Scene(renderer);
      const engine = new Engine(scene);
      
      const mockPhysicsWorld = {
        step: jest.fn()
      } as any;
      engine.addPhysicsWorld(mockPhysicsWorld);
      
      const mockTicker = {
        deltaTime: 0.016,
        deltaMS: 16
      } as any;
      
      engine.gameLoop(mockTicker);
      
      expect(mockPhysicsWorld.step).toHaveBeenCalledWith(0.016); // deltaMS / 1000
    });

    it('should not update if no root scene', () => {
      const engine = new Engine();
      
      const mockTicker = {
        deltaTime: 0.016,
        deltaMS: 16
      } as any;
      
      // Should not throw
      expect(() => engine.gameLoop(mockTicker)).not.toThrow();
    });
  });
});

