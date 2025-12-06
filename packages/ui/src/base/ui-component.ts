import * as PIXI from 'pixi.js';
import { BoxModel, ComputedLayout, MeasuredSize, createDefaultBoxModel, FlexProps } from './box-model';
import { LayoutEngine } from '../services';
import { ThemeResolver } from '../theming/theme-resolver';
import { createDefaultDarkTheme } from '../theming/theme-data';
import {
  LayoutNode,
  createLayoutNode,
  ComputedLayout as FlexComputedLayout,
} from '../layout/layout-types';
import {
  IFlexLayoutParticipant,
  syncBoxModelToLayoutStyle,
} from '../layout/layout-participant';

// Unique ID counter for layout nodes
let nextLayoutId = 0;
function generateLayoutId(): string {
  return `ui-${nextLayoutId++}`;
}

/**
 * Font configuration that can be inherited from parent containers.
 * Like CSS, these settings cascade down the component tree.
 */
export interface UIFontConfig {
  /** MSDF font family name for crisp text at any scale */
  msdfFontFamily?: string;
  /** Default font family for canvas text */
  fontFamily?: string;
  /** Default font size */
  fontSize?: number;
  /** Default font weight ('normal', 'bold', or numeric 100-900) */
  fontWeight?: 'normal' | 'bold' | number;
  /** Default text color */
  textColor?: number;
}

/**
 * Layout configuration that can be inherited.
 * Allows setting shared layout defaults (like control height, border radius)
 * that cascade down to children.
 */
export interface UILayoutConfig {
  /** Default padding for children containers */
  defaultPadding?: number;
  /** Default margin for children */
  defaultMargin?: number;
  /** Default border radius for controls/panels */
  borderRadius?: number;
  /** Standard height for interactive controls (buttons, inputs) */
  controlHeight?: number;
}

/**
 * Base abstract class for all UI components
 * Provides box model, layout, and rendering functionality.
 *
 * Implements IFlexLayoutParticipant for integration with the new flex layout system.
 * Components can be added to a LayoutTree for automatic layout management.
 *
 * @category UI
 */
export abstract class UIComponent implements IFlexLayoutParticipant {
  /**
   * The PIXI container that holds this component's visual representation
   */
  public container: PIXI.Container;

  /**
   * The box model defining this component's sizing and spacing
   */
  protected boxModel: BoxModel;

  /**
   * Focus ring for visual focus indication
   */
  protected focusRing?: PIXI.Graphics;

  /**
   * The computed layout after measurement and positioning
   */
  protected computedLayout: ComputedLayout;

  /**
   * Reference to parent component (if any)
   */
  public parent?: UIComponent;

  /**
   * Whether this component is currently visible
   */
  public visible: boolean = true;

  /**
   * Whether this component is enabled for interaction
   */
  public enabled: boolean = true;

  /**
   * Flag indicating if layout needs to be recalculated
   */
  protected layoutDirty: boolean = true;

  /**
   * Layout engine service for calculating layouts
   * Initialized in base class so all components have access to layout calculations
   */
  protected layoutEngine: LayoutEngine;

  /**
   * Tab index for focus order (-1 means not focusable by tab)
   */
  public tabIndex: number = -1;

  /**
   * Internal focus state
   */
  protected focused: boolean = false;

  /**
   * Hover state (for components that track hover)
   */
  protected hovered: boolean = false;

  /**
   * Pressed state (for components that track press)
   */
  protected pressed: boolean = false;

  /**
   * Optional theme resolver for color resolution
   * Components can set this to enable automatic theming
   */
  protected themeResolver?: ThemeResolver;

  /**
   * Default theme resolver (lazy initialized)
   */
  private defaultThemeResolver?: ThemeResolver;

  /**
   * Font configuration for this component.
   * Children inherit these settings (like CSS font inheritance).
   * Set via setFontConfig() and resolved via getInheritedFont* methods.
   */
  protected fontConfig?: UIFontConfig;

  /**
   * Layout configuration for this component.
   * Children inherit these defaults unless overridden.
   */
  protected layoutConfig?: UILayoutConfig;

  // === IFlexLayoutParticipant Implementation ===

  /**
   * Unique identifier for this component in the layout tree
   */
  public readonly id: string;

  /**
   * Layout node for the new flex layout system.
   * Synced from boxModel when using LayoutTree.
   */
  private _layoutNode: LayoutNode;

  /**
   * Get the layout node (IFlexLayoutParticipant)
   */
  get layoutNode(): LayoutNode {
    return this._layoutNode;
  }

  constructor(boxModel?: Partial<BoxModel>) {
    this.container = new PIXI.Container();
    this.boxModel = createDefaultBoxModel(boxModel);
    this.computedLayout = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      contentX: 0,
      contentY: 0,
      contentWidth: 0,
      contentHeight: 0
    };

    // Use shared layout engine singleton (stateless, pure functions)
    this.layoutEngine = LayoutEngine.getInstance();

    // Initialize flex layout integration
    this.id = generateLayoutId();
    this._layoutNode = createLayoutNode(this.id);

    // Set up measurement function for layout node
    this._layoutNode.measureFn = () => this.measureContent();

    // Initial sync
    this.syncLayoutStyle();

    // Create focus ring (initially hidden)
    this.createFocusRing();
  }

  /**
   * Creates the focus ring graphics
   */
  private createFocusRing(): void {
    this.focusRing = new PIXI.Graphics();
    this.focusRing.visible = false;
    // Add as first child so it renders behind content
    this.container.addChildAt(this.focusRing, 0);
  }

  /**
   * Updates the focus ring appearance based on component size.
   * Uses theme colors for consistent styling.
   */
  protected updateFocusRing(): void {
    if (!this.focusRing) return;

    this.focusRing.clear();

    const width = this.computedLayout.width;
    const height = this.computedLayout.height;

    if (width <= 0 || height <= 0) return;

    // Get focus color from theme
    const focusColor = this.resolveColor('focus');

    // Animated pulsing effect with dashed outline
    const offset = 4;
    const strokeWidth = 3;

    // Draw outer glow
    this.focusRing.roundRect(
      -offset - 2,
      -offset - 2,
      width + (offset + 2) * 2,
      height + (offset + 2) * 2,
      8
    );
    this.focusRing.stroke({
      color: focusColor,
      width: strokeWidth + 2,
      alpha: 0.3
    });

    // Draw main focus ring
    this.focusRing.roundRect(
      -offset,
      -offset,
      width + offset * 2,
      height + offset * 2,
      8
    );
    this.focusRing.stroke({
      color: focusColor,
      width: strokeWidth
    });

    // Draw inner highlight (use text color for contrast)
    const highlightColor = this.resolveColor('text');
    this.focusRing.roundRect(
      -offset + strokeWidth,
      -offset + strokeWidth,
      width + (offset - strokeWidth) * 2,
      height + (offset - strokeWidth) * 2,
      6
    );
    this.focusRing.stroke({
      color: highlightColor,
      width: 1,
      alpha: 0.6
    });
  }

  /**
   * Measures the size this component needs
   * Must be implemented by subclasses
   *
   * @returns The measured width and height
   */
  abstract measure(): MeasuredSize;

  /**
   * Performs layout for this component within the given available space
   * Default implementation uses LayoutEngine. Override if custom layout logic is needed.
   *
   * @param availableWidth - Available width in pixels
   * @param availableHeight - Available height in pixels
   */
  layout(availableWidth: number, availableHeight: number): void {
    const measured = this.measure();

    // Use LayoutEngine to calculate layout
    this.computedLayout = this.layoutEngine.layout(
      this.boxModel,
      measured,
      { width: availableWidth, height: availableHeight }
    );

    this.layoutDirty = false;
    this.render();
  }

  /**
   * Renders the component's visuals
   * Called after layout is complete
   */
  protected abstract render(): void;

  /**
   * Marks this component's layout as dirty, requiring recalculation
   */
  public markLayoutDirty(): void {
    this.layoutDirty = true;

    // Sync to layout node when dirty
    this.syncLayoutStyle();

    if (this.parent) {
      this.parent.markLayoutDirty();
    }
  }

  /**
   * Gets the computed layout of this component
   */
  public getLayout(): ComputedLayout {
    return this.computedLayout;
  }

  /**
   * Gets the box model of this component
   */
  public getBoxModel(): BoxModel {
    return this.boxModel;
  }

  /**
   * Gets the global bounds of this component (position relative to stage)
   */
  public getGlobalBounds(): { x: number; y: number; width: number; height: number } {
    const globalPos = this.container.getGlobalPosition();
    return {
      x: globalPos.x,
      y: globalPos.y,
      width: this.computedLayout.width,
      height: this.computedLayout.height
    };
  }

  /**
   * Sets the position of this component
   */
  public setPosition(x: number, y: number): void {
    this.computedLayout.x = x;
    this.computedLayout.y = y;
    this.container.position.set(x, y);
  }

  /**
   * Shows this component
   */
  public show(): void {
    this.visible = true;
    this.container.visible = true;
  }

  /**
   * Hides this component
   */
  public hide(): void {
    this.visible = false;
    this.container.visible = false;
  }

  /**
   * Whether this component can receive focus
   */
  public canFocus(): boolean {
    return this.enabled && this.visible && this.tabIndex >= 0;
  }

  /**
   * Whether this component is currently focused
   */
  public isFocused(): boolean {
    return this.focused;
  }

  /**
   * Called when component receives focus
   * Override in subclasses to customize focus behavior
   */
  public onFocus(): void {
    this.focused = true;
    this.showFocusRing();
    this.scrollIntoView();
  }

  /**
   * Shows the focus ring
   */
  protected showFocusRing(): void {
    if (this.focusRing) {
      this.updateFocusRing();
      this.focusRing.visible = true;
    }
  }

  /**
   * Scrolls this component into view if it's inside a scroll container
   */
  private scrollIntoView(): void {
    // Walk up the parent chain to find a scroll container
    let currentParent = this.parent;
    while (currentParent) {
      // Check if parent has scrollToComponent method (duck typing for UIScrollContainer)
      if ('scrollToComponent' in currentParent && typeof (currentParent as any).scrollToComponent === 'function') {
        (currentParent as any).scrollToComponent(this);
        break;
      }
      currentParent = currentParent.parent;
    }
  }

  /**
   * Called when component loses focus
   * Override in subclasses to customize blur behavior
   */
  public onBlur(): void {
    this.focused = false;
    this.hideFocusRing();
  }

  /**
   * Hides the focus ring
   */
  protected hideFocusRing(): void {
    if (this.focusRing) {
      this.focusRing.visible = false;
    }
  }

  /**
   * Get theme resolver (creates default if none provided)
   */
  protected getThemeResolver(): ThemeResolver {
    if (this.themeResolver) {
      return this.themeResolver;
    }
    if (!this.defaultThemeResolver) {
      this.defaultThemeResolver = new ThemeResolver(createDefaultDarkTheme());
    }
    return this.defaultThemeResolver;
  }

  /**
   * Resolve a color from theme with optional override
   * Simplifies color resolution across all components
   */
  protected resolveColor(type: 'background' | 'border' | 'text' | 'selected' | 'hover' | 'focus' | 'disabled', override?: number): number {
    return this.getThemeResolver().getColor(type, override);
  }

  /**
   * Resolve a control-specific color with optional override
   */
  protected resolveControlColor(controlType: 'checkbox' | 'textInput' | 'textArea' | 'button' | 'radio' | 'select', type: 'background' | 'border' | 'text', override?: number): number {
    return this.getThemeResolver().getControlColor(controlType, type, override);
  }

  /**
   * Resolve text color with optional override
   */
  protected resolveTextColor(override?: number): number {
    return this.getThemeResolver().getTextColor(override);
  }

  /**
   * Resolve placeholder color with optional override
   */
  protected resolvePlaceholderColor(override?: number): number {
    return this.getThemeResolver().getPlaceholderColor(override);
  }

  /**
   * Resolve checkmark color with optional override
   */
  protected resolveCheckmarkColor(override?: number): number {
    return this.getThemeResolver().getCheckmarkColor(override);
  }

  /**
   * Helper to make container interactive with common settings
   * Components can call this in setupInteractivity() or override for custom behavior
   * 
   * @param cursor - Cursor type ('pointer', 'text', 'default', etc.)
   */
  protected makeInteractive(cursor: string = 'pointer'): void {
    this.container.eventMode = 'static';
    this.container.cursor = cursor;
  }

  /**
   * Sets flex properties for this component
   */
  public setFlex(props: FlexProps): void {
    this.boxModel.flex = { ...this.boxModel.flex, ...props };
    this.markLayoutDirty();
  }

  /**
   * Sets flex grow factor
   */
  public setFlexGrow(grow: number): void {
    this.ensureFlex();
    this.boxModel.flex!.grow = grow;
    this.markLayoutDirty();
  }

  /**
   * Sets flex shrink factor
   */
  public setFlexShrink(shrink: number): void {
    this.ensureFlex();
    this.boxModel.flex!.shrink = shrink;
    this.markLayoutDirty();
  }

  /**
   * Sets flex basis
   */
  public setFlexBasis(basis: number | 'auto'): void {
    this.ensureFlex();
    this.boxModel.flex!.basis = basis;
    this.markLayoutDirty();
  }

  /**
   * Sets align-self property
   */
  public setAlignSelf(align: 'auto' | 'start' | 'end' | 'center' | 'stretch'): void {
    this.ensureFlex();
    this.boxModel.flex!.alignSelf = align;
    this.markLayoutDirty();
  }

  /**
   * Helper to ensure flex object exists
   */
  private ensureFlex(): void {
    if (!this.boxModel.flex) {
      this.boxModel.flex = {};
    }
  }

  /**
   * Sets font configuration for this component.
   * Children will inherit these settings (like CSS).
   */
  public setFontConfig(config: UIFontConfig): void {
    this.fontConfig = config;
  }

  /**
   * Gets the font configuration for this component.
   * Returns local config if set, otherwise undefined.
   */
  public getFontConfig(): UIFontConfig | undefined {
    return this.fontConfig;
  }

  /**
   * Generic helper for resolving inherited configuration values.
   * Walks up the parent chain to find a value, like CSS inheritance.
   *
   * @param key - The config key to resolve
   * @param localOverride - Optional local override value (highest priority)
   * @param localConfig - Local config object to check
   * @param getParentConfig - Function to get config from a parent component
   * @returns The resolved value or undefined
   */
  private resolveInheritedConfig<C, K extends keyof C>(
    key: K,
    localOverride: C[K] | undefined,
    localConfig: C | undefined,
    getParentConfig: (parent: UIComponent) => C | undefined
  ): C[K] | undefined {
    // Local override takes precedence
    if (localOverride !== undefined) {
      return localOverride;
    }

    // Check local config
    if (localConfig?.[key] !== undefined) {
      return localConfig[key];
    }

    // Walk up parent chain to find inherited value
    let currentParent = this.parent;
    while (currentParent) {
      const parentConfig = getParentConfig(currentParent);
      if (parentConfig?.[key] !== undefined) {
        return parentConfig[key];
      }
      currentParent = currentParent.parent;
    }

    return undefined;
  }

  /**
   * Resolves a font setting by walking up the parent chain.
   * Like CSS inheritance - returns local value if set, otherwise inherits from parent.
   *
   * @param key - The font config key to resolve
   * @param localOverride - Optional local override value
   * @returns The resolved value or undefined
   */
  protected resolveInheritedFont<K extends keyof UIFontConfig>(
    key: K,
    localOverride?: UIFontConfig[K]
  ): UIFontConfig[K] | undefined {
    return this.resolveInheritedConfig(
      key,
      localOverride,
      this.fontConfig,
      (parent) => parent.getFontConfig()
    );
  }

  /**
   * Gets the inherited MSDF font family (convenience method).
   * @param localOverride - Optional local override
   */
  protected getInheritedMsdfFontFamily(localOverride?: string): string | undefined {
    return this.resolveInheritedFont('msdfFontFamily', localOverride);
  }

  /**
   * Gets the inherited font family (convenience method).
   * @param localOverride - Optional local override
   */
  protected getInheritedFontFamily(localOverride?: string): string | undefined {
    return this.resolveInheritedFont('fontFamily', localOverride);
  }

  /**
   * Gets the inherited font size (convenience method).
   * @param localOverride - Optional local override
   */
  protected getInheritedFontSize(localOverride?: number): number | undefined {
    return this.resolveInheritedFont('fontSize', localOverride);
  }

  /**
   * Gets the inherited text color (convenience method).
   * @param localOverride - Optional local override
   */
  protected getInheritedTextColor(localOverride?: number): number | undefined {
    return this.resolveInheritedFont('textColor', localOverride);
  }

  /**
   * Sets layout configuration for this component.
   * Children will inherit these settings.
   */
  public setLayoutConfig(config: UILayoutConfig): void {
    this.layoutConfig = config;
  }

  /**
   * Gets the layout configuration for this component.
   */
  public getLayoutConfig(): UILayoutConfig | undefined {
    return this.layoutConfig;
  }

  /**
   * Resolves a layout setting by walking up the parent chain.
   * Allows components to adapt to their context (e.g. using parent's default padding).
   *
   * @param key - The layout config key to resolve
   * @param localOverride - Optional local override value
   * @returns The resolved value or undefined
   */
  protected resolveInheritedLayoutParam<K extends keyof UILayoutConfig>(
    key: K,
    localOverride?: UILayoutConfig[K]
  ): UILayoutConfig[K] | undefined {
    return this.resolveInheritedConfig(
      key,
      localOverride,
      this.layoutConfig,
      (parent) => parent.getLayoutConfig()
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // IFlexLayoutParticipant Methods
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Measure the intrinsic content size of this component.
   * Called by the flex layout engine during Pass 2 (measure).
   *
   * Override in subclasses that have intrinsic content size.
   * For containers that size based on children, return { width: 0, height: 0 }.
   *
   * @returns The content size in pixels
   */
  measureContent(): { width: number; height: number } {
    // Default implementation uses existing measure() method
    const measured = this.measure();
    return { width: measured.width, height: measured.height };
  }

  /**
   * Apply computed layout from the flex layout engine.
   * Called after layout computation completes.
   *
   * Updates both the internal computedLayout and PIXI container position.
   *
   * @param computed - The computed layout values
   */
  applyLayout(computed: FlexComputedLayout): void {
    // Update internal computed layout
    this.computedLayout = {
      x: computed.x,
      y: computed.y,
      width: computed.width,
      height: computed.height,
      contentX: computed.contentX,
      contentY: computed.contentY,
      contentWidth: computed.contentWidth,
      contentHeight: computed.contentHeight,
    };

    // Update PIXI container position
    this.container.position.set(computed.x, computed.y);

    // Mark as clean and render
    this.layoutDirty = false;
    this.render();
  }

  /**
   * Sync BoxModel properties to the layout node's style.
   * Called when BoxModel changes to keep the layout system in sync.
   */
  syncLayoutStyle(): void {
    syncBoxModelToLayoutStyle(this.boxModel, this._layoutNode.style);
  }

  /**
   * Destroys this component and cleans up resources
   */
  public destroy(): void {
    // Remove from parent first to prevent rendering issues
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    // Clean up layout node reference
    this._layoutNode.measureFn = null;

    // Ensure effects is initialized to prevent null reference errors during destruction
    if (this.container.effects === null) {
      this.container.effects = [];
    }
    this.container.destroy({ children: true });
  }
}
