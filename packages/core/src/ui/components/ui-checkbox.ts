import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { UIFocusManager } from '../core/ui-focus-manager';
import { ThemeResolver } from '../theming/theme-resolver';
import { DefaultUITheme, createDefaultDarkTheme } from '../theming/theme-data';
import {
  LayoutEngine,
  FormStateManager,
  ThemeApplier,
  ComponentState
} from '../services';

/**
 * Props for configuring a UICheckbox
 *
 * @category UI
 */
export interface UICheckboxProps {
  /** Whether the checkbox is checked (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Change callback */
  onChange?: (checked: boolean) => void;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Size of the checkbox (square dimensions) */
  size?: number;
  /** Background color when unchecked (overrides theme) */
  backgroundColor?: number;
  /** Border color (overrides theme) */
  borderColor?: number;
  /** Checkmark color (overrides theme) */
  checkColor?: number;
  /** Background color when checked (overrides theme) */
  checkedBackgroundColor?: number;
  /** Border radius */
  borderRadius?: number;
  /** Optional ThemeResolver for automatic color resolution */
  themeResolver?: ThemeResolver;
}

/**
 * A checkbox control that can be checked or unchecked.
 * Follows DOM API patterns for familiarity.
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const checkbox = new UICheckbox({
 *   checked: true,
 *   onChange: (checked) => console.log('Checked:', checked),
 *   size: 20
 * });
 * ```
 */
export class UICheckbox extends UIComponent {
  // Props
  private props: Required<Omit<UICheckboxProps, 'onChange' | 'checked' | 'defaultChecked' | 'themeResolver'>>;
  
  // Services (composition)
  private layoutEngine: LayoutEngine;
  private stateManager: FormStateManager<boolean>;
  private themeApplier: ThemeApplier;
  
  // Visual elements
  private checkboxGraphics: PIXI.Graphics;
  private checkmarkGraphics: PIXI.Graphics;
  
  // Component state (data-driven)
  private componentState: ComponentState = {
    enabled: true,
    focused: false,
    hovered: false,
    pressed: false,
    checked: false
  };
  
  // Theme data
  protected themeResolver?: ThemeResolver;
  private colorOverrides: {
    backgroundColor?: number;
    borderColor?: number;
    checkColor?: number;
    checkedBackgroundColor?: number;
  } = {};

  // Keyboard handler for cleanup
  private keydownHandler?: (e: KeyboardEvent) => void;

  constructor(props: UICheckboxProps = {}, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    // Store color overrides
    this.colorOverrides = {
      backgroundColor: props.backgroundColor,
      borderColor: props.borderColor,
      checkColor: props.checkColor,
      checkedBackgroundColor: props.checkedBackgroundColor
    };

    // Initialize theme
    this.themeResolver = props.themeResolver;
    const theme = createDefaultDarkTheme(); // TODO: Get from resolver if available
    
    // Initialize services
    this.layoutEngine = new LayoutEngine();
    this.stateManager = new FormStateManager({
      value: props.checked,
      defaultValue: props.defaultChecked,
      onChange: props.onChange
    });
    this.themeApplier = new ThemeApplier(theme);

    // Update component state
    this.componentState.enabled = !(props.disabled ?? false);
    this.componentState.checked = this.stateManager.getValue();

    // Resolve colors using ThemeResolver if provided, otherwise use defaults
    const resolver = this.themeResolver;
    this.props = {
      disabled: props.disabled ?? false,
      size: props.size ?? 20,
      backgroundColor: props.backgroundColor ?? resolver?.getColor('background') ?? 0xffffff,
      borderColor: props.borderColor ?? resolver?.getColor('border') ?? 0xcccccc,
      checkColor: props.checkColor ?? resolver?.getCheckmarkColor() ?? 0xffffff,
      checkedBackgroundColor: props.checkedBackgroundColor ?? resolver?.getColor('selected') ?? 0x4a90e2,
      borderRadius: props.borderRadius ?? 4
    };

    // Set box model dimensions
    this.boxModel.width = this.props.size;
    this.boxModel.height = this.props.size;

    // Make checkbox focusable by default
    this.tabIndex = 0;

    // Create graphics for checkbox and checkmark
    this.checkboxGraphics = new PIXI.Graphics();
    this.checkmarkGraphics = new PIXI.Graphics();
    this.container.addChild(this.checkboxGraphics);
    this.container.addChild(this.checkmarkGraphics);

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
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';

    this.container.on('pointerover', this.handlePointerOver.bind(this));
    this.container.on('pointerout', this.handlePointerOut.bind(this));
    this.container.on('pointerdown', this.handlePointerDown.bind(this));
    this.container.on('pointerup', this.handlePointerUp.bind(this));
    this.container.on('pointerupoutside', this.handlePointerUpOutside.bind(this));

    // Keyboard support
    if (typeof window !== 'undefined') {
      this.keydownHandler = (e: KeyboardEvent) => {
        if (!this.focused || this.props.disabled) return;

        // Space to toggle
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          e.stopPropagation();
          this.toggle();
        }
      };
      window.addEventListener('keydown', this.keydownHandler);
    }
  }

  private handlePointerOver(): void {
    if (this.props.disabled) return;
    this.componentState.hovered = true;
    this.updateVisuals();
  }

  private handlePointerOut(): void {
    if (this.props.disabled) return;
    this.componentState.hovered = false;
    this.updateVisuals();
  }

  private handlePointerDown(): void {
    if (this.props.disabled) return;
    // Visual feedback handled in updateVisuals
  }

  private handlePointerUp(): void {
    if (this.props.disabled) return;
    this.toggle();
  }

  private handlePointerUpOutside(): void {
    if (this.props.disabled) return;
    this.updateVisuals();
  }

  /**
   * Toggle the checkbox state
   */
  public toggle(): void {
    if (this.props.disabled) return;
    const currentValue = this.stateManager.getValue();
    this.setChecked(!currentValue);
  }

  /**
   * Set the checked state
   */
  public setChecked(checked: boolean): void {
    if (this.props.disabled) return;
    
    const wasChecked = this.componentState.checked;
    this.stateManager.setValue(checked);
    this.componentState.checked = checked;
    
    // Only update visuals if state actually changed
    if (wasChecked !== checked) {
      this.updateVisuals();
    }
  }

  /**
   * Get the current checked state
   */
  public getChecked(): boolean {
    return this.stateManager.getValue();
  }

  /** @internal */
  private updateVisuals(): void {
    const size = this.props.size;
    const borderRadius = this.props.borderRadius;
    const checked = this.componentState.checked;

    // Ensure hitArea is set (in case it was cleared)
    if (!this.container.hitArea || 
        (this.container.hitArea instanceof PIXI.Rectangle && 
         (this.container.hitArea.width !== size || this.container.hitArea.height !== size))) {
      this.container.hitArea = new PIXI.Rectangle(0, 0, size, size);
    }

    // Clear previous drawing
    this.checkboxGraphics.clear();
    this.checkmarkGraphics.clear();

    // Resolve colors using ThemeApplier or ThemeResolver
    const bgColor = checked
      ? (this.themeResolver
          ? this.themeResolver.getColor('selected', this.colorOverrides.checkedBackgroundColor)
          : this.themeApplier.applyBackground({} as PIXI.Graphics, { ...this.componentState, checked: true }, this.colorOverrides.checkedBackgroundColor))
      : (this.themeResolver
          ? this.themeResolver.getColor('background', this.colorOverrides.backgroundColor)
          : this.themeApplier.applyBackground({} as PIXI.Graphics, this.componentState, this.colorOverrides.backgroundColor));

    const borderColor = this.themeResolver
      ? this.themeResolver.getColor('border', this.colorOverrides.borderColor)
      : this.themeApplier.applyBorderColor(this.componentState, this.colorOverrides.borderColor);

    // Draw checkbox background
    this.checkboxGraphics.roundRect(0, 0, size, size, borderRadius);
    this.checkboxGraphics.fill({ color: bgColor });
    this.checkboxGraphics.stroke({ color: borderColor, width: 1 });

    // Draw checkmark if checked
    if (checked) {
      const checkmarkSize = size * 0.6;
      const offsetX = (size - checkmarkSize) / 2;
      const offsetY = (size - checkmarkSize) / 2;

      const checkmarkColor = this.themeResolver
        ? this.themeResolver.getCheckmarkColor(this.colorOverrides.checkColor)
        : this.themeApplier.applyCheckmarkColor(this.colorOverrides.checkColor);

      // Draw checkmark using lines (pixel-perfect)
      this.checkmarkGraphics.moveTo(offsetX + checkmarkSize * 0.2, offsetY + checkmarkSize * 0.5);
      this.checkmarkGraphics.lineTo(offsetX + checkmarkSize * 0.45, offsetY + checkmarkSize * 0.75);
      this.checkmarkGraphics.lineTo(offsetX + checkmarkSize * 0.8, offsetY + checkmarkSize * 0.25);
      this.checkmarkGraphics.stroke({ color: checkmarkColor, width: 2 });
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
    const measured = this.measure();
    
    // Use LayoutEngine to calculate layout
    this.computedLayout = this.layoutEngine.layout(
      this.boxModel,
      measured,
      { width: availableWidth, height: availableHeight }
    );
    
    // Ensure hitArea is set after layout (in case container was repositioned)
    this.container.hitArea = new PIXI.Rectangle(0, 0, this.props.size, this.props.size);
    
    // Ensure container is interactive
    if (this.container.eventMode === 'none' || this.container.eventMode === 'passive') {
      this.container.eventMode = 'static';
    }
    
    this.layoutDirty = false;
    this.render();
  }

  /** @internal */
  protected render(): void {
    // Rendering is handled by updateVisuals()
  }

  /**
   * Update the checked state (for controlled mode)
   */
  public updateChecked(checked: boolean): void {
    if (this.stateManager.isControlledMode() && checked !== this.componentState.checked) {
      this.stateManager.updateValue(checked);
      this.componentState.checked = checked;
      this.updateVisuals();
    }
  }

  /**
   * Set disabled state
   */
  public setDisabled(disabled: boolean): void {
    this.props.disabled = disabled;
    this.componentState.enabled = !disabled;
    this.enabled = !disabled;
    this.container.cursor = disabled ? 'default' : 'pointer';
    this.updateVisuals(); // updateVisuals will handle alpha
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

