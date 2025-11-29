import * as utils from '../src/library/utils';

describe('utils', () => {
  describe('rad2deg', () => {
    it('should convert radians to degrees', () => {
      expect(utils.rad2deg(0)).toBe(0);
      expect(utils.rad2deg(Math.PI)).toBe(180);
      expect(utils.rad2deg(Math.PI / 2)).toBe(90);
      expect(utils.rad2deg(Math.PI * 2)).toBe(360);
    });
  });

  describe('deg2rad', () => {
    it('should convert degrees to radians', () => {
      expect(utils.deg2rad(0)).toBe(0);
      expect(utils.deg2rad(180)).toBeCloseTo(Math.PI);
      expect(utils.deg2rad(90)).toBeCloseTo(Math.PI / 2);
      expect(utils.deg2rad(360)).toBeCloseTo(Math.PI * 2);
    });
  });

  describe('createPoint', () => {
    it('should create a point with default values', () => {
      const point = utils.createPoint();
      expect(point.x).toBe(0);
      expect(point.y).toBe(0);
    });

    it('should create a point with specified values', () => {
      const point = utils.createPoint(10, 20);
      expect(point.x).toBe(10);
      expect(point.y).toBe(20);
    });
  });

  describe('getRandomInt', () => {
    it('should generate random integer within range', () => {
      const result = utils.getRandomInt(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    });

    it('should handle same min and max', () => {
      expect(utils.getRandomInt(5, 5)).toBe(5);
    });
  });

  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(utils.lerp(0, 10, 0)).toBe(0);
      expect(utils.lerp(0, 10, 1)).toBe(10);
      expect(utils.lerp(0, 10, 0.5)).toBe(5);
    });
  });
});

