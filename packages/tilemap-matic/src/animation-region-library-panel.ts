/**
 * Animation & Region Library Panel
 * Draggable, resizable CardPanel displaying animations and regions
 * with pan/zoom navigation for previews
 */
import {
  CardPanel,
  FlatCardStyle
} from '@moxijs/ui';
import {
  Container,
  Graphics,
  Sprite,
  Texture,
  AnimatedSprite,
  Rectangle,
  Text
} from 'pixi.js';
import { AnimationSequence, TileRegion, GridSettings } from './sprite-sheet-data';

// Storage keys for panel state
const LIBRARY_PANEL_POSITION_KEY = 'tilemap-matic-library-panel-position';
const LIBRARY_PANEL_SIZE_KEY = 'tilemap-matic-library-panel-size';

/**
 * Callbacks for library panel interactions
 */
export interface LibraryPanelCallbacks {
  /** Called when an animation is selected */
  onSelectAnimation?: (animation: AnimationSequence) => void;
  /** Called when a region is selected */
  onSelectRegion?: (region: TileRegion) => void;
  /** Called when selection is cleared */
  onClearSelection?: () => void;
  /** Called when an animation is renamed */
  onRenameAnimation?: (animationId: string, newName: string) => void;
  /** Called when a region is renamed */
  onRenameRegion?: (regionId: string, newName: string) => void;
  /** Called when an animation is deleted */
  onDeleteAnimation?: (animationId: string) => void;
  /** Called when a region is deleted */
  onDeleteRegion?: (regionId: string) => void;
}

/**
 * Props for the library panel
 */
export interface AnimationRegionLibraryPanelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  callbacks?: LibraryPanelCallbacks;
}

/**
 * Internal item representing an animation or region in the library
 */
interface LibraryItem {
  type: 'animation' | 'region';
  id: string;
  name: string;
  container: Container;
  preview: Container;
  nameLabel?: Text;
}

/**
 * Animation & Region Library Panel
 */
export class AnimationRegionLibraryPanel {
  private panel: CardPanel;
  private contentContainer: Container;
  private contentMask: Graphics;
  private itemsContainer: Container;
  private scrollbar: Graphics;
  private scrollbarThumb: Graphics;

  // Pan/zoom state
  private scale: number = 1;
  private panY: number = 0;
  private minScale: number = 0.5;
  private maxScale: number = 4;

  // Library items
  private items: LibraryItem[] = [];
  private selectedItemId: string | null = null;

  // Editing state
  private editingItemId: string | null = null;
  private editInput: HTMLInputElement | null = null;

  // Current sheet data
  private sheetTexture: Texture | null = null;
  private gridSettings: GridSettings | null = null;

  // Callbacks
  private callbacks: LibraryPanelCallbacks;

  // Layout constants
  private readonly PANEL_WIDTH: number;
  private readonly PANEL_HEIGHT: number;
  private readonly ITEM_HEIGHT = 60;
  private readonly ITEM_PADDING = 8;
  private readonly SECTION_HEADER_HEIGHT = 24;

  constructor(props: AnimationRegionLibraryPanelProps = {}) {
    this.callbacks = props.callbacks ?? {};

    // Load saved size or use defaults
    const savedSize = this.loadSize();
    this.PANEL_WIDTH = savedSize?.width ?? props.width ?? 200;
    this.PANEL_HEIGHT = savedSize?.height ?? props.height ?? 400;

    // Create the CardPanel with SE drop shadow
    this.panel = new CardPanel({
      title: { text: 'Animations / Regions', fontSize: 12 },
      bodyWidth: this.PANEL_WIDTH,
      bodyHeight: this.PANEL_HEIGHT,
      draggable: true,
      resizable: ['e', 'w', 's', 'se', 'sw'],
      minWidth: 150,
      minHeight: 200,
      style: new FlatCardStyle({
        showShadow: true,
        shadowOffset: 6,
        shadowAlpha: 0.4
      }),
      colors: {
        background: 0x222226,
        border: 0x404045,
        titleBar: 0x2a2a2e,
        titleText: 0x9acd32 // Muted lime green to match app title
      },
      onResize: (w, h) => this.handleResize(w, h),
      onMove: (x, y) => this.savePosition()
    });

    // Load saved position or use defaults
    const savedPosition = this.loadPosition();
    this.panel.x = savedPosition?.x ?? props.x ?? 10;
    this.panel.y = savedPosition?.y ?? props.y ?? 60;

    // Create content container with mask for clipping
    this.contentContainer = new Container();
    this.contentMask = new Graphics();
    this.updateMask();
    this.contentContainer.mask = this.contentMask;

    // Items container (scrollable content)
    this.itemsContainer = new Container();
    this.contentContainer.addChild(this.itemsContainer);

    // Scrollbar track (starts with padding from top)
    this.scrollbar = new Graphics();
    this.scrollbar.x = this.PANEL_WIDTH - 10;
    this.scrollbar.y = 4;

    // Scrollbar thumb
    this.scrollbarThumb = new Graphics();
    this.scrollbarThumb.x = this.PANEL_WIDTH - 10;
    this.scrollbarThumb.y = 4;

    // Add to panel body
    const body = this.panel.getBodyContainer();
    body.addChild(this.contentMask);
    body.addChild(this.contentContainer);
    body.addChild(this.scrollbar);
    body.addChild(this.scrollbarThumb);

    // Setup event listeners
    this.setupEventListeners();
    this.setupScrollbarInteraction();

    // Initial render
    this.renderEmptyState();
  }

  /**
   * Update the clipping mask
   */
  private updateMask(): void {
    this.contentMask.clear();
    this.contentMask.rect(0, 0, this.PANEL_WIDTH, this.PANEL_HEIGHT);
    this.contentMask.fill({ color: 0xffffff });
  }

  /**
   * Handle panel resize
   */
  private handleResize(width: number, height: number): void {
    // Update mask to new size
    this.contentMask.clear();
    this.contentMask.rect(0, 0, width, height);
    this.contentMask.fill({ color: 0xffffff });

    // Update scrollbar position
    this.scrollbar.x = width - 10;
    this.scrollbarThumb.x = width - 10;

    // Clamp pan position
    this.clampPan();

    // Re-render items to fit new width
    this.renderItems();
    this.updateScrollbar();

    // Save size to localStorage
    this.saveSize(width, height);
  }

  /**
   * Setup mouse/touch event listeners for pan and zoom
   */
  private setupEventListeners(): void {
    const body = this.panel.getBodyContainer();
    body.eventMode = 'static';

    // Mouse wheel for zoom
    body.on('wheel', (e: WheelEvent) => {
      e.preventDefault();

      const zoomSpeed = 0.1;
      const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
      const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale + delta));

      if (newScale !== this.scale) {
        this.scale = newScale;
        this.applyTransform();
      }
    });

    // Drag for vertical pan
    let isDragging = false;
    let lastY = 0;

    body.on('pointerdown', (e: PointerEvent) => {
      // Only pan with middle mouse or when holding shift
      if (e.button === 1 || e.shiftKey) {
        isDragging = true;
        lastY = e.clientY;
        e.stopPropagation();
      }
    });

    body.on('globalpointermove', (e: PointerEvent) => {
      if (!isDragging) return;

      const deltaY = e.clientY - lastY;
      lastY = e.clientY;

      this.panY += deltaY;
      this.clampPan();
      this.applyTransform();
    });

    body.on('pointerup', () => {
      isDragging = false;
    });

    body.on('pointerupoutside', () => {
      isDragging = false;
    });
  }

  /**
   * Clamp pan position to content bounds
   */
  private clampPan(): void {
    const contentHeight = this.getContentHeight();
    const viewportHeight = this.PANEL_HEIGHT;
    const scaledHeight = contentHeight * this.scale;

    if (scaledHeight <= viewportHeight) {
      // Content fits, no panning needed
      this.panY = 0;
    } else {
      // Clamp pan to valid range
      const maxPan = 0;
      const minPan = viewportHeight - scaledHeight;
      this.panY = Math.max(minPan, Math.min(maxPan, this.panY));
    }
  }

  /**
   * Get total content height
   */
  private getContentHeight(): number {
    let height = this.ITEM_PADDING;

    // Animations section
    const animations = this.items.filter(i => i.type === 'animation');
    if (animations.length > 0) {
      height += this.SECTION_HEADER_HEIGHT;
      height += animations.length * (this.ITEM_HEIGHT + this.ITEM_PADDING);
    }

    // Regions section
    const regions = this.items.filter(i => i.type === 'region');
    if (regions.length > 0) {
      height += this.SECTION_HEADER_HEIGHT;
      height += regions.length * (this.ITEM_HEIGHT + this.ITEM_PADDING);
    }

    return Math.max(height, 100);
  }

  /**
   * Apply pan/zoom transform to items container
   */
  private applyTransform(): void {
    this.itemsContainer.scale.set(this.scale);
    this.itemsContainer.y = this.panY;
    this.updateScrollbar();
  }

  /**
   * Update scrollbar appearance based on content and scroll position
   */
  private updateScrollbar(): void {
    const contentHeight = this.getContentHeight() * this.scale;
    const viewportHeight = this.PANEL_HEIGHT - 8; // Account for top/bottom padding
    const scrollbarWidth = 6;
    const trackHeight = viewportHeight;

    // Clear and redraw track
    this.scrollbar.clear();
    this.scrollbar.roundRect(0, 0, scrollbarWidth, trackHeight, 3);
    this.scrollbar.fill({ color: 0x2a2a2e, alpha: 0.5 });

    // Calculate thumb size and position
    if (contentHeight <= viewportHeight) {
      // Content fits, hide thumb
      this.scrollbarThumb.visible = false;
      return;
    }

    this.scrollbarThumb.visible = true;

    const thumbHeight = Math.max(20, (viewportHeight / contentHeight) * trackHeight);
    const scrollRange = contentHeight - viewportHeight;
    const scrollProgress = -this.panY / scrollRange;
    const thumbY = scrollProgress * (trackHeight - thumbHeight);

    // Draw thumb
    this.scrollbarThumb.clear();
    this.scrollbarThumb.roundRect(0, thumbY, scrollbarWidth, thumbHeight, 3);
    this.scrollbarThumb.fill({ color: 0x505058 });
  }

  /**
   * Setup scrollbar drag interaction
   */
  private setupScrollbarInteraction(): void {
    this.scrollbarThumb.eventMode = 'static';
    this.scrollbarThumb.cursor = 'pointer';

    let isDragging = false;
    let dragStartY = 0;
    let panStartY = 0;

    this.scrollbarThumb.on('pointerdown', (e: PointerEvent) => {
      isDragging = true;
      dragStartY = e.clientY;
      panStartY = this.panY;
      e.stopPropagation();
    });

    this.scrollbarThumb.on('globalpointermove', (e: PointerEvent) => {
      if (!isDragging) return;

      const contentHeight = this.getContentHeight() * this.scale;
      const viewportHeight = this.PANEL_HEIGHT - 4;

      if (contentHeight <= viewportHeight) return;

      const trackHeight = viewportHeight;
      const thumbHeight = Math.max(20, (viewportHeight / contentHeight) * trackHeight);
      const scrollRange = contentHeight - viewportHeight;
      const thumbRange = trackHeight - thumbHeight;

      const deltaY = e.clientY - dragStartY;
      const scrollDelta = (deltaY / thumbRange) * scrollRange;

      this.panY = panStartY - scrollDelta;
      this.clampPan();
      this.applyTransform();
    });

    this.scrollbarThumb.on('pointerup', () => { isDragging = false; });
    this.scrollbarThumb.on('pointerupoutside', () => { isDragging = false; });

    // Click on track to jump
    this.scrollbar.eventMode = 'static';
    this.scrollbar.cursor = 'pointer';
    this.scrollbar.on('pointerdown', (e: PointerEvent) => {
      const contentHeight = this.getContentHeight() * this.scale;
      const viewportHeight = this.PANEL_HEIGHT - 4;

      if (contentHeight <= viewportHeight) return;

      const localY = e.clientY - this.scrollbar.getGlobalPosition().y;
      const scrollProgress = localY / viewportHeight;
      const scrollRange = contentHeight - viewportHeight;

      this.panY = -scrollProgress * scrollRange;
      this.clampPan();
      this.applyTransform();
    });
  }

  /**
   * Update the library with new data
   */
  update(
    animations: AnimationSequence[],
    regions: TileRegion[],
    sheetTexture: Texture | null,
    gridSettings: GridSettings | null
  ): void {
    this.sheetTexture = sheetTexture;
    this.gridSettings = gridSettings;

    // Clear existing items
    this.clearItems();

    // Build new items
    for (const anim of animations) {
      this.items.push({
        type: 'animation',
        id: anim.id,
        name: anim.name,
        container: new Container(),
        preview: new Container()
      });
    }

    for (const region of regions) {
      this.items.push({
        type: 'region',
        id: region.id,
        name: region.name || `Region ${region.id.slice(-4)}`,
        container: new Container(),
        preview: new Container()
      });
    }

    // Render
    if (this.items.length === 0) {
      this.renderEmptyState();
    } else {
      this.renderItems();
    }
  }

  /**
   * Clear all library items
   */
  private clearItems(): void {
    for (const item of this.items) {
      item.container.destroy({ children: true });
    }
    this.items = [];
    this.itemsContainer.removeChildren();
  }

  /**
   * Render empty state message
   */
  private renderEmptyState(): void {
    this.itemsContainer.removeChildren();

    const emptyLabel = new Text({
      text: 'No animations or regions',
      style: {
        fontSize: 12,
        fill: 0x707078,
        fontFamily: 'Arial'
      }
    });
    emptyLabel.x = this.PANEL_WIDTH / 2 - 60;
    emptyLabel.y = this.PANEL_HEIGHT / 2 - 10;
    this.itemsContainer.addChild(emptyLabel);
  }

  /**
   * Render all library items
   */
  private renderItems(): void {
    this.itemsContainer.removeChildren();

    let y = this.ITEM_PADDING;

    // Animations section
    const animations = this.items.filter(i => i.type === 'animation');
    if (animations.length > 0) {
      // Section header
      const animHeader = this.createSectionHeader('Animations', animations.length);
      animHeader.y = y;
      this.itemsContainer.addChild(animHeader);
      y += this.SECTION_HEADER_HEIGHT;

      // Animation items
      for (const item of animations) {
        this.renderItem(item, y);
        this.itemsContainer.addChild(item.container);
        y += this.ITEM_HEIGHT + this.ITEM_PADDING;
      }
    }

    // Regions section
    const regions = this.items.filter(i => i.type === 'region');
    if (regions.length > 0) {
      // Section header
      const regionHeader = this.createSectionHeader('Regions', regions.length);
      regionHeader.y = y;
      this.itemsContainer.addChild(regionHeader);
      y += this.SECTION_HEADER_HEIGHT;

      // Region items
      for (const item of regions) {
        this.renderItem(item, y);
        this.itemsContainer.addChild(item.container);
        y += this.ITEM_HEIGHT + this.ITEM_PADDING;
      }
    }

    // Update pan bounds
    this.clampPan();
    this.applyTransform();
  }

  /**
   * Create a section header
   */
  private createSectionHeader(text: string, count: number): Container {
    const container = new Container();

    const bg = new Graphics();
    bg.rect(0, 0, this.PANEL_WIDTH - this.ITEM_PADDING * 2, this.SECTION_HEADER_HEIGHT);
    bg.fill({ color: 0x2a2a2e, alpha: 0.8 });
    container.addChild(bg);

    const label = new Text({
      text: `${text} (${count})`,
      style: {
        fontSize: 11,
        fill: 0x909095,
        fontFamily: 'Arial'
      }
    });
    label.x = this.ITEM_PADDING;
    label.y = 5;
    container.addChild(label);

    container.x = this.ITEM_PADDING;

    return container;
  }

  /**
   * Render a single library item
   */
  private renderItem(item: LibraryItem, y: number): void {
    const container = item.container;
    container.removeChildren();
    container.y = y;
    container.x = this.ITEM_PADDING;

    const itemWidth = this.PANEL_WIDTH - this.ITEM_PADDING * 2;
    const isSelected = item.id === this.selectedItemId;

    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, itemWidth, this.ITEM_HEIGHT, 4);
    bg.fill({ color: isSelected ? 0x3a3a40 : 0x2a2a2e });
    bg.stroke({ color: isSelected ? 0x9acd32 : 0x38383c, width: 1 });
    container.addChild(bg);

    // Preview area (left side)
    const previewSize = this.ITEM_HEIGHT - 8;
    const previewBg = new Graphics();
    previewBg.rect(4, 4, previewSize, previewSize);
    previewBg.fill({ color: 0x1a1a1e });
    container.addChild(previewBg);

    // Render preview content
    this.renderPreview(item, previewSize);
    item.preview.x = 4;
    item.preview.y = 4;
    container.addChild(item.preview);

    // Name label (right side) - use raw PIXI.Text (UILabel requires layout() call)
    const nameLabel = new Text({
      text: item.name,
      style: {
        fontSize: 11,
        fill: 0xc0c0c8,
        fontFamily: 'Arial'
      }
    });
    nameLabel.x = previewSize + 12;
    nameLabel.y = 8;
    container.addChild(nameLabel);
    item.nameLabel = nameLabel;

    // Type badge
    const typeLabel = new Text({
      text: item.type === 'animation' ? 'ANIM' : 'REGION',
      style: {
        fontSize: 9,
        fill: item.type === 'animation' ? 0x7a9a7a : 0x9a7a7a,
        fontFamily: 'Arial'
      }
    });
    typeLabel.x = previewSize + 12;
    typeLabel.y = 28;
    container.addChild(typeLabel);

    // Frame count for animations
    if (item.type === 'animation') {
      const animData = this.getAnimationData(item.id);
      if (animData) {
        const frameLabel = new Text({
          text: `${animData.frames.length} frames`,
          style: {
            fontSize: 9,
            fill: 0x707078,
            fontFamily: 'Arial'
          }
        });
        frameLabel.x = previewSize + 12;
        frameLabel.y = 42;
        container.addChild(frameLabel);
      }
    }

    // Delete button (top right corner)
    const deleteBtn = new Graphics();
    const deleteBtnSize = 16;
    deleteBtn.roundRect(0, 0, deleteBtnSize, deleteBtnSize, 3);
    deleteBtn.fill({ color: 0x443338 });
    deleteBtn.x = itemWidth - deleteBtnSize - 4;
    deleteBtn.y = 4;
    container.addChild(deleteBtn);

    // X icon on delete button
    const xIcon = new Text({
      text: '×',
      style: {
        fontSize: 12,
        fill: 0xaa6666,
        fontFamily: 'Arial'
      }
    });
    xIcon.x = itemWidth - deleteBtnSize + 1;
    xIcon.y = 2;
    container.addChild(xIcon);

    // Delete button interaction
    deleteBtn.eventMode = 'static';
    deleteBtn.cursor = 'pointer';
    deleteBtn.on('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.deleteItem(item);
    });

    // Make interactive
    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('pointerdown', () => this.selectItem(item));

    // Double-click to edit name
    let lastClickTime = 0;
    container.on('click', () => {
      const now = Date.now();
      if (now - lastClickTime < 300 && this.selectedItemId === item.id) {
        this.startEditing(item);
      }
      lastClickTime = now;
    });
  }

  /**
   * Render preview for an item
   */
  private renderPreview(item: LibraryItem, size: number): void {
    item.preview.removeChildren();

    if (!this.sheetTexture || !this.gridSettings) {
      // Placeholder
      const placeholder = new Graphics();
      placeholder.rect(0, 0, size, size);
      placeholder.fill({ color: 0x2a2a30 });
      item.preview.addChild(placeholder);
      return;
    }

    if (item.type === 'animation') {
      this.renderAnimationPreview(item, size);
    } else {
      this.renderRegionPreview(item, size);
    }
  }

  /**
   * Render animated preview for an animation item
   */
  private renderAnimationPreview(item: LibraryItem, size: number): void {
    const animData = this.getAnimationData(item.id);
    if (!animData || animData.frames.length === 0 || !this.sheetTexture || !this.gridSettings) {
      return;
    }

    const { cellWidth, cellHeight } = this.gridSettings;

    // Create textures for each frame
    const textures: Texture[] = [];
    for (const frame of animData.frames) {
      const frameRect = new Rectangle(
        frame.col * cellWidth,
        frame.row * cellHeight,
        cellWidth,
        cellHeight
      );
      const frameTexture = new Texture({
        source: this.sheetTexture.source,
        frame: frameRect
      });
      textures.push(frameTexture);
    }

    if (textures.length === 0) return;

    // Create animated sprite
    const animSprite = new AnimatedSprite(textures);
    animSprite.animationSpeed = 1000 / animData.frameDuration / 60; // Convert ms to animation speed
    animSprite.loop = animData.loop;
    animSprite.play();

    // Scale to fit preview
    const scale = Math.min(size / cellWidth, size / cellHeight);
    animSprite.scale.set(scale);

    // Center in preview area
    animSprite.x = (size - cellWidth * scale) / 2;
    animSprite.y = (size - cellHeight * scale) / 2;

    item.preview.addChild(animSprite);
  }

  /**
   * Render static preview for a region item
   */
  private renderRegionPreview(item: LibraryItem, size: number): void {
    const regionData = this.getRegionData(item.id);
    if (!regionData || !this.sheetTexture || !this.gridSettings) {
      return;
    }

    const { cellWidth, cellHeight } = this.gridSettings;

    // Create texture for region
    const regionRect = new Rectangle(
      regionData.col * cellWidth,
      regionData.row * cellHeight,
      regionData.colSpan * cellWidth,
      regionData.rowSpan * cellHeight
    );

    const regionTexture = new Texture({
      source: this.sheetTexture.source,
      frame: regionRect
    });

    const sprite = new Sprite(regionTexture);

    // Scale to fit preview
    const scale = Math.min(size / regionRect.width, size / regionRect.height);
    sprite.scale.set(scale);

    // Center in preview area
    sprite.x = (size - regionRect.width * scale) / 2;
    sprite.y = (size - regionRect.height * scale) / 2;

    item.preview.addChild(sprite);
  }

  /**
   * Get animation data by ID (from stored reference)
   */
  private getAnimationData(id: string): AnimationSequence | null {
    // This would need to be passed in or stored
    // For now, return null - will be updated when we integrate
    return this._animationsCache?.find(a => a.id === id) ?? null;
  }

  /**
   * Get region data by ID (from stored reference)
   */
  private getRegionData(id: string): TileRegion | null {
    return this._regionsCache?.find(r => r.id === id) ?? null;
  }

  // Cache for lookups
  private _animationsCache: AnimationSequence[] = [];
  private _regionsCache: TileRegion[] = [];

  /**
   * Update with full data including caches for lookup
   */
  updateWithData(
    animations: AnimationSequence[],
    regions: TileRegion[],
    sheetTexture: Texture | null,
    gridSettings: GridSettings | null
  ): void {
    this._animationsCache = animations;
    this._regionsCache = regions;
    this.update(animations, regions, sheetTexture, gridSettings);
  }

  /**
   * Select an item
   */
  private selectItem(item: LibraryItem): void {
    this.selectedItemId = item.id;

    // Re-render to show selection
    this.renderItems();

    // Notify callbacks
    if (item.type === 'animation') {
      const animData = this.getAnimationData(item.id);
      if (animData && this.callbacks.onSelectAnimation) {
        this.callbacks.onSelectAnimation(animData);
      }
    } else {
      const regionData = this.getRegionData(item.id);
      if (regionData && this.callbacks.onSelectRegion) {
        this.callbacks.onSelectRegion(regionData);
      }
    }
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.selectedItemId = null;
    this.cancelEditing();
    this.renderItems();
    this.callbacks.onClearSelection?.();
  }

  /**
   * Delete an item
   */
  private deleteItem(item: LibraryItem): void {
    // Clear selection if deleting selected item
    if (this.selectedItemId === item.id) {
      this.selectedItemId = null;
    }

    // Notify via callbacks
    if (item.type === 'animation' && this.callbacks.onDeleteAnimation) {
      this.callbacks.onDeleteAnimation(item.id);
    } else if (item.type === 'region' && this.callbacks.onDeleteRegion) {
      this.callbacks.onDeleteRegion(item.id);
    }
  }

  /**
   * Start editing an item's name
   */
  private startEditing(item: LibraryItem): void {
    if (this.editingItemId === item.id) return;

    // Cancel any existing edit
    this.cancelEditing();

    this.editingItemId = item.id;

    // Hide the text label
    if (item.nameLabel) {
      item.nameLabel.visible = false;
    }

    // Create HTML input for editing
    const input = document.createElement('input');
    input.type = 'text';
    input.value = item.name;
    input.style.cssText = `
      position: absolute;
      font-family: Arial, sans-serif;
      font-size: 11px;
      padding: 2px 4px;
      border: 1px solid #6060a0;
      border-radius: 3px;
      background: #1a1a2a;
      color: #d0d0e0;
      outline: none;
      width: 80px;
    `;

    // Position the input over the label
    const canvas = document.querySelector('canvas');
    if (canvas && item.nameLabel) {
      const canvasRect = canvas.getBoundingClientRect();
      const globalPos = item.nameLabel.getGlobalPosition();

      // Account for panel position and content scroll
      input.style.left = `${canvasRect.left + globalPos.x}px`;
      input.style.top = `${canvasRect.top + globalPos.y - 2}px`;
    }

    document.body.appendChild(input);
    this.editInput = input;

    // Focus and select
    input.focus();
    input.select();

    // Track if edit has been handled to prevent double-processing
    let editHandled = false;

    // Handle submit
    const submitEdit = () => {
      if (editHandled) return;
      editHandled = true;

      const newName = input.value.trim();
      if (newName && newName !== item.name) {
        item.name = newName;
        // Notify via callbacks
        if (item.type === 'animation' && this.callbacks.onRenameAnimation) {
          this.callbacks.onRenameAnimation(item.id, newName);
        } else if (item.type === 'region' && this.callbacks.onRenameRegion) {
          this.callbacks.onRenameRegion(item.id, newName);
        }
      }
      this.finishEditing();
    };

    // Handle cancel
    const cancelEdit = () => {
      if (editHandled) return;
      editHandled = true;
      this.cancelEditing();
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitEdit();
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
    });

    input.addEventListener('blur', submitEdit);
  }

  /**
   * Cancel editing without saving
   */
  private cancelEditing(): void {
    if (!this.editingItemId) return;

    const item = this.items.find(i => i.id === this.editingItemId);
    if (item?.nameLabel) {
      item.nameLabel.visible = true;
    }

    if (this.editInput) {
      this.editInput.remove();
      this.editInput = null;
    }

    this.editingItemId = null;
  }

  /**
   * Finish editing and clean up
   */
  private finishEditing(): void {
    if (!this.editingItemId) return;

    const item = this.items.find(i => i.id === this.editingItemId);

    if (this.editInput) {
      this.editInput.remove();
      this.editInput = null;
    }

    this.editingItemId = null;

    // Re-render to update the label
    this.renderItems();
  }

  /**
   * Get the panel for adding to scene
   */
  getPanel(): CardPanel {
    return this.panel;
  }

  /**
   * Set panel position
   */
  setPosition(x: number, y: number): void {
    this.panel.x = x;
    this.panel.y = y;
  }

  /**
   * Save panel position to localStorage
   */
  private savePosition(): void {
    try {
      const position = { x: this.panel.x, y: this.panel.y };
      localStorage.setItem(LIBRARY_PANEL_POSITION_KEY, JSON.stringify(position));
    } catch (e) {
      // Silently fail if localStorage is unavailable
    }
  }

  /**
   * Load panel position from localStorage
   */
  private loadPosition(): { x: number; y: number } | null {
    try {
      const saved = localStorage.getItem(LIBRARY_PANEL_POSITION_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Silently fail if localStorage is unavailable
    }
    return null;
  }

  /**
   * Save panel size to localStorage
   */
  private saveSize(width: number, height: number): void {
    try {
      const size = { width, height };
      localStorage.setItem(LIBRARY_PANEL_SIZE_KEY, JSON.stringify(size));
    } catch (e) {
      // Silently fail if localStorage is unavailable
    }
  }

  /**
   * Load panel size from localStorage
   */
  private loadSize(): { width: number; height: number } | null {
    try {
      const saved = localStorage.getItem(LIBRARY_PANEL_SIZE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Silently fail if localStorage is unavailable
    }
    return null;
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    this.clearItems();
    this.panel.destroy();
  }
}
