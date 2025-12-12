/**
 * Sprite Carousel Component
 * A reusable carousel/dock-style selector for displaying sprites
 * Supports both horizontal (arc) and vertical (dock) orientations
 */
import * as PIXI from 'pixi.js';
import { Container, Sprite, Graphics, Texture, Text } from 'pixi.js';

export interface CarouselItem {
  id: string;
  texture: Texture;
  label?: string;
}

export type CarouselOrientation = 'horizontal' | 'vertical';

export interface CarouselConfig {
  /** Width of the carousel bar */
  width: number;
  /** Height of the carousel bar */
  height: number;
  /** Orientation: 'horizontal' (arc) or 'vertical' (dock) */
  orientation?: CarouselOrientation;
  /** Maximum scale for center/focused item (default: 1.0) */
  centerScale?: number;
  /** Minimum scale for side items (default: 0.5) */
  sideScale?: number;
  /** Spacing between items (default: 20) */
  itemSpacing?: number;
  /** Arc curvature amount for horizontal mode (default: 30) */
  arcCurve?: number;
  /** Background color (default: 0x2a2a3e) */
  backgroundColor?: number;
  /** Reticle color for selected item (default: 0x00ff00) */
  reticleColor?: number;
  /** Show labels (default: true) */
  showLabels?: boolean;
  /** Show add button (default: false) */
  showAddButton?: boolean;
  /** Thumbnail size for vertical mode (default: 64) */
  thumbnailSize?: number;
}

export class SpriteCarousel extends Container {
  private config: Required<CarouselConfig>;
  private items: CarouselItem[] = [];
  private selectedIndex: number = 0;
  private itemSprites: Sprite[] = [];
  private itemLabels: Text[] = [];
  private background: Graphics;
  private reticle: Graphics;
  private addButton: Graphics | null = null;
  private onSelectCallback?: (item: CarouselItem, index: number) => void;
  private onAddClickCallback?: () => void;

  constructor(config: CarouselConfig) {
    super();

    // Set defaults
    this.config = {
      width: config.width,
      height: config.height,
      orientation: config.orientation ?? 'horizontal',
      centerScale: config.centerScale ?? 1.0,
      sideScale: config.sideScale ?? 0.5,
      itemSpacing: config.itemSpacing ?? 20,
      arcCurve: config.arcCurve ?? 30,
      backgroundColor: config.backgroundColor ?? 0x2a2a3e,
      reticleColor: config.reticleColor ?? 0x00ff00,
      showLabels: config.showLabels ?? true,
      showAddButton: config.showAddButton ?? false,
      thumbnailSize: config.thumbnailSize ?? 64
    };

    // Create background
    this.background = new Graphics();
    this.drawBackground();
    this.addChild(this.background);

    // Create reticle
    this.reticle = new Graphics();
    this.addChild(this.reticle);

    // Create add button if enabled
    if (this.config.showAddButton) {
      this.createAddButton();
    }

    // Enable clipping mask
    const mask = new Graphics();
    mask.rect(0, 0, this.config.width, this.config.height);
    mask.fill({ color: 0xffffff });
    this.addChild(mask);
    this.mask = mask;

    // Enable mouse wheel
    this.eventMode = 'static';
    this.hitArea = new PIXI.Rectangle(0, 0, this.config.width, this.config.height);

    this.on('wheel', (e: any) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1;
      this.cycleSelection(delta);
    });
  }

  /**
   * Draw background (no shadow - parent CardPanel provides it)
   */
  private drawBackground(): void {
    this.background.clear();
    this.background.rect(0, 0, this.config.width, this.config.height);
    this.background.fill({ color: this.config.backgroundColor, alpha: 1 });
  }

  /**
   * Create the add button at the bottom (for vertical) or right (for horizontal)
   */
  private createAddButton(): void {
    this.addButton = new Graphics();
    this.addButton.eventMode = 'static';
    this.addButton.cursor = 'pointer';

    this.drawAddButton();

    this.addButton.on('pointerdown', () => {
      if (this.onAddClickCallback) {
        this.onAddClickCallback();
      }
    });

    this.addButton.on('pointerover', () => {
      this.drawAddButton(true);
    });

    this.addButton.on('pointerout', () => {
      this.drawAddButton(false);
    });

    this.addChild(this.addButton);
  }

  /**
   * Draw the add button
   */
  private drawAddButton(hovered: boolean = false): void {
    if (!this.addButton) return;

    this.addButton.clear();

    const size = this.config.thumbnailSize - 16;
    const color = hovered ? 0x8ab832 : 0x7a9a32; // Muted lime green

    if (this.config.orientation === 'vertical') {
      // Position at bottom center
      const x = (this.config.width - size) / 2;
      const y = this.config.height - size - 12;

      this.addButton.roundRect(x, y, size, size, 8);
      this.addButton.fill({ color: color, alpha: 0.9 });
      this.addButton.stroke({ color: 0x9acd32, width: 2 });

      // Draw plus icon
      const centerX = x + size / 2;
      const centerY = y + size / 2;
      const iconSize = size * 0.4;

      this.addButton.moveTo(centerX - iconSize / 2, centerY);
      this.addButton.lineTo(centerX + iconSize / 2, centerY);
      this.addButton.moveTo(centerX, centerY - iconSize / 2);
      this.addButton.lineTo(centerX, centerY + iconSize / 2);
      this.addButton.stroke({ color: 0xffffff, width: 3 });
    } else {
      // Position at right center for horizontal
      const x = this.config.width - size - 12;
      const y = (this.config.height - size) / 2;

      this.addButton.roundRect(x, y, size, size, 8);
      this.addButton.fill({ color: color, alpha: 0.9 });
      this.addButton.stroke({ color: 0x9acd32, width: 2 });

      // Draw plus icon
      const centerX = x + size / 2;
      const centerY = y + size / 2;
      const iconSize = size * 0.4;

      this.addButton.moveTo(centerX - iconSize / 2, centerY);
      this.addButton.lineTo(centerX + iconSize / 2, centerY);
      this.addButton.moveTo(centerX, centerY - iconSize / 2);
      this.addButton.lineTo(centerX, centerY + iconSize / 2);
      this.addButton.stroke({ color: 0xffffff, width: 3 });
    }
  }

  /**
   * Set items to display in carousel
   */
  setItems(items: CarouselItem[]): void {
    this.items = items;
    this.selectedIndex = Math.min(this.selectedIndex, Math.max(0, items.length - 1));
    this.renderItems();
  }

  /**
   * Add a single item to the carousel
   */
  addItem(item: CarouselItem): void {
    this.items.push(item);
    this.renderItems();
  }

  /**
   * Remove an item by ID
   */
  removeItem(id: string): void {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return;

    this.items.splice(index, 1);

    // Adjust selected index if needed
    if (this.selectedIndex >= this.items.length) {
      this.selectedIndex = Math.max(0, this.items.length - 1);
    }

    this.renderItems();

    // Notify if selection changed
    if (this.items.length > 0) {
      this.notifySelection();
    }
  }

  /**
   * Select item by ID
   */
  selectById(id: string): void {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.setSelectedIndex(index);
    }
  }

  /**
   * Get item count
   */
  getItemCount(): number {
    return this.items.length;
  }

  /**
   * Get currently selected item
   */
  getSelectedItem(): CarouselItem | null {
    if (this.items.length === 0) return null;
    return this.items[this.selectedIndex];
  }

  /**
   * Get selected index
   */
  getSelectedIndex(): number {
    return this.selectedIndex;
  }

  /**
   * Set selected index
   */
  setSelectedIndex(index: number): void {
    if (index < 0 || index >= this.items.length) return;
    this.selectedIndex = index;
    this.renderItems();
    this.notifySelection();
  }

  /**
   * Cycle selection by delta
   */
  cycleSelection(delta: number): void {
    if (this.items.length === 0) return;

    this.selectedIndex = (this.selectedIndex + delta + this.items.length) % this.items.length;
    this.renderItems();
    this.notifySelection();
  }

  /**
   * Register callback for selection changes
   */
  onSelect(callback: (item: CarouselItem, index: number) => void): void {
    this.onSelectCallback = callback;
  }

  /**
   * Register callback for add button click
   */
  onAddClick(callback: () => void): void {
    this.onAddClickCallback = callback;
  }

  /**
   * Notify selection change
   */
  private notifySelection(): void {
    const item = this.getSelectedItem();
    if (item && this.onSelectCallback) {
      this.onSelectCallback(item, this.selectedIndex);
    }
  }

  /**
   * Render all items
   */
  private renderItems(): void {
    if (this.config.orientation === 'vertical') {
      this.renderVertical();
    } else {
      this.renderHorizontal();
    }
  }

  /**
   * Render horizontal (arc) layout
   */
  private renderHorizontal(): void {
    // Clear existing sprites
    this.clearSprites();

    if (this.items.length === 0) return;

    const centerX = this.config.width / 2;
    const centerY = this.config.height / 2;

    // Calculate how many items can fit based on width
    const maxSize = this.config.height * 0.6;
    const estimatedItemWidth = maxSize * this.config.centerScale + this.config.itemSpacing;
    const maxVisibleItems = Math.floor(this.config.width / estimatedItemWidth);
    const visibleCount = Math.min(Math.max(3, maxVisibleItems), this.items.length);

    // Calculate visible range
    const halfVisible = Math.floor(visibleCount / 2);
    const startIndex = this.selectedIndex - halfVisible;

    // Render items
    for (let i = 0; i < visibleCount; i++) {
      const itemIndex = (startIndex + i + this.items.length) % this.items.length;
      const item = this.items[itemIndex];

      if (!item || !item.texture) continue;

      // Create sprite
      const sprite = new Sprite(item.texture);
      sprite.anchor.set(0.5);
      sprite.texture.source.scaleMode = 'nearest';

      // Calculate position relative to center
      const offsetFromCenter = i - halfVisible;

      // Position along arc
      const xOffset = offsetFromCenter * (this.config.width / (visibleCount + 1));
      const yOffset = Math.abs(offsetFromCenter) * this.config.arcCurve;

      sprite.x = centerX + xOffset;
      sprite.y = centerY + yOffset;

      // Scale based on distance from center
      const distanceRatio = Math.abs(offsetFromCenter) / halfVisible;
      const scale = this.config.centerScale -
        (this.config.centerScale - this.config.sideScale) * distanceRatio;

      // Fit sprite to a reasonable size
      const spriteScale = Math.min(
        maxSize / sprite.width,
        maxSize / sprite.height
      ) * scale;

      sprite.scale.set(spriteScale);

      // Alpha based on distance
      sprite.alpha = 1.0 - (distanceRatio * 0.5);

      // Make clickable
      sprite.eventMode = 'static';
      sprite.cursor = 'pointer';
      sprite.on('pointerdown', () => {
        this.setSelectedIndex(itemIndex);
      });

      this.addChild(sprite);
      this.itemSprites.push(sprite);
    }

    // Draw reticle around center item
    this.drawReticleHorizontal();
  }

  /**
   * Render vertical (dock) layout
   */
  private renderVertical(): void {
    // Clear existing sprites
    this.clearSprites();

    if (this.items.length === 0) return;

    const thumbSize = this.config.thumbnailSize;
    const spacing = this.config.itemSpacing;
    const startX = (this.config.width - thumbSize) / 2;
    const startY = 12;

    // Calculate how many items can fit
    const availableHeight = this.config.height - (this.config.showAddButton ? thumbSize + 24 : 0) - startY;
    const maxVisibleItems = Math.floor(availableHeight / (thumbSize + spacing));

    // Calculate scroll offset to keep selected item visible
    const visibleStart = Math.max(0, Math.min(
      this.selectedIndex - Math.floor(maxVisibleItems / 2),
      this.items.length - maxVisibleItems
    ));

    // Render visible items
    for (let i = 0; i < Math.min(maxVisibleItems, this.items.length); i++) {
      const itemIndex = visibleStart + i;
      if (itemIndex >= this.items.length) break;

      const item = this.items[itemIndex];
      if (!item || !item.texture) continue;

      // Create sprite
      const sprite = new Sprite(item.texture);
      sprite.anchor.set(0.5);
      sprite.texture.source.scaleMode = 'nearest';

      // Position
      const y = startY + i * (thumbSize + spacing) + thumbSize / 2;
      sprite.x = startX + thumbSize / 2;
      sprite.y = y;

      // Scale to fit thumbnail size
      const scaleX = thumbSize / sprite.width;
      const scaleY = thumbSize / sprite.height;
      const scale = Math.min(scaleX, scaleY) * 0.85;
      sprite.scale.set(scale);

      // Highlight if selected
      const isSelected = itemIndex === this.selectedIndex;
      sprite.alpha = isSelected ? 1.0 : 0.7;

      // Make clickable
      sprite.eventMode = 'static';
      sprite.cursor = 'pointer';
      sprite.on('pointerdown', () => {
        this.setSelectedIndex(itemIndex);
      });

      this.addChild(sprite);
      this.itemSprites.push(sprite);

      // Add label if enabled
      if (this.config.showLabels && item.label) {
        const label = new Text({
          text: this.truncateLabel(item.label, 12),
          style: {
            fontFamily: 'Arial',
            fontSize: 10,
            fill: isSelected ? 0xffffff : 0xaaaaaa,
            align: 'center'
          }
        });
        label.anchor.set(0.5, 0);
        label.x = sprite.x;
        label.y = y + thumbSize / 2 + 4;
        this.addChild(label);
        this.itemLabels.push(label);
      }
    }

    // Draw reticle around selected item
    this.drawReticleVertical();
  }

  /**
   * Truncate label to max length
   */
  private truncateLabel(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 2) + '..';
  }

  /**
   * Clear all sprites and labels
   */
  private clearSprites(): void {
    this.itemSprites.forEach(sprite => sprite.destroy());
    this.itemSprites = [];
    this.itemLabels.forEach(label => label.destroy());
    this.itemLabels = [];
  }

  /**
   * Draw reticle for horizontal mode
   */
  private drawReticleHorizontal(): void {
    this.reticle.clear();

    if (this.items.length === 0) return;

    const centerSprite = this.itemSprites[Math.floor(this.itemSprites.length / 2)];
    if (!centerSprite) return;

    const padding = 10;
    const width = centerSprite.width + padding * 2;
    const height = centerSprite.height + padding * 2;

    this.reticle.rect(
      centerSprite.x - width / 2,
      centerSprite.y - height / 2,
      width,
      height
    );
    this.reticle.stroke({
      color: this.config.reticleColor,
      width: 2,
      alpha: 0.8
    });

    // Corner marks
    const cornerSize = 10;
    const corners = [
      { x: -width / 2, y: -height / 2 },
      { x: width / 2, y: -height / 2 },
      { x: -width / 2, y: height / 2 },
      { x: width / 2, y: height / 2 }
    ];

    corners.forEach(corner => {
      const baseX = centerSprite.x + corner.x;
      const baseY = centerSprite.y + corner.y;

      this.reticle.moveTo(baseX, baseY);
      this.reticle.lineTo(baseX + (corner.x > 0 ? -cornerSize : cornerSize), baseY);
      this.reticle.moveTo(baseX, baseY);
      this.reticle.lineTo(baseX, baseY + (corner.y > 0 ? -cornerSize : cornerSize));
    });

    this.reticle.stroke({
      color: this.config.reticleColor,
      width: 2,
      alpha: 0.8
    });
  }

  /**
   * Draw reticle for vertical mode
   */
  private drawReticleVertical(): void {
    this.reticle.clear();

    if (this.items.length === 0 || this.itemSprites.length === 0) return;

    // Find the sprite for the selected item
    const thumbSize = this.config.thumbnailSize;
    const spacing = this.config.itemSpacing;
    const availableHeight = this.config.height - (this.config.showAddButton ? thumbSize + 24 : 0) - 12;
    const maxVisibleItems = Math.floor(availableHeight / (thumbSize + spacing));
    const visibleStart = Math.max(0, Math.min(
      this.selectedIndex - Math.floor(maxVisibleItems / 2),
      this.items.length - maxVisibleItems
    ));

    const spriteIndex = this.selectedIndex - visibleStart;
    if (spriteIndex < 0 || spriteIndex >= this.itemSprites.length) return;

    const selectedSprite = this.itemSprites[spriteIndex];
    if (!selectedSprite) return;

    const padding = 6;
    const size = thumbSize + padding * 2;

    // Draw selection border
    this.reticle.roundRect(
      selectedSprite.x - size / 2,
      selectedSprite.y - size / 2,
      size,
      size,
      4
    );
    this.reticle.stroke({
      color: this.config.reticleColor,
      width: 2,
      alpha: 0.9
    });
  }

  /**
   * Update carousel (call in animation loop if needed)
   */
  update(): void {
    // Can add animations here if needed
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    this.clearSprites();
    super.destroy({ children: true });
  }
}
