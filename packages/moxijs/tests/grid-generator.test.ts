import { createTileGrid, GridOptions, CellPosition } from '../src/library/grid-generator';
import PIXI from 'pixi.js';

describe('createTileGrid', () => {
  const createMockTextures = (count: number): PIXI.Texture[] => {
    return Array.from({ length: count }, () => ({
      width: 16,
      height: 16,
    } as PIXI.Texture));
  };

  describe('basic functionality', () => {
    it('should create a grid container', () => {
      const textures = createMockTextures(4);
      const options: GridOptions = {
        width: 5,
        height: 5,
        cellWidth: 16,
        cellHeight: 16
      };
      
      const grid = createTileGrid(options, textures);
      
      expect(grid).toBeInstanceOf(PIXI.Container);
      expect(grid.children.length).toBe(25); // 5x5 grid
    });

    it('should create correct number of cells', () => {
      const textures = createMockTextures(2);
      const options: GridOptions = {
        width: 3,
        height: 4,
        cellWidth: 16,
        cellHeight: 16
      };
      
      const grid = createTileGrid(options, textures);
      
      expect(grid.children.length).toBe(12); // 3x4 = 12 cells
    });

    it('should position cells correctly', () => {
      const textures = createMockTextures(1);
      const options: GridOptions = {
        width: 2,
        height: 2,
        cellWidth: 32,
        cellHeight: 32
      };
      
      const grid = createTileGrid(options, textures);
      
      // First cell at (0, 0)
      expect(grid.children[0].position.x).toBe(0);
      expect(grid.children[0].position.y).toBe(0);
      
      // Second cell at (32, 0)
      expect(grid.children[1].position.x).toBe(32);
      expect(grid.children[1].position.y).toBe(0);
      
      // Third cell at (0, 32) - start of second row
      expect(grid.children[2].position.x).toBe(0);
      expect(grid.children[2].position.y).toBe(32);
    });
  });

  describe('centered option', () => {
    it('should center grid when centered is true', () => {
      const textures = createMockTextures(1);
      const options: GridOptions = {
        width: 2,
        height: 2,
        cellWidth: 32,
        cellHeight: 32,
        centered: true
      };
      
      const grid = createTileGrid(options, textures);
      
      // Grid should be offset to center it
      // Total width: 2 * 32 = 64, so offset should be -32
      expect(grid.position.x).toBe(-32);
      expect(grid.position.y).toBe(-32);
    });

    it('should not center grid when centered is false', () => {
      const textures = createMockTextures(1);
      const options: GridOptions = {
        width: 2,
        height: 2,
        cellWidth: 32,
        cellHeight: 32,
        centered: false
      };
      
      const grid = createTileGrid(options, textures);
      
      expect(grid.x).toBe(0);
      expect(grid.y).toBe(0);
    });
  });

  describe('selector function', () => {
    it('should use custom selector function', () => {
      const textures = createMockTextures(3);
      const options: GridOptions = {
        width: 2,
        height: 2,
        cellWidth: 16,
        cellHeight: 16
      };
      
      const selectedIndices: number[] = [];
      const selector = (position: CellPosition): number => {
        selectedIndices.push(position.index);
        return position.index % textures.length; // Use index modulo texture count
      };
      
      const grid = createTileGrid(options, textures, selector);
      
      expect(selectedIndices).toEqual([0, 1, 2, 3]); // All 4 cells
      expect(grid.children.length).toBe(4);
    });

    it('should use random selector by default', () => {
      const textures = createMockTextures(3);
      const options: GridOptions = {
        width: 10,
        height: 10,
        cellWidth: 16,
        cellHeight: 16
      };
      
      const grid = createTileGrid(options, textures);
      
      // All cells should have textures (random selection)
      expect(grid.children.length).toBe(100);
      grid.children.forEach(child => {
        expect(child).toBeDefined();
      });
    });
  });

  describe('CellPosition', () => {
    it('should provide correct position information', () => {
      const textures = createMockTextures(1);
      const options: GridOptions = {
        width: 3,
        height: 2,
        cellWidth: 20,
        cellHeight: 30
      };
      
      const positions: CellPosition[] = [];
      const selector = (position: CellPosition): number => {
        positions.push({ ...position });
        return 0;
      };
      
      createTileGrid(options, textures, selector);
      
      // Check first cell
      expect(positions[0].x).toBe(0);
      expect(positions[0].y).toBe(0);
      expect(positions[0].pixelX).toBe(0);
      expect(positions[0].pixelY).toBe(0);
      expect(positions[0].index).toBe(0);
      expect(positions[0].total).toBe(6); // 3x2
      
      // Check second cell (x=1, y=0)
      expect(positions[1].x).toBe(1);
      expect(positions[1].y).toBe(0);
      expect(positions[1].pixelX).toBe(20);
      expect(positions[1].pixelY).toBe(0);
      expect(positions[1].index).toBe(1);
      
      // Check fourth cell (x=0, y=1) - start of second row
      expect(positions[3].x).toBe(0);
      expect(positions[3].y).toBe(1);
      expect(positions[3].pixelX).toBe(0);
      expect(positions[3].pixelY).toBe(30);
      expect(positions[3].index).toBe(3);
    });
  });
});

