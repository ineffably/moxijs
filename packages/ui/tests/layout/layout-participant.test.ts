import {
  isFlexLayoutParticipant,
  syncBoxModelToLayoutStyle,
  IFlexLayoutParticipant,
} from '../../src/layout/layout-participant';
import {
  createLayoutNode,
  createDefaultLayoutStyle,
} from '../../src/layout/layout-types';

describe('layout-participant', () => {
  describe('isFlexLayoutParticipant', () => {
    it('should return true for valid participant', () => {
      const participant: IFlexLayoutParticipant = {
        id: 'test',
        layoutNode: createLayoutNode('test'),
        measureContent: () => ({ width: 100, height: 50 }),
        applyLayout: () => {},
        syncLayoutStyle: () => {},
      };

      expect(isFlexLayoutParticipant(participant)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isFlexLayoutParticipant(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isFlexLayoutParticipant(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isFlexLayoutParticipant('string')).toBe(false);
      expect(isFlexLayoutParticipant(123)).toBe(false);
      expect(isFlexLayoutParticipant(true)).toBe(false);
    });

    it('should return false for object missing id', () => {
      const obj = {
        layoutNode: createLayoutNode('test'),
        measureContent: () => ({ width: 100, height: 50 }),
        applyLayout: () => {},
        syncLayoutStyle: () => {},
      };

      expect(isFlexLayoutParticipant(obj)).toBe(false);
    });

    it('should return false for object with non-string id', () => {
      const obj = {
        id: 123,
        layoutNode: createLayoutNode('test'),
        measureContent: () => ({ width: 100, height: 50 }),
        applyLayout: () => {},
        syncLayoutStyle: () => {},
      };

      expect(isFlexLayoutParticipant(obj)).toBe(false);
    });

    it('should return false for object missing layoutNode', () => {
      const obj = {
        id: 'test',
        measureContent: () => ({ width: 100, height: 50 }),
        applyLayout: () => {},
        syncLayoutStyle: () => {},
      };

      expect(isFlexLayoutParticipant(obj)).toBe(false);
    });

    it('should return false for object missing measureContent', () => {
      const obj = {
        id: 'test',
        layoutNode: createLayoutNode('test'),
        applyLayout: () => {},
        syncLayoutStyle: () => {},
      };

      expect(isFlexLayoutParticipant(obj)).toBe(false);
    });

    it('should return false for object missing applyLayout', () => {
      const obj = {
        id: 'test',
        layoutNode: createLayoutNode('test'),
        measureContent: () => ({ width: 100, height: 50 }),
        syncLayoutStyle: () => {},
      };

      expect(isFlexLayoutParticipant(obj)).toBe(false);
    });

    it('should return false for object missing syncLayoutStyle', () => {
      const obj = {
        id: 'test',
        layoutNode: createLayoutNode('test'),
        measureContent: () => ({ width: 100, height: 50 }),
        applyLayout: () => {},
      };

      expect(isFlexLayoutParticipant(obj)).toBe(false);
    });
  });

  describe('syncBoxModelToLayoutStyle', () => {
    it('should sync dimensions', () => {
      const boxModel = {
        width: 200,
        height: 100,
      };
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.width).toBe(200);
      expect(target.height).toBe(100);
    });

    it('should default dimensions to auto', () => {
      const boxModel = {};
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.width).toBe('auto');
      expect(target.height).toBe('auto');
    });

    it('should sync min/max constraints', () => {
      const boxModel = {
        minWidth: 50,
        maxWidth: 500,
        minHeight: 30,
        maxHeight: 300,
      };
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.minWidth).toBe(50);
      expect(target.maxWidth).toBe(500);
      expect(target.minHeight).toBe(30);
      expect(target.maxHeight).toBe(300);
    });

    it('should sync padding', () => {
      const boxModel = {
        padding: { top: 10, right: 20, bottom: 10, left: 20 },
      };
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.padding).toEqual({ top: 10, right: 20, bottom: 10, left: 20 });
    });

    it('should sync margin', () => {
      const boxModel = {
        margin: { top: 5, right: 10, bottom: 5, left: 10 },
      };
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.margin).toEqual({ top: 5, right: 10, bottom: 5, left: 10 });
    });

    it('should sync display and position', () => {
      const boxModel = {
        display: 'none' as const,
        position: 'absolute' as const,
      };
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.display).toBe('none');
      expect(target.position).toBe('absolute');
    });

    it('should default display to flex and position to relative', () => {
      const boxModel = {};
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.display).toBe('flex');
      expect(target.position).toBe('relative');
    });

    it('should sync position offsets', () => {
      const boxModel = {
        top: 10,
        right: 20,
        bottom: 30,
        left: 40,
      };
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.top).toBe(10);
      expect(target.right).toBe(20);
      expect(target.bottom).toBe(30);
      expect(target.left).toBe(40);
    });

    it('should sync order and zIndex', () => {
      const boxModel = {
        order: 5,
        zIndex: 10,
      };
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.order).toBe(5);
      expect(target.zIndex).toBe(10);
    });

    it('should default order and zIndex to 0', () => {
      const boxModel = {};
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.order).toBe(0);
      expect(target.zIndex).toBe(0);
    });

    it('should sync flex item properties', () => {
      const boxModel = {
        flex: {
          grow: 2,
          shrink: 0,
          basis: 100,
          alignSelf: 'center' as const,
        },
      };
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.flexGrow).toBe(2);
      expect(target.flexShrink).toBe(0);
      expect(target.flexBasis).toBe(100);
      expect(target.alignSelf).toBe('center');
    });

    it('should default flex item properties', () => {
      const boxModel = {};
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.flexGrow).toBe(0);
      expect(target.flexShrink).toBe(1);
      expect(target.flexBasis).toBe('auto');
      expect(target.alignSelf).toBe('auto');
    });

    it('should sync flex container properties', () => {
      const boxModel = {
        flex: {
          direction: 'column' as const,
          wrap: 'wrap' as const,
          justify: 'center' as const,
          alignItems: 'start' as const,
          alignContent: 'space-between' as const,
          gap: 10,
        },
      };
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.flexDirection).toBe('column');
      expect(target.flexWrap).toBe('wrap');
      expect(target.justifyContent).toBe('center');
      expect(target.alignItems).toBe('start');
      expect(target.alignContent).toBe('space-between');
      expect(target.gap).toBe(10);
    });

    it('should default flex container properties', () => {
      const boxModel = {};
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.flexDirection).toBe('row');
      expect(target.flexWrap).toBe('nowrap');
      expect(target.justifyContent).toBe('start');
      expect(target.alignItems).toBe('stretch');
      expect(target.alignContent).toBe('stretch');
      expect(target.gap).toBe(0);
    });

    it('should sync row and column gap', () => {
      const boxModel = {
        flex: {
          rowGap: 10,
          columnGap: 20,
        },
      };
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.rowGap).toBe(10);
      expect(target.columnGap).toBe(20);
    });

    it('should sync string dimensions', () => {
      const boxModel = {
        width: 'fill',
        height: '50%',
      };
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.width).toBe('fill');
      expect(target.height).toBe('50%');
    });

    it('should sync string flex basis', () => {
      const boxModel = {
        flex: {
          basis: 'auto',
        },
      };
      const target = createDefaultLayoutStyle();

      syncBoxModelToLayoutStyle(boxModel, target);

      expect(target.flexBasis).toBe('auto');
    });
  });
});
