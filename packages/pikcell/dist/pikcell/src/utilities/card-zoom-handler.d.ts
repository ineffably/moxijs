/**
 * Card Zoom Handler Utility
 * Encapsulates the common zoom logic used by palette, tools, and sprite cards
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
/**
 * Helper: Creates a mouse wheel zoom handler for a card
 * Encapsulates the common zoom logic used by palette, tools, and sprite cards
 */
export declare function createCardZoomHandler(renderer: PIXI.Renderer, card: PixelCard, onZoom: (delta: number, event: WheelEvent) => void): (e: WheelEvent) => void;
