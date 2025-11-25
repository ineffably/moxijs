import { ActionManager, OnAction } from '../src/library/action-manager';

describe('ActionManager', () => {
  let manager: ActionManager;
  let mockTarget: EventTarget;
  let mockHandler: jest.Mock;

  beforeEach(() => {
    manager = new ActionManager();
    // Create a mock EventTarget for testing in node environment
    mockTarget = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    } as unknown as EventTarget;
    mockHandler = jest.fn();
  });

  afterEach(() => {
    manager.removeAll();
  });

  describe('add', () => {
    it('should register an event listener and return an action object', () => {
      const action = manager.add(mockTarget, 'click', mockHandler);

      expect(action).toBeDefined();
      expect(action.target).toBe(mockTarget);
      expect(action.type).toBe('click');
      expect(action.handler).toBe(mockHandler);
      expect(manager.getCount()).toBe(1);
    });

    it('should actually add the event listener to the target', () => {
      manager.add(mockTarget, 'mousemove', mockHandler);

      expect(mockTarget.addEventListener).toHaveBeenCalledWith('mousemove', mockHandler, undefined);
    });

    it('should pass options to addEventListener', () => {
      const options = { passive: true, once: true };

      manager.add(mockTarget, 'wheel', mockHandler, options);

      expect(mockTarget.addEventListener).toHaveBeenCalledWith('wheel', mockHandler, options);
    });

    it('should track multiple listeners', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      manager.add(mockTarget, 'click', handler1);
      manager.add(mockTarget, 'mousemove', handler2);

      expect(manager.getCount()).toBe(2);
    });

    it('should track listeners on different targets', () => {
      const target1 = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      } as unknown as EventTarget;
      const target2 = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      } as unknown as EventTarget;

      manager.add(target1, 'click', mockHandler);
      manager.add(target2, 'resize', mockHandler);

      expect(manager.getCount()).toBe(2);
    });
  });

  describe('remove', () => {
    it('should remove a specific event listener', () => {
      const action = manager.add(mockTarget, 'click', mockHandler);

      manager.remove(action);

      expect(mockTarget.removeEventListener).toHaveBeenCalledWith('click', mockHandler, undefined);
      expect(manager.getCount()).toBe(0);
      expect(manager.hasAction(action)).toBe(false);
    });

    it('should pass options when removing listener', () => {
      const options = { passive: true };
      const action = manager.add(mockTarget, 'wheel', mockHandler, options);

      manager.remove(action);

      expect(mockTarget.removeEventListener).toHaveBeenCalledWith('wheel', mockHandler, options);
    });

    it('should only remove the specified listener', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const action1 = manager.add(mockTarget, 'click', handler1);
      const action2 = manager.add(mockTarget, 'mousemove', handler2);

      manager.remove(action1);

      expect(manager.getCount()).toBe(1);
      expect(manager.hasAction(action1)).toBe(false);
      expect(manager.hasAction(action2)).toBe(true);
    });

    it('should handle removing non-existent action gracefully', () => {
      const fakeAction: OnAction = {
        target: mockTarget,
        type: 'click',
        handler: jest.fn()
      };

      expect(() => {
        manager.remove(fakeAction);
      }).not.toThrow();
      expect(manager.getCount()).toBe(0);
    });

    it('should not remove listener if action was already removed', () => {
      const action = manager.add(mockTarget, 'click', mockHandler);

      manager.remove(action);
      const callCount = (mockTarget.removeEventListener as jest.Mock).mock.calls.length;
      manager.remove(action);

      expect((mockTarget.removeEventListener as jest.Mock).mock.calls.length).toBe(callCount);
    });
  });

  describe('removeAll', () => {
    it('should remove all registered event listeners', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      manager.add(mockTarget, 'click', handler1);
      manager.add(mockTarget, 'mousemove', handler2);

      manager.removeAll();

      expect(mockTarget.removeEventListener).toHaveBeenCalledTimes(2);
      expect(manager.getCount()).toBe(0);
    });

    it('should handle empty manager gracefully', () => {
      expect(() => {
        manager.removeAll();
      }).not.toThrow();
      expect(manager.getCount()).toBe(0);
    });

    it('should clear all tracked actions', () => {
      const action1 = manager.add(mockTarget, 'click', mockHandler);
      const action2 = manager.add(mockTarget, 'mousemove', jest.fn());

      manager.removeAll();

      expect(manager.hasAction(action1)).toBe(false);
      expect(manager.hasAction(action2)).toBe(false);
    });

    it('should remove listeners from multiple targets', () => {
      const target1 = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      } as unknown as EventTarget;
      const target2 = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      } as unknown as EventTarget;

      manager.add(target1, 'click', mockHandler);
      manager.add(target2, 'resize', mockHandler);

      manager.removeAll();

      expect(target1.removeEventListener).toHaveBeenCalled();
      expect(target2.removeEventListener).toHaveBeenCalled();
    });
  });

  describe('getCount', () => {
    it('should return 0 for empty manager', () => {
      expect(manager.getCount()).toBe(0);
    });

    it('should return correct count of registered listeners', () => {
      manager.add(mockTarget, 'click', mockHandler);
      expect(manager.getCount()).toBe(1);

      manager.add(mockTarget, 'mousemove', jest.fn());
      expect(manager.getCount()).toBe(2);

      manager.add(mockTarget, 'wheel', jest.fn());
      expect(manager.getCount()).toBe(3);
    });

    it('should decrease count when listeners are removed', () => {
      const action1 = manager.add(mockTarget, 'click', mockHandler);
      const action2 = manager.add(mockTarget, 'mousemove', jest.fn());

      expect(manager.getCount()).toBe(2);

      manager.remove(action1);
      expect(manager.getCount()).toBe(1);

      manager.remove(action2);
      expect(manager.getCount()).toBe(0);
    });
  });

  describe('hasAction', () => {
    it('should return true for registered action', () => {
      const action = manager.add(mockTarget, 'click', mockHandler);

      expect(manager.hasAction(action)).toBe(true);
    });

    it('should return false for unregistered action', () => {
      const fakeAction: OnAction = {
        target: mockTarget,
        type: 'click',
        handler: jest.fn()
      };

      expect(manager.hasAction(fakeAction)).toBe(false);
    });

    it('should return false after action is removed', () => {
      const action = manager.add(mockTarget, 'click', mockHandler);

      expect(manager.hasAction(action)).toBe(true);

      manager.remove(action);
      expect(manager.hasAction(action)).toBe(false);
    });

    it('should return false after removeAll', () => {
      const action = manager.add(mockTarget, 'click', mockHandler);

      expect(manager.hasAction(action)).toBe(true);

      manager.removeAll();
      expect(manager.hasAction(action)).toBe(false);
    });

    it('should distinguish between similar but different actions', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const action1 = manager.add(mockTarget, 'click', handler1);
      const action2 = manager.add(mockTarget, 'click', handler2);

      expect(manager.hasAction(action1)).toBe(true);
      expect(manager.hasAction(action2)).toBe(true);

      // Create a fake action with same properties but different handler reference
      const fakeAction: OnAction = {
        target: mockTarget,
        type: 'click',
        handler: handler1 // Same function but different object reference
      };

      // This should still work because we're checking the actual action object
      expect(manager.hasAction(action1)).toBe(true);
      expect(manager.hasAction(fakeAction)).toBe(false);
    });
  });

  describe('integration', () => {
    it('should handle complete lifecycle: add, use, remove', () => {
      const clickHandler = jest.fn();
      const action = manager.add(mockTarget, 'click', clickHandler);

      // Verify listener was added
      expect(mockTarget.addEventListener).toHaveBeenCalledWith('click', clickHandler, undefined);
      expect(manager.hasAction(action)).toBe(true);

      manager.remove(action);

      // Verify listener was removed
      expect(mockTarget.removeEventListener).toHaveBeenCalledWith('click', clickHandler, undefined);
      expect(manager.hasAction(action)).toBe(false);
    });

    it('should handle multiple listeners of same type', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      const action1 = manager.add(mockTarget, 'click', handler1);
      const action2 = manager.add(mockTarget, 'click', handler2);

      expect(manager.getCount()).toBe(2);
      expect(manager.hasAction(action1)).toBe(true);
      expect(manager.hasAction(action2)).toBe(true);

      manager.remove(action1);

      expect(manager.getCount()).toBe(1);
      expect(manager.hasAction(action1)).toBe(false);
      expect(manager.hasAction(action2)).toBe(true);
    });

    it('should work with different event types', () => {
      const clickHandler = jest.fn();
      const wheelHandler = jest.fn();
      const resizeHandler = jest.fn();

      manager.add(mockTarget, 'click', clickHandler);
      manager.add(mockTarget, 'wheel', wheelHandler);
      manager.add(mockTarget, 'resize', resizeHandler);

      expect(manager.getCount()).toBe(3);

      manager.removeAll();
      expect(manager.getCount()).toBe(0);
    });
  });
});

