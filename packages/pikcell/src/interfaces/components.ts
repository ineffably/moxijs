/**
 * Component Interfaces
 *
 * Standard interfaces for all pikcell components to ensure consistency.
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';

/**
 * Base interface for all component results.
 * Every factory function should return an object implementing this interface.
 */
export interface ComponentResult {
  /** The PIXI container for this component */
  container: PIXI.Container;

  /** Clean up resources and event listeners */
  destroy(): void;
}

/**
 * Base interface for card-based component results.
 * Cards are special components that wrap a PixelCard.
 */
export interface CardResult extends ComponentResult {
  /** The PixelCard instance */
  card: PixelCard;

  /** Override container to return the card's container */
  container: PIXI.Container;
}

/**
 * Interface for components that can be refreshed/redrawn
 */
export interface RefreshableComponent {
  /** Redraw the component's contents */
  redraw(): void;
}

/**
 * Interface for components with selectable state
 */
export interface SelectableComponent {
  /** Get the currently selected index */
  getSelectedIndex(): number;

  /** Set the selected index */
  setSelectedIndex(index: number): void;
}

/**
 * Interface for components with controllable content
 */
export interface ControllableComponent<T> {
  /** The controller managing this component's data */
  controller: T;
}

/**
 * Type guard to check if a result has a destroy method
 */
export function hasDestroy(obj: unknown): obj is { destroy(): void } {
  return typeof obj === 'object' && obj !== null && 'destroy' in obj && typeof (obj as { destroy: unknown }).destroy === 'function';
}

/**
 * Type guard to check if a result is a CardResult
 */
export function isCardResult(obj: unknown): obj is CardResult {
  return typeof obj === 'object' && obj !== null && 'card' in obj && 'container' in obj && 'destroy' in obj;
}

