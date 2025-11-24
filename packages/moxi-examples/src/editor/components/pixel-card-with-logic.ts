/**
 * PixelCard with Logic Components (Example/Future Implementation)
 *
 * This demonstrates how PixelCard could be refactored to use Moxi Logic components
 * instead of handling drag/resize internally. This is an EXAMPLE - the actual
 * PixelCard still works fine without this conversion.
 *
 * Benefits of using Logic:
 * - Separation of concerns (UI rendering vs behavior)
 * - Reusable logic across different card types
 * - Easier to test
 * - Can enable/disable behaviors dynamically
 */
import * as PIXI from 'pixi.js';
import { asEntity } from 'moxi';
import { CardDragLogic } from '../logic/card-drag-logic';
import { CardResizeLogic } from '../logic/card-resize-logic';
import { GRID, BORDER, px } from 'moxi';
import { getTheme } from '../theming/theme';

export interface PixelCardWithLogicOptions {
  title: string;
  x?: number;
  y?: number;
  contentWidth: number;   // In grid units
  contentHeight: number;  // In grid units
  renderer: PIXI.Renderer;
  onResize?: (width: number, height: number) => void;
  draggable?: boolean;
  resizable?: boolean;
}

/**
 * Example of PixelCard using Moxi Logic components
 *
 * This shows the pattern - actual integration would require more work
 * to migrate all the existing PixelCard functionality.
 */
export function createPixelCardWithLogic(options: PixelCardWithLogicOptions) {
  // Create base container
  const container = new PIXI.Container();
  container.position.set(options.x ?? 0, options.y ?? 0);

  // Create content container
  const contentContainer = new PIXI.Container();

  // Card state
  let contentWidth = options.contentWidth;
  let contentHeight = options.contentHeight;

  // Calculate dimensions
  const titleBarHeight = calculateTitleBarHeight();
  const getCardWidth = () => px(contentWidth + BORDER.total * 2 + GRID.padding * 2);
  const getCardHeight = () => px(contentHeight) + px(BORDER.total * 2) + titleBarHeight + px(GRID.padding * 2);

  // Render the card UI (simplified for example)
  function render() {
    container.removeChildren();

    // Background
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, getCardWidth(), getCardHeight());
    bg.fill(getTheme().backgroundSurface);
    container.addChild(bg);

    // Border
    const border = new PIXI.Graphics();
    border.rect(0, 0, getCardWidth(), getCardHeight());
    border.stroke({ color: getTheme().borderStrong, width: px(1) });
    container.addChild(border);

    // Title bar (simplified)
    const titleBg = new PIXI.Graphics();
    titleBg.rect(px(BORDER.total), px(BORDER.total), px(contentWidth + GRID.padding * 2), titleBarHeight);
    titleBg.fill(getTheme().backgroundOverlay);
    container.addChild(titleBg);

    // Content container position
    contentContainer.x = px(BORDER.total + GRID.padding);
    contentContainer.y = px(BORDER.total) + titleBarHeight + px(GRID.padding);
    container.addChild(contentContainer);
  }

  // Initial render
  render();

  // Apply Moxi Logic components using asEntity
  const entityWithLogic = asEntity(container, {
    // Drag logic
    ...(options.draggable !== false ? {
      'CardDrag': new CardDragLogic({
        enabled: true,
        onDragEnd: (x, y) => {
          console.log(`Card dragged to ${x}, ${y}`);
        },
        onClick: () => {
          console.log('Card clicked (bring to front)');
        }
      })
    } : {}),

    // Resize logic
    ...(options.resizable !== false ? {
      'CardResize': new CardResizeLogic({
        enabled: true,
        minWidth: getCardWidth(),
        minHeight: getCardHeight(),
        onResize: (width, height) => {
          // Convert pixel dimensions back to grid units
          // This is simplified - actual implementation would need more calculation
          const newContentWidth = Math.floor((width / px(1)) - (BORDER.total * 2) - (GRID.padding * 2));
          const newContentHeight = Math.floor((height - titleBarHeight) / px(1)) - (BORDER.total * 2) - (GRID.padding * 2);

          if (newContentWidth !== contentWidth || newContentHeight !== contentHeight) {
            contentWidth = newContentWidth;
            contentHeight = newContentHeight;
            render();

            if (options.onResize) {
              options.onResize(contentWidth, contentHeight);
            }
          }
        }
      })
    } : {})
  });

  // Initialize the entity (this calls init on all Logic components)
  entityWithLogic.moxiEntity.init(options.renderer);

  // Return API similar to PixelCard
  return {
    container: entityWithLogic,
    contentContainer,

    getContentSize: () => ({ width: contentWidth, height: contentHeight }),

    setContentSize: (width: number, height: number) => {
      contentWidth = width;
      contentHeight = height;
      render();
    },

    refresh: () => {
      render();
    },

    // Access to Logic components
    getDragLogic: () => entityWithLogic.moxiEntity.getLogic('CardDrag') as CardDragLogic | undefined,
    getResizeLogic: () => entityWithLogic.moxiEntity.getLogic('CardResize') as CardResizeLogic | undefined,

    // Enable/disable behaviors dynamically
    enableDrag: () => (entityWithLogic.moxiEntity.getLogic('CardDrag') as CardDragLogic | undefined)?.enable(),
    disableDrag: () => (entityWithLogic.moxiEntity.getLogic('CardDrag') as CardDragLogic | undefined)?.disable(),
    enableResize: () => (entityWithLogic.moxiEntity.getLogic('CardResize') as CardResizeLogic | undefined)?.enable(),
    disableResize: () => (entityWithLogic.moxiEntity.getLogic('CardResize') as CardResizeLogic | undefined)?.disable(),
  };
}

function calculateTitleBarHeight(): number {
  const fontHeight = 64 * GRID.fontScale;
  const verticalPadding = px(GRID.padding * 2);
  return Math.ceil(fontHeight + verticalPadding);
}

/**
 * USAGE EXAMPLE:
 *
 * const card = createPixelCardWithLogic({
 *   title: 'My Card',
 *   x: 100,
 *   y: 100,
 *   contentWidth: 50,
 *   contentHeight: 50,
 *   renderer,
 *   draggable: true,
 *   resizable: true,
 *   onResize: (w, h) => console.log(`Resized to ${w}x${h}`)
 * });
 *
 * scene.addChild(card.container);
 *
 * // Dynamically control behaviors
 * card.disableDrag();  // Prevent dragging
 * card.enableResize(); // Allow resizing
 *
 * // Access Logic components directly
 * const dragLogic = card.getDragLogic();
 * if (dragLogic?.isActive()) {
 *   console.log('Card is being dragged!');
 * }
 */
