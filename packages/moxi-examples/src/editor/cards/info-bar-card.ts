/**
 * Info Bar Card - Displays contextual information
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
import { GRID, BORDER, px } from 'moxi';
import { getTheme } from '../theming/theme';

export interface InfoSection {
  label: string;
  value: string;
}

export interface InfoBarCardOptions {
  x: number;
  y: number;
  renderer: PIXI.Renderer;
  sections?: InfoSection[];
}

export interface InfoBarCardResult {
  card: PixelCard;
  updateSections: (sections: InfoSection[]) => void;
}

/**
 * Creates an info bar for displaying contextual information in horizontal sections
 */
export function createInfoBarCard(options: InfoBarCardOptions): InfoBarCardResult {
  const { x, y, renderer } = options;

  const barHeight = 8; // Grid units for a slim horizontal bar

  // Default sections
  let sections: InfoSection[] = options.sections ?? [
    { label: 'Tool:', value: 'Pencil' },
    { label: 'Color:', value: '#000000' },
    { label: 'Scale:', value: '1x' }
  ];

  // Estimate width: each section takes roughly 20 grid units
  const barWidth = sections.length * 20;

  // Create the card (uses default card background from theme)
  const card = new PixelCard({
    title: 'Info',
    x,
    y,
    contentWidth: barWidth,
    contentHeight: barHeight,
    renderer,
    minContentSize: true, // Prevent resizing below content's actual size
    onResize: (newWidth, newHeight) => {
      // Only update if the resize maintains horizontal layout
      if (newWidth >= barHeight) {
        updateInfoSections();
      }
    },
    onRefresh: () => {
      // Redraw content when theme changes
      updateInfoSections();
    }
  });

  const contentContainer = card.getContentContainer();

  function updateInfoSections() {
    contentContainer.removeChildren();

    let currentX = px(2);
    const sectionSpacing = px(4);

    sections.forEach((section, index) => {
      // Label text
      const labelText = new PIXI.BitmapText({
        text: section.label,
        style: {
          fontFamily: 'PixelOperator8Bitmap',
          fontSize: 64,
          fill: getTheme().textSecondary, // Use theme secondary text
        }
      });
      labelText.roundPixels = true;
      labelText.scale.set(GRID.fontScale);
      labelText.position.set(currentX, px(2));
      contentContainer.addChild(labelText);

      currentX += labelText.width + px(1);

      // Value text
      const valueText = new PIXI.BitmapText({
        text: section.value,
        style: {
          fontFamily: 'PixelOperator8Bitmap',
          fontSize: 64,
          fill: getTheme().textPrimary, // Use theme primary text
        }
      });
      valueText.roundPixels = true;
      valueText.scale.set(GRID.fontScale);
      valueText.position.set(currentX, px(2));
      contentContainer.addChild(valueText);

      currentX += valueText.width + sectionSpacing;
    });
  }

  // Initial draw
  updateInfoSections();

  // Update minimum content size based on actual content
  card.updateMinContentSize();

  return {
    card,
    updateSections: (newSections: InfoSection[]) => {
      sections = newSections;
      updateInfoSections();
      card.updateMinContentSize();
    }
  };
}
