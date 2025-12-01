/**
 * Managed Card Utility
 *
 * Provides common functionality for card components including:
 * - Automatic cleanup of child components
 * - Event handler management
 * - Standardized destroy pattern
 */
import * as PIXI from 'pixi.js';
import { PixelCard, PixelCardOptions } from '../components/pixel-card';

/**
 * Interface for components that can be destroyed
 */
export interface Destroyable {
  destroy(): void;
}

/**
 * Interface for event listener cleanup
 */
export interface EventListenerRef {
  target: EventTarget;
  type: string;
  listener: EventListener;
  options?: AddEventListenerOptions | boolean;
}

/**
 * Managed card state and utilities
 */
export interface ManagedCard {
  /** The underlying PixelCard */
  card: PixelCard;

  /** The content container from the card */
  contentContainer: PIXI.Container;

  /**
   * Register a child component for automatic cleanup.
   * Call this when creating buttons, swatches, or other destroyable components.
   */
  trackChild<T extends Destroyable>(child: T): T;

  /**
   * Clear all tracked children (destroys them and empties the list).
   * Call this before redrawing content.
   */
  clearChildren(): void;

  /**
   * Register an event listener for automatic cleanup.
   * Call this instead of directly using addEventListener.
   */
  addEventListenerTracked<K extends keyof WindowEventMap>(
    target: Window,
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions | boolean
  ): void;
  addEventListenerTracked(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Destroy the managed card and all tracked resources.
   * This should be returned as the destroy method of your card result.
   */
  destroy(): void;
}

/**
 * Creates a managed card with automatic cleanup utilities.
 *
 * @example
 * ```typescript
 * const managed = createManagedCard({
 *   title: 'My Card',
 *   x: 0, y: 0,
 *   contentWidth: 100,
 *   contentHeight: 100,
 *   renderer,
 *   onRefresh: () => redrawContent()
 * });
 *
 * function redrawContent() {
 *   managed.clearChildren();
 *   managed.contentContainer.removeChildren();
 *
 *   const button = createPixelButton({ ... });
 *   managed.trackChild(button);
 *   managed.contentContainer.addChild(button.container);
 * }
 *
 * // For wheel handlers
 * managed.addEventListenerTracked(window, 'wheel', handleWheel, { passive: false });
 *
 * return {
 *   card: managed.card,
 *   container: managed.card.container,
 *   destroy: managed.destroy
 * };
 * ```
 */
export function createManagedCard(options: PixelCardOptions): ManagedCard {
  const card = new PixelCard(options);
  const contentContainer = card.getContentContainer();

  // Track created children for cleanup
  const trackedChildren: Destroyable[] = [];

  // Track event listeners for cleanup
  const trackedListeners: EventListenerRef[] = [];

  function trackChild<T extends Destroyable>(child: T): T {
    trackedChildren.push(child);
    return child;
  }

  function clearChildren(): void {
    trackedChildren.forEach(child => child.destroy());
    trackedChildren.length = 0;
  }

  function addEventListenerTracked(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions | boolean
  ): void {
    target.addEventListener(type, listener, options);
    trackedListeners.push({ target, type, listener, options });
  }

  function destroy(): void {
    // Clean up all tracked children
    clearChildren();

    // Remove all tracked event listeners
    trackedListeners.forEach(({ target, type, listener, options }) => {
      target.removeEventListener(type, listener, options);
    });
    trackedListeners.length = 0;

    // Destroy the card
    card.container.destroy({ children: true });
  }

  return {
    card,
    contentContainer,
    trackChild,
    clearChildren,
    addEventListenerTracked,
    destroy
  };
}
