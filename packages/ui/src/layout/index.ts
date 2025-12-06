/**
 * Layout System
 *
 * CSS-lite Flexbox layout system for PIXI.js components.
 *
 * Architecture:
 * - core/: Types (LayoutNode, LayoutStyle, etc.)
 * - engine/: FlexLayoutEngine (3-pass algorithm)
 * - tree/: LayoutTree (dirty tracking, batching)
 * - integration/: Protocol for UIComponent integration
 * - debug/: Debug overlay visualization
 *
 * @module layout
 */

export * from './core';
export * from './engine';
export * from './tree';
export * from './integration';
export * from './debug';
