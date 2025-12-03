import { LayoutEngine } from '../../src/services/layout-engine';
import { createDefaultBoxModel } from '../../src/base/box-model';
import { EdgeInsets } from '../../src/base/edge-insets';

describe('LayoutEngine', () => {
  let engine: LayoutEngine;

  beforeEach(() => {
    engine = new LayoutEngine();
  });

  describe('measure', () => {
    it('should return content size with auto dimensions', () => {
      const boxModel = createDefaultBoxModel();
      const contentSize = { width: 100, height: 50 };

      const measured = engine.measure(boxModel, contentSize);

      expect(measured.width).toBe(100);
      expect(measured.height).toBe(50);
    });

    it('should add padding to content size', () => {
      const boxModel = createDefaultBoxModel({
        padding: EdgeInsets.all(10)
      });
      const contentSize = { width: 100, height: 50 };

      const measured = engine.measure(boxModel, contentSize);

      expect(measured.width).toBe(120); // 100 + 10 + 10
      expect(measured.height).toBe(70); // 50 + 10 + 10
    });

    it('should add border to content size', () => {
      const boxModel = createDefaultBoxModel({
        border: EdgeInsets.all(2)
      });
      const contentSize = { width: 100, height: 50 };

      const measured = engine.measure(boxModel, contentSize);

      expect(measured.width).toBe(104); // 100 + 2 + 2
      expect(measured.height).toBe(54); // 50 + 2 + 2
    });

    it('should use fixed width when specified', () => {
      const boxModel = createDefaultBoxModel({ width: 200 });
      const contentSize = { width: 100, height: 50 };

      const measured = engine.measure(boxModel, contentSize);

      expect(measured.width).toBe(200);
      expect(measured.height).toBe(50);
    });

    it('should use fixed height when specified', () => {
      const boxModel = createDefaultBoxModel({ height: 100 });
      const contentSize = { width: 100, height: 50 };

      const measured = engine.measure(boxModel, contentSize);

      expect(measured.width).toBe(100);
      expect(measured.height).toBe(100);
    });

    it('should apply minWidth constraint', () => {
      const boxModel = createDefaultBoxModel({ minWidth: 150 });
      const contentSize = { width: 100, height: 50 };

      const measured = engine.measure(boxModel, contentSize);

      expect(measured.width).toBe(150);
    });

    it('should apply minHeight constraint', () => {
      const boxModel = createDefaultBoxModel({ minHeight: 80 });
      const contentSize = { width: 100, height: 50 };

      const measured = engine.measure(boxModel, contentSize);

      expect(measured.height).toBe(80);
    });

    it('should use content size for fill constraints during measure', () => {
      const boxModel = createDefaultBoxModel({
        width: 'fill',
        height: 'fill'
      });
      const contentSize = { width: 100, height: 50 };

      const measured = engine.measure(boxModel, contentSize);

      expect(measured.width).toBe(100);
      expect(measured.height).toBe(50);
    });
  });

  describe('layout', () => {
    it('should return measured size with default position', () => {
      const boxModel = createDefaultBoxModel();
      const measuredSize = { width: 100, height: 50 };
      const constraints = { width: 800, height: 600 };

      const layout = engine.layout(boxModel, measuredSize, constraints);

      expect(layout.x).toBe(0);
      expect(layout.y).toBe(0);
      expect(layout.width).toBe(100);
      expect(layout.height).toBe(50);
    });

    it('should use custom position', () => {
      const boxModel = createDefaultBoxModel();
      const measuredSize = { width: 100, height: 50 };
      const constraints = { width: 800, height: 600 };

      const layout = engine.layout(boxModel, measuredSize, constraints, { x: 50, y: 25 });

      expect(layout.x).toBe(50);
      expect(layout.y).toBe(25);
    });

    it('should expand to fill width when fill constraint', () => {
      const boxModel = createDefaultBoxModel({ width: 'fill' });
      const measuredSize = { width: 100, height: 50 };
      const constraints = { width: 800, height: 600 };

      const layout = engine.layout(boxModel, measuredSize, constraints);

      expect(layout.width).toBe(800);
    });

    it('should expand to fill height when fill constraint', () => {
      const boxModel = createDefaultBoxModel({ height: 'fill' });
      const measuredSize = { width: 100, height: 50 };
      const constraints = { width: 800, height: 600 };

      const layout = engine.layout(boxModel, measuredSize, constraints);

      expect(layout.height).toBe(600);
    });

    it('should apply maxWidth constraint', () => {
      const boxModel = createDefaultBoxModel({
        width: 'fill',
        maxWidth: 400
      });
      const measuredSize = { width: 100, height: 50 };
      const constraints = { width: 800, height: 600 };

      const layout = engine.layout(boxModel, measuredSize, constraints);

      expect(layout.width).toBe(400);
    });

    it('should apply maxHeight constraint', () => {
      const boxModel = createDefaultBoxModel({
        height: 'fill',
        maxHeight: 300
      });
      const measuredSize = { width: 100, height: 50 };
      const constraints = { width: 800, height: 600 };

      const layout = engine.layout(boxModel, measuredSize, constraints);

      expect(layout.height).toBe(300);
    });

    it('should calculate content area with padding', () => {
      const boxModel = createDefaultBoxModel({
        padding: EdgeInsets.only({ top: 10, right: 20, bottom: 30, left: 40 })
      });
      const measuredSize = { width: 200, height: 150 };
      const constraints = { width: 800, height: 600 };

      const layout = engine.layout(boxModel, measuredSize, constraints);

      expect(layout.contentX).toBe(40);
      expect(layout.contentY).toBe(10);
      expect(layout.contentWidth).toBe(140); // 200 - 40 - 20
      expect(layout.contentHeight).toBe(110); // 150 - 10 - 30
    });

    it('should calculate content area with border', () => {
      const boxModel = createDefaultBoxModel({
        border: EdgeInsets.all(5)
      });
      const measuredSize = { width: 100, height: 50 };
      const constraints = { width: 800, height: 600 };

      const layout = engine.layout(boxModel, measuredSize, constraints);

      expect(layout.contentX).toBe(5);
      expect(layout.contentY).toBe(5);
      expect(layout.contentWidth).toBe(90); // 100 - 5 - 5
      expect(layout.contentHeight).toBe(40); // 50 - 5 - 5
    });

    it('should ensure content dimensions are never negative', () => {
      const boxModel = createDefaultBoxModel({
        padding: EdgeInsets.all(100) // Large padding
      });
      const measuredSize = { width: 50, height: 30 }; // Small size
      const constraints = { width: 800, height: 600 };

      const layout = engine.layout(boxModel, measuredSize, constraints);

      expect(layout.contentWidth).toBe(0);
      expect(layout.contentHeight).toBe(0);
    });
  });

  describe('position', () => {
    it('should offset layout by parent content area', () => {
      const layout = {
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        contentX: 5,
        contentY: 5,
        contentWidth: 90,
        contentHeight: 40
      };
      const parentLayout = {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        contentX: 50,
        contentY: 25,
        contentWidth: 700,
        contentHeight: 550
      };

      const positioned = engine.position(layout, parentLayout);

      expect(positioned.x).toBe(60); // 50 + 10
      expect(positioned.y).toBe(45); // 25 + 20
      expect(positioned.width).toBe(100);
      expect(positioned.height).toBe(50);
    });
  });
});
