/**
 * Palette toolbar component for sprite editor
 */
import PIXI from 'pixi.js';
import { DraggableToolbar, DraggableToolbarProps } from './draggable-toolbar';
import { getPalette, PaletteType } from './palettes';

export interface PaletteToolbarProps extends Omit<DraggableToolbarProps, 'title'> {
  paletteType?: PaletteType;
  onColorSelect?: (color: number) => void;
  selectedColor?: number;
}

/**
 * A toolbar displaying a color palette grid
 */
export class PaletteToolbar extends DraggableToolbar {
  private colorSwatches: PIXI.Graphics[] = [];
  private palette: number[];
  private selectedColor: number | undefined;
  private onColorSelect?: (color: number) => void;
  private swatchSize: number = 24;
  private swatchSpacing: number = 2;
  private cols: number = 4;

  constructor(props: PaletteToolbarProps = {}) {
    const paletteType = props.paletteType ?? 'pico8';
    const palette = getPalette(paletteType);
    
    super({
      title: `Palette (${paletteType.toUpperCase()})`,
      width: props.width ?? 120,
      height: props.height ?? 120,
      ...props
    });

    this.palette = palette;
    this.selectedColor = props.selectedColor;
    this.onColorSelect = props.onColorSelect;

    this.createPaletteGrid();
  }

  /**
   * Creates the color palette grid
   */
  private createPaletteGrid(): void {
    const contentContainer = this.getContentContainer();
    const padding = 8;
    const startX = padding;
    const startY = padding;

    this.palette.forEach((color, index) => {
      const col = index % this.cols;
      const row = Math.floor(index / this.cols);
      
      const x = startX + col * (this.swatchSize + this.swatchSpacing);
      const y = startY + row * (this.swatchSize + this.swatchSpacing);

      const swatch = new PIXI.Graphics();
      swatch.roundPixels = true; // Pixel perfect rendering
      
      // Draw color square
      swatch.rect(0, 0, this.swatchSize, this.swatchSize);
      swatch.fill({ color });
      
      // Draw border
      const borderColor = this.selectedColor === color ? 0x212123 : 0x646365; // CC-29 colors
      const borderWidth = this.selectedColor === color ? 2 : 1;
      swatch.stroke({ color: borderColor, width: borderWidth });

      swatch.position.set(x, y);
      swatch.eventMode = 'static';
      swatch.cursor = 'pointer';

      // Add click handler
      swatch.on('pointerdown', () => {
        this.selectColor(color);
      });

      this.colorSwatches.push(swatch);
      contentContainer.addChild(swatch);
    });
  }

  /**
   * Selects a color from the palette
   */
  private selectColor(color: number): void {
    // Update selected color
    this.selectedColor = color;

    // Update visual selection
    this.colorSwatches.forEach((swatch, index) => {
      const isSelected = this.palette[index] === color;
      swatch.clear();
      swatch.rect(0, 0, this.swatchSize, this.swatchSize);
      swatch.fill({ color: this.palette[index] });
      
      const borderColor = isSelected ? 0x212123 : 0x646365; // CC-29 colors
      const borderWidth = isSelected ? 2 : 1;
      swatch.stroke({ color: borderColor, width: borderWidth });
    });

    // Call callback
    if (this.onColorSelect) {
      this.onColorSelect(color);
    }
  }

  /**
   * Gets the currently selected color
   */
  getSelectedColor(): number | undefined {
    return this.selectedColor;
  }

  /**
   * Sets the selected color programmatically
   */
  setSelectedColor(color: number): void {
    this.selectColor(color);
  }
}

