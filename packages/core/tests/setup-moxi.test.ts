/**
 * Tests for setupMoxi function
 */

// Mock window and document before imports
(global as any).window = {
  devicePixelRatio: 1
};
(global as any).document = {
  createElement: jest.fn(() => ({}))
};

import { setupMoxi } from '../src/library/setup';
import { RenderManager } from '../src/main/render-manager';

// Mock RenderManager
jest.mock('../src/main/render-manager', () => ({
  RenderManager: {
    create: jest.fn()
  }
}));

// Mock AssetLoader
jest.mock('../src/main/asset-loader', () => ({
  AssetLoader: jest.fn().mockImplementation(() => ({
    PIXIAssets: {},
    loadAssets: jest.fn(),
    on: jest.fn()
  }))
}));

describe('setupMoxi', () => {
  let mockRenderer: any;
  let mockHostElement: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock renderer with background property
    mockRenderer = {
      width: 1280,
      height: 720,
      canvas: {
        style: {},
        addEventListener: jest.fn()
      } as any,
      background: {
        color: 0x000000
      }
    };

    // Setup RenderManager mock to return our mock renderer
    (RenderManager.create as jest.Mock).mockResolvedValue({
      renderer: mockRenderer
    });

    // Create mock host element
    mockHostElement = {};
  });

  describe('backgroundColor option', () => {
    it('should set background color when provided', async () => {
      const testColor = 0x1a1a2e;

      await setupMoxi({
        hostElement: mockHostElement,
        backgroundColor: testColor
      });

      expect(mockRenderer.background.color).toBe(testColor);
    });

    it('should not modify background color when not provided', async () => {
      const originalColor = mockRenderer.background.color;

      await setupMoxi({
        hostElement: mockHostElement
      });

      expect(mockRenderer.background.color).toBe(originalColor);
    });

    it('should accept 0x000000 (black) as valid backgroundColor', async () => {
      await setupMoxi({
        hostElement: mockHostElement,
        backgroundColor: 0x000000
      });

      expect(mockRenderer.background.color).toBe(0x000000);
    });
  });

  describe('basic setup', () => {
    it('should return scene, engine, camera, and other expected properties', async () => {
      const result = await setupMoxi({
        hostElement: mockHostElement
      });

      expect(result).toHaveProperty('scene');
      expect(result).toHaveProperty('engine');
      expect(result).toHaveProperty('camera');
      expect(result).toHaveProperty('renderer');
      expect(result).toHaveProperty('loadAssets');
      expect(result).toHaveProperty('PIXIAssets');
    });

    it('should call RenderManager.create with host element', async () => {
      await setupMoxi({
        hostElement: mockHostElement
      });

      expect(RenderManager.create).toHaveBeenCalledWith(
        mockHostElement,
        expect.any(Object)
      );
    });
  });

  describe('suppressContextMenu option', () => {
    it('should add contextmenu listener when suppressContextMenu is true', async () => {
      await setupMoxi({
        hostElement: mockHostElement,
        suppressContextMenu: true
      });

      expect(mockRenderer.canvas.addEventListener).toHaveBeenCalledWith(
        'contextmenu',
        expect.any(Function)
      );
    });

    it('should not add contextmenu listener when suppressContextMenu is false', async () => {
      await setupMoxi({
        hostElement: mockHostElement,
        suppressContextMenu: false
      });

      expect(mockRenderer.canvas.addEventListener).not.toHaveBeenCalledWith(
        'contextmenu',
        expect.any(Function)
      );
    });

    it('should not add contextmenu listener when suppressContextMenu is not provided', async () => {
      await setupMoxi({
        hostElement: mockHostElement
      });

      expect(mockRenderer.canvas.addEventListener).not.toHaveBeenCalledWith(
        'contextmenu',
        expect.any(Function)
      );
    });

    it('should prevent default on contextmenu event', async () => {
      await setupMoxi({
        hostElement: mockHostElement,
        suppressContextMenu: true
      });

      // Get the listener that was registered
      const addEventListenerCall = (mockRenderer.canvas.addEventListener as jest.Mock).mock.calls
        .find(call => call[0] === 'contextmenu');

      expect(addEventListenerCall).toBeDefined();

      const listener = addEventListenerCall[1];
      const mockEvent = { preventDefault: jest.fn() };

      listener(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });
});
