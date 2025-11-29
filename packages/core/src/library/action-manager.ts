/**
 * ActionManager - Centralized event listener management utility
 *
 * Prevents memory leaks by tracking all registered event listeners and providing
 * batch cleanup functionality. Particularly useful for Logic components that need to
 * register multiple window/document listeners and clean them up on destroy.
 *
 * @example
 * ```ts
 * class DragLogic extends Logic<Container> {
 *   private actions = new ActionManager();
 *
 *   init(entity: Container) {
 *     this.actions.add(window, 'pointermove', this.onMove.bind(this));
 *     this.actions.add(window, 'pointerup', this.onUp.bind(this));
 *   }
 *
 *   destroy() {
 *     this.actions.removeAll();
 *   }
 * }
 * ```
 */

export interface OnAction {
  target: EventTarget;
  type: string;
  handler: EventListener;
  options?: AddEventListenerOptions;
}

/**
 * Manages event listener lifecycle to prevent memory leaks
 */
export class ActionManager {
  private actions: Set<OnAction> = new Set();

  /**
   * Add an event listener and track it for later cleanup
   *
   * @param target Event target (window, document, element, etc.)
   * @param type Event type ('click', 'wheel', 'mousemove', etc.)
   * @param handler Event handler function
   * @param options Optional event listener options
   * @returns Action object that can be used to remove this specific listener
   */
  add(
    target: EventTarget,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): OnAction {
    const action: OnAction = { target, type, handler, options };
    target.addEventListener(type, handler, options);
    this.actions.add(action);
    return action;
  }

  /**
   * Remove a specific event listener
   *
   * @param action The action object returned from add()
   */
  remove(action: OnAction): void {
    if (this.actions.has(action)) {
      action.target.removeEventListener(
        action.type,
        action.handler,
        action.options
      );
      this.actions.delete(action);
    }
  }

  /**
   * Remove all event listeners managed by this ActionManager
   *
   * Should be called when the component is destroyed to prevent memory leaks
   */
  removeAll(): void {
    this.actions.forEach(action => {
      action.target.removeEventListener(action.type, action.handler, action.options);
    });
    this.actions.clear();
  }

  /**
   * Get the count of active actions
   *
   * Useful for debugging and testing
   */
  getCount(): number {
    return this.actions.size;
  }

  /**
   * Check if a specific action is currently active
   *
   * @param action The action to check
   * @returns True if the action is active
   */
  hasAction(action: OnAction): boolean {
    return this.actions.has(action);
  }
}
