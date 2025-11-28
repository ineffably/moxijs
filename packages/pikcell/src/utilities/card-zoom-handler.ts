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
export function createCardZoomHandler(
  renderer: PIXI.Renderer,
  card: PixelCard,
  onZoom: (delta: number, event: WheelEvent) => void
): (e: WheelEvent) => void {
  return (e: WheelEvent) => {
    const canvas = renderer.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const cardBounds = card.container.getBounds();

    if (mouseX >= cardBounds.x && mouseX <= cardBounds.x + cardBounds.width &&
        mouseY >= cardBounds.y && mouseY <= cardBounds.y + cardBounds.height) {
      e.preventDefault();

      const delta = e.deltaY > 0 ? -1 : 1;
      onZoom(delta, e);
    }
  };
}
