import { createDefaultBoxModel, BoxModel, SizeConstraint } from '../../src/base/box-model';
import { EdgeInsets } from '../../src/base/edge-insets';

describe('BoxModel', () => {
  describe('createDefaultBoxModel', () => {
    it('should create a box model with default values', () => {
      const boxModel = createDefaultBoxModel();

      expect(boxModel.width).toBe('auto');
      expect(boxModel.height).toBe('auto');
      expect(boxModel.padding.top).toBe(0);
      expect(boxModel.padding.right).toBe(0);
      expect(boxModel.padding.bottom).toBe(0);
      expect(boxModel.padding.left).toBe(0);
      expect(boxModel.margin.top).toBe(0);
      expect(boxModel.margin.right).toBe(0);
      expect(boxModel.margin.bottom).toBe(0);
      expect(boxModel.margin.left).toBe(0);
    });

    it('should allow width override', () => {
      const boxModel = createDefaultBoxModel({ width: 100 });

      expect(boxModel.width).toBe(100);
      expect(boxModel.height).toBe('auto');
    });

    it('should allow height override', () => {
      const boxModel = createDefaultBoxModel({ height: 200 });

      expect(boxModel.width).toBe('auto');
      expect(boxModel.height).toBe(200);
    });

    it('should allow fill size constraint', () => {
      const boxModel = createDefaultBoxModel({ width: 'fill', height: 'fill' });

      expect(boxModel.width).toBe('fill');
      expect(boxModel.height).toBe('fill');
    });

    it('should allow padding override', () => {
      const padding = EdgeInsets.all(10);
      const boxModel = createDefaultBoxModel({ padding });

      expect(boxModel.padding.top).toBe(10);
      expect(boxModel.padding.right).toBe(10);
      expect(boxModel.padding.bottom).toBe(10);
      expect(boxModel.padding.left).toBe(10);
    });

    it('should allow margin override', () => {
      const margin = EdgeInsets.symmetric(5, 15);
      const boxModel = createDefaultBoxModel({ margin });

      expect(boxModel.margin.top).toBe(5);
      expect(boxModel.margin.bottom).toBe(5);
      expect(boxModel.margin.left).toBe(15);
      expect(boxModel.margin.right).toBe(15);
    });

    it('should allow min/max constraints', () => {
      const boxModel = createDefaultBoxModel({
        minWidth: 50,
        minHeight: 30,
        maxWidth: 500,
        maxHeight: 300
      });

      expect(boxModel.minWidth).toBe(50);
      expect(boxModel.minHeight).toBe(30);
      expect(boxModel.maxWidth).toBe(500);
      expect(boxModel.maxHeight).toBe(300);
    });

    it('should allow border override', () => {
      const border = EdgeInsets.all(2);
      const boxModel = createDefaultBoxModel({ border });

      expect(boxModel.border?.top).toBe(2);
      expect(boxModel.border?.right).toBe(2);
      expect(boxModel.border?.bottom).toBe(2);
      expect(boxModel.border?.left).toBe(2);
    });

    it('should allow multiple overrides at once', () => {
      const boxModel = createDefaultBoxModel({
        width: 150,
        height: 100,
        padding: EdgeInsets.all(8),
        margin: EdgeInsets.symmetric(4, 12),
        minWidth: 100,
        maxWidth: 300
      });

      expect(boxModel.width).toBe(150);
      expect(boxModel.height).toBe(100);
      expect(boxModel.padding.horizontal).toBe(16);
      expect(boxModel.margin.vertical).toBe(8);
      expect(boxModel.minWidth).toBe(100);
      expect(boxModel.maxWidth).toBe(300);
    });
  });

  describe('SizeConstraint type', () => {
    it('should accept number values', () => {
      const size: SizeConstraint = 100;
      expect(size).toBe(100);
    });

    it('should accept auto value', () => {
      const size: SizeConstraint = 'auto';
      expect(size).toBe('auto');
    });

    it('should accept fill value', () => {
      const size: SizeConstraint = 'fill';
      expect(size).toBe('fill');
    });
  });
});
