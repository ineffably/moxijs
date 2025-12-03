import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { UIFocusManager } from '../core/ui-focus-manager';
import { ThemeResolver } from '../theming/theme-resolver';
import { LayoutEngine } from '../services';

/**
 * Props for configuring a UIRadioButton
 *
 * @category UI
 */
export interface UIRadioButtonProps {
  /** Whether the radio button is selected (controlled) */
  selected?: boolean;
  /** Default selected state (uncontrolled) */
  defaultSelected?: boolean;
  /** Change callback */
  onChange?: (selected: boolean) => void;
  /** Whether the radio button is disabled */
  disabled?: boolean;
  /** Size of the radio button (diameter) */
  size?: number;
  /** Background color when unselected (overrides theme) */
  backgroundColor?: number;
  /** Border color (overrides theme) */
  borderColor?: number;
  /** Fill color when selected (overrides theme) */
  selectedColor?: number;
  /** Border width */
  borderWidth?: number;
  /** Optional ThemeResolver for automatic color resolution */
  themeResolver?: ThemeResolver;
}

/**
 * A radio button control that can be selected or unselected.
 * Radio buttons are circular (unlike square checkboxes).
 * Follows DOM API patterns for familiarity.
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const radio = new UIRadioButton({
 *   selected: true,
 *   onChange: (selected) => console.log('Selected:', selected),
 *   size: 20
 * });
 * ```
 */
export class UIRadioButton extends UIComponent {
  // Services (composition)
  private props: Required<Omit<UIRadioButtonProps, 'onChange' | 'selected' | 'defaultSelected' | 'themeResolver'>>;
  private onChange?: (selected: boolean) => void;
  private selected: boolean;
  private isControlled: boolean;
  // Theme resolver is now in base class

  private radioGraphics: PIXI.Graphics;
  private dotGraphics: PIXI.Graphics;

  // Keyboard handler for cleanup
  private keydownHandler?: (e: KeyboardEvent) => void;

  constructor(props: UIRadioButtonProps = {}, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    this.isControlled = props.selected !== undefined;
    this.selected = props.selected ?? props.defaultSelected ?? false;
    this.themeResolver = props.themeResolver;

    // Resolve colors using ThemeResolver if provided, otherwise use defaults
    const resolver = this.themeResolver;
    this.props = {
      disabled: props.disabled ?? false,
      size: props.size ?? 20,
      backgroundColor: props.backgroundColor ?? resolver?.getColor('background') ?? 0xffffff,
      borderColor: props.borderColor ?? resolver?.getColor('border') ?? 0xcccccc,
      selectedColor: props.selectedColor ?? resolver?.getColor('selected') ?? 0x4a90e2,
      borderWidth: props.borderWidth ?? 2
    };

    this.onChange = props.onChange;

    // Set box model dimensions
    this.boxModel.width = this.props.size;
    this.boxModel.height = this.props.size;

    // Make radio button focusable by default
    this.tabIndex = 0;

    // Create graphics for radio button and dot
    this.radioGraphics = new PIXI.Graphics();
    // Ensure effects array is initialized
    if (this.radioGraphics.effects === null) {
      this.radioGraphics.effects = [];
    }
    this.dotGraphics = new PIXI.Graphics();
    // Ensure effects array is initialized
    if (this.dotGraphics.effects === null) {
      this.dotGraphics.effects = [];
    }
    this.container.addChild(this.radioGraphics);
    this.container.addChild(this.dotGraphics);

    // Set hit area for proper click detection
    this.container.hitArea = new PIXI.Rectangle(0, 0, this.props.size, this.props.size);

    // Setup interactivity
    this.setupInteractivity();

    // Initial render
    this.updateVisuals();

    // Initial disabled state
    if (this.props.disabled) {
      this.enabled = false;
      this.container.alpha = 0.6;
    }
  }

  /** @internal */
  private setupInteractivity(): void {
    this.makeInteractive('pointer');

    this.container.on('pointerover', this.handlePointerOver.bind(this));
    this.container.on('pointerout', this.handlePointerOut.bind(this));
    this.container.on('pointerdown', this.handlePointerDown.bind(this));
    this.container.on('pointerup', this.handlePointerUp.bind(this));
    this.container.on('pointerupoutside', this.handlePointerUpOutside.bind(this));

    // Keyboard support
    if (typeof window !== 'undefined') {
      this.keydownHandler = (e: KeyboardEvent) => {
        if (!this.focused || this.props.disabled) return;

        // Space to select
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          e.stopPropagation();
          this.setSelected(true);
        }
      };
      window.addEventListener('keydown', this.keydownHandler);
    }
  }

  private handlePointerOver(): void {
    if (this.props.disabled) return;
    this.updateVisuals();
  }

  private handlePointerOut(): void {
    if (this.props.disabled) return;
    this.updateVisuals();
  }

  private handlePointerDown(): void {
    if (this.props.disabled) return;
    // Visual feedback handled in updateVisuals
  }

  private handlePointerUp(): void {
    if (this.props.disabled) return;
    this.setSelected(true);
  }

  private handlePointerUpOutside(): void {
    if (this.props.disabled) return;
    this.updateVisuals();
  }

  /**
   * Set the selected state
   */
  public setSelected(selected: boolean): void {
    if (this.props.disabled) return;
    
    // In controlled mode, don't update internal state
    // Parent should update the prop via updateSelected()
    if (this.isControlled) {
      if (selected === this.selected) return;
      // Call onChange to notify parent, but don't update internal state
      this.onChange?.(selected);
      return;
    }

    // Uncontrolled mode: update internal state
    const wasSelected = this.selected;
    this.selected = selected;
    
    // Only update visuals if state actually changed
    if (wasSelected !== selected) {
      this.updateVisuals();
      this.onChange?.(selected);
    }
  }

  /**
   * Get the current selected state
   */
  public getSelected(): boolean {
    return this.selected;
  }

  /**
   * Update the selected state (for controlled mode)
   */
  public updateSelected(selected: boolean): void {
    if (this.isControlled && selected !== this.selected) {
      this.selected = selected;
      this.updateVisuals();
    }
  }

  /** @internal */
  measure(): MeasuredSize {
    const contentSize: MeasuredSize = {
      width: this.props.size,
      height: this.props.size
    };
    
    return this.layoutEngine.measure(this.boxModel, contentSize);
  }

  /** @internal */
  layout(availableWidth: number, availableHeight: number): void {
    super.layout(availableWidth, availableHeight);
    
    // Ensure hitArea is set after layout (in case container was repositioned)
    this.container.hitArea = new PIXI.Rectangle(0, 0, this.props.size, this.props.size);
    
    // Ensure container is interactive
    if (this.container.eventMode === 'none' || this.container.eventMode === 'passive') {
      this.container.eventMode = 'static';
    }
  }

  /** @internal */
  protected render(): void {
    // Rendering is handled by updateVisuals()
  }

  /**
   * Set disabled state
   */
  public setDisabled(disabled: boolean): void {
    this.props.disabled = disabled;
    this.enabled = !disabled;
    this.container.alpha = disabled ? 0.5 : 1.0;
    this.container.cursor = disabled ? 'default' : 'pointer';
    this.updateVisuals();
  }

  /** @internal */
  private updateVisuals(): void {
    const size = this.props.size;
    const radius = size / 2;
    const isHovered = this.container.cursor === 'pointer' && !this.props.disabled;

    // Ensure hitArea is set (in case it was cleared)
    if (!this.container.hitArea || 
        (this.container.hitArea instanceof PIXI.Rectangle && 
         (this.container.hitArea.width !== size || this.container.hitArea.height !== size))) {
      this.container.hitArea = new PIXI.Rectangle(0, 0, size, size);
    }

    // Clear previous drawing
    this.radioGraphics.clear();
    this.dotGraphics.clear();

    // Disabled state colors (more muted/grayed out)
    const disabledBorderColor = 0x444444;
    const disabledSelectedColor = 0x555555;

    // Draw radio button circle (outer ring)
    const borderColor = this.props.disabled 
      ? disabledBorderColor 
      : (isHovered && !this.selected ? 0x999999 : this.props.borderColor);
    this.radioGraphics.circle(radius, radius, radius - this.props.borderWidth / 2);
    this.radioGraphics.stroke({ color: borderColor, width: this.props.borderWidth });

    // Draw inner dot if selected
    if (this.selected) {
      const dotRadius = radius * 0.4; // Inner dot is 40% of outer radius
      const dotColor = this.props.disabled ? disabledSelectedColor : this.props.selectedColor;
      this.dotGraphics.circle(radius, radius, dotRadius);
      this.dotGraphics.fill({ color: dotColor });
    }

    // Update cursor and alpha based on disabled state
    this.container.cursor = this.props.disabled ? 'default' : 'pointer';
    this.container.alpha = this.props.disabled ? 0.6 : 1.0;
  }

  /**
   * Clean up event listeners
   */
  public destroy(): void {
    if (typeof window !== 'undefined' && this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
    }
    super.destroy();
  }
}

