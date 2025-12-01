/**
 * Info Bar Card - Displays contextual information
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
import { GRID, px, asBitmapText } from '@moxijs/core';
import { getTheme, getFont } from '../theming/theme';
import { CardResult } from '../interfaces/components';
import { createManagedCard } from '../utilities/managed-card';
import { INFO_BAR_CONFIG } from '../config/card-configs';

export interface InfoSection {
  label: string;
  value: string;
}

export interface InfoBarCardOptions {
  x: number;
  y: number;
  renderer: PIXI.Renderer;
  width?: number;
  sections?: InfoSection[];
}

export interface InfoBarCardResult extends CardResult {
  updateSections: (sections: InfoSection[]) => void;
}

/** Default sections */
const DEFAULT_SECTIONS: InfoSection[] = [
  { label: 'Tool:', value: 'Pencil' },
  { label: 'Color:', value: '#000000' }
];

/** Layout constants */
const SECTION_PADDING = 2;
const SECTION_SPACING = 4;
const LABEL_VALUE_GAP = 1;

/**
 * Creates an info bar for displaying contextual information
 */
export function createInfoBarCard(options: InfoBarCardOptions): InfoBarCardResult {
  const { x, y, renderer, width } = options;

  const barHeight = INFO_BAR_CONFIG.barHeight;
  let sections: InfoSection[] = options.sections ?? DEFAULT_SECTIONS;
  const barWidth = width ?? (sections.length * INFO_BAR_CONFIG.minSectionWidth);

  // Create the managed card
  const managed = createManagedCard({
    title: 'Info',
    x,
    y,
    contentWidth: barWidth,
    contentHeight: barHeight,
    renderer,
    minContentSize: true,
    onResize: (newWidth) => {
      if (newWidth >= barHeight) updateInfoSections();
    },
    onRefresh: () => updateInfoSections()
  });

  const { card, contentContainer } = managed;

  /** Create a text element */
  const font = getFont();
  function createText(text: string, color: number): PIXI.BitmapText {
    const bitmapText = asBitmapText(
      { text, style: { fontFamily: 'PixelOperator8Bitmap', fontSize: font.size, fill: color }, pixelPerfect: true },
      { scale: font.scale }
    );
    bitmapText.tint = color; // BitmapText uses tint for color
    return bitmapText;
  }

  function updateInfoSections() {
    contentContainer.removeChildren();

    const theme = getTheme();
    let currentX = px(SECTION_PADDING);

    sections.forEach(section => {
      const labelText = createText(section.label, theme.text);
      labelText.position.set(currentX, px(SECTION_PADDING));
      contentContainer.addChild(labelText);

      currentX += labelText.width + px(LABEL_VALUE_GAP);

      const valueText = createText(section.value, theme.text);
      valueText.position.set(currentX, px(SECTION_PADDING));
      contentContainer.addChild(valueText);

      currentX += valueText.width + px(SECTION_SPACING);
    });
  }

  // Initial draw
  updateInfoSections();
  card.updateMinContentSize();

  return {
    card,
    container: card.container,
    updateSections: (newSections: InfoSection[]) => {
      sections = newSections;
      updateInfoSections();
      card.updateMinContentSize();
    },
    destroy: managed.destroy
  };
}
