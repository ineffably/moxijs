import { EdgeInsets } from '../../src/base/edge-insets';

describe('EdgeInsets', () => {
  describe('all', () => {
    it('should create EdgeInsets with all sides equal', () => {
      const insets = EdgeInsets.all(10);
      
      expect(insets.top).toBe(10);
      expect(insets.right).toBe(10);
      expect(insets.bottom).toBe(10);
      expect(insets.left).toBe(10);
    });

    it('should handle zero', () => {
      const insets = EdgeInsets.all(0);
      
      expect(insets.top).toBe(0);
      expect(insets.right).toBe(0);
      expect(insets.bottom).toBe(0);
      expect(insets.left).toBe(0);
    });
  });

  describe('symmetric', () => {
    it('should create EdgeInsets with vertical and horizontal values', () => {
      const insets = EdgeInsets.symmetric(10, 20);
      
      expect(insets.top).toBe(10);
      expect(insets.bottom).toBe(10);
      expect(insets.left).toBe(20);
      expect(insets.right).toBe(20);
    });

    it('should handle zero values', () => {
      const insets = EdgeInsets.symmetric(0, 0);
      
      expect(insets.top).toBe(0);
      expect(insets.bottom).toBe(0);
      expect(insets.left).toBe(0);
      expect(insets.right).toBe(0);
    });
  });

  describe('only', () => {
    it('should create EdgeInsets with specific values', () => {
      const insets = EdgeInsets.only({
        top: 10,
        right: 20,
        bottom: 30,
        left: 40
      });
      
      expect(insets.top).toBe(10);
      expect(insets.right).toBe(20);
      expect(insets.bottom).toBe(30);
      expect(insets.left).toBe(40);
    });

    it('should default unspecified values to 0', () => {
      const insets = EdgeInsets.only({
        top: 10
      });
      
      expect(insets.top).toBe(10);
      expect(insets.right).toBe(0);
      expect(insets.bottom).toBe(0);
      expect(insets.left).toBe(0);
    });
  });

  describe('zero', () => {
    it('should create EdgeInsets with all zeros', () => {
      const insets = EdgeInsets.zero();
      
      expect(insets.top).toBe(0);
      expect(insets.right).toBe(0);
      expect(insets.bottom).toBe(0);
      expect(insets.left).toBe(0);
    });
  });

  describe('horizontal', () => {
    it('should return sum of left and right', () => {
      const insets = EdgeInsets.only({ left: 10, right: 20 });
      
      expect(insets.horizontal).toBe(30);
    });

    it('should return zero when both are zero', () => {
      const insets = EdgeInsets.zero();
      
      expect(insets.horizontal).toBe(0);
    });
  });

  describe('vertical', () => {
    it('should return sum of top and bottom', () => {
      const insets = EdgeInsets.only({ top: 15, bottom: 25 });
      
      expect(insets.vertical).toBe(40);
    });

    it('should return zero when both are zero', () => {
      const insets = EdgeInsets.zero();
      
      expect(insets.vertical).toBe(0);
    });
  });

  describe('clone', () => {
    it('should create a copy of EdgeInsets', () => {
      const original = EdgeInsets.only({ top: 10, right: 20, bottom: 30, left: 40 });
      const cloned = original.clone();

      expect(cloned.top).toBe(original.top);
      expect(cloned.right).toBe(original.right);
      expect(cloned.bottom).toBe(original.bottom);
      expect(cloned.left).toBe(original.left);
      expect(cloned).not.toBe(original); // Different instances
    });

    it('should create independent copy', () => {
      const original = EdgeInsets.all(10);
      const cloned = original.clone();

      cloned.top = 20;

      expect(original.top).toBe(10);
      expect(cloned.top).toBe(20);
    });
  });

  describe('from', () => {
    it('should create EdgeInsets from a number', () => {
      const insets = EdgeInsets.from(10);

      expect(insets.top).toBe(10);
      expect(insets.right).toBe(10);
      expect(insets.bottom).toBe(10);
      expect(insets.left).toBe(10);
    });

    it('should clone an existing EdgeInsets', () => {
      const original = EdgeInsets.only({ top: 5, right: 10, bottom: 15, left: 20 });
      const cloned = EdgeInsets.from(original);

      expect(cloned.top).toBe(5);
      expect(cloned.right).toBe(10);
      expect(cloned.bottom).toBe(15);
      expect(cloned.left).toBe(20);
      expect(cloned).not.toBe(original);
    });

    it('should create EdgeInsets from an object', () => {
      const insets = EdgeInsets.from({ top: 5, left: 10 });

      expect(insets.top).toBe(5);
      expect(insets.right).toBe(0);
      expect(insets.bottom).toBe(0);
      expect(insets.left).toBe(10);
    });

    it('should return zero EdgeInsets for undefined', () => {
      const insets = EdgeInsets.from(undefined);

      expect(insets.top).toBe(0);
      expect(insets.right).toBe(0);
      expect(insets.bottom).toBe(0);
      expect(insets.left).toBe(0);
    });
  });

  describe('equals', () => {
    it('should return true for equal EdgeInsets', () => {
      const a = EdgeInsets.all(10);
      const b = EdgeInsets.all(10);

      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different EdgeInsets', () => {
      const a = EdgeInsets.all(10);
      const b = EdgeInsets.all(20);

      expect(a.equals(b)).toBe(false);
    });

    it('should compare all four edges', () => {
      const base = EdgeInsets.only({ top: 1, right: 2, bottom: 3, left: 4 });

      expect(base.equals(EdgeInsets.only({ top: 1, right: 2, bottom: 3, left: 4 }))).toBe(true);
      expect(base.equals(EdgeInsets.only({ top: 0, right: 2, bottom: 3, left: 4 }))).toBe(false);
      expect(base.equals(EdgeInsets.only({ top: 1, right: 0, bottom: 3, left: 4 }))).toBe(false);
      expect(base.equals(EdgeInsets.only({ top: 1, right: 2, bottom: 0, left: 4 }))).toBe(false);
      expect(base.equals(EdgeInsets.only({ top: 1, right: 2, bottom: 3, left: 0 }))).toBe(false);
    });
  });

  describe('isZero', () => {
    it('should return true for zero EdgeInsets', () => {
      const insets = EdgeInsets.zero();

      expect(insets.isZero()).toBe(true);
    });

    it('should return false for non-zero EdgeInsets', () => {
      expect(EdgeInsets.all(1).isZero()).toBe(false);
      expect(EdgeInsets.only({ top: 1 }).isZero()).toBe(false);
      expect(EdgeInsets.only({ right: 1 }).isZero()).toBe(false);
      expect(EdgeInsets.only({ bottom: 1 }).isZero()).toBe(false);
      expect(EdgeInsets.only({ left: 1 }).isZero()).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return "0" for zero EdgeInsets', () => {
      const insets = EdgeInsets.zero();

      expect(insets.toString()).toBe('0');
    });

    it('should return single value for uniform EdgeInsets', () => {
      const insets = EdgeInsets.all(10);

      expect(insets.toString()).toBe('10');
    });

    it('should return two values for symmetric EdgeInsets', () => {
      const insets = EdgeInsets.symmetric(10, 20);

      expect(insets.toString()).toBe('10 20');
    });

    it('should return four values for asymmetric EdgeInsets', () => {
      const insets = EdgeInsets.only({ top: 1, right: 2, bottom: 3, left: 4 });

      expect(insets.toString()).toBe('1 2 3 4');
    });
  });

  describe('constructor', () => {
    it('should create EdgeInsets with direct constructor', () => {
      const insets = new EdgeInsets(1, 2, 3, 4);

      expect(insets.top).toBe(1);
      expect(insets.right).toBe(2);
      expect(insets.bottom).toBe(3);
      expect(insets.left).toBe(4);
    });
  });
});

