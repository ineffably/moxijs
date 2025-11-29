import { EdgeInsets } from '../src/ui/core/edge-insets';

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
});

