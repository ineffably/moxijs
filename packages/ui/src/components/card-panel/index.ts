/**
 * Card Panel Module
 *
 * Exports the CardPanel component and related types for creating
 * flexible, styled card interfaces with title, body, and footer sections.
 *
 * @category UI
 */

// Main component
export { CardPanel } from './card-panel';
export type {
  CardPanelProps,
  CardPanelTitle,
  CardPanelFooter,
  DrawIconFn,
  ResizeDirection
} from './card-panel';

// Style system
export { BaseCardStyle } from './card-style';
export type {
  CardStyle,
  CardThemeColors,
  CardSectionDimensions
} from './card-style';

// Built-in styles
export { FlatCardStyle } from './flat-card-style';
export type { FlatCardStyleConfig } from './flat-card-style';
