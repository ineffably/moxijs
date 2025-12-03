import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { UICheckbox, UICheckboxProps } from './ui-checkbox';
import { UILabel } from './ui-label';
import { EdgeInsets } from '../core/edge-insets';

/**
 * Props for configuring a UICheckboxWithLabel
 *
 * @category UI
 */
export interface UICheckboxWithLabelProps extends UICheckboxProps {
  /** Label text displayed next to checkbox */
  label: string;
  /** Gap between checkbox and label */
  gap?: number;
  /** Label font size */
  fontSize?: number;
  /** Label text color */
  textColor?: number;
  /** Label position relative to checkbox */
  labelPosition?: 'left' | 'right';
}

/**
 * A checkbox with an integrated label positioned to the left or right.
 * Clicking the label toggles the checkbox, following DOM API patterns.
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const checkbox = new UICheckboxWithLabel({
 *   label: 'Enable notifications',
 *   checked: false,
 *   onChange: (checked) => console.log('Notifications:', checked)
 * });
 * ```
 */
export class UICheckboxWithLabel extends UIComponent {
  private props: Required<Omit<UICheckboxWithLabelProps, 'onChange' | 'checked' | 'defaultChecked' | 'themeResolver'>>;
  private checkbox: UICheckbox;
  private label: UILabel;
  private labelPosition: 'left' | 'right';

  constructor(props: UICheckboxWithLabelProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    this.labelPosition = props.labelPosition ?? 'right';

    // Extract checkbox props (exclude label-specific props)
    const {
      label,
      gap,
      fontSize,
      textColor,
      labelPosition,
      ...checkboxProps
    } = props;

    const resolver = props.themeResolver;
    
    this.props = {
      ...checkboxProps,
      label: label ?? '',
      gap: gap ?? 8,
      fontSize: fontSize ?? 16,
      textColor: textColor ?? resolver?.getTextColor() ?? 0xffffff, // Use theme resolver if available
      labelPosition: this.labelPosition,
      // Default checkbox props
      disabled: checkboxProps.disabled ?? false,
      size: checkboxProps.size ?? 20,
      backgroundColor: checkboxProps.backgroundColor ?? resolver?.getColor('background') ?? 0xffffff,
      borderColor: checkboxProps.borderColor ?? resolver?.getColor('border') ?? 0xcccccc,
      checkColor: checkboxProps.checkColor ?? resolver?.getCheckmarkColor() ?? 0xffffff,
      checkedBackgroundColor: checkboxProps.checkedBackgroundColor ?? resolver?.getColor('selected') ?? 0x4a90e2,
      borderRadius: checkboxProps.borderRadius ?? 4
    };

    // Create checkbox with theme resolver
    this.checkbox = new UICheckbox({ ...checkboxProps, themeResolver: resolver }, {
      padding: EdgeInsets.zero()
    });

    // Create label with disabled color if needed (use theme resolver)
    const labelColor = this.props.disabled 
      ? (resolver?.getColor('disabled') ?? 0x666666)
      : this.props.textColor;
    this.label = new UILabel({
      text: this.props.label,
      fontSize: this.props.fontSize,
      color: labelColor,
      align: 'left'
    }, {
      padding: EdgeInsets.zero()
    });

    // Add checkbox and label to container
    this.container.addChild(this.checkbox.container);
    this.container.addChild(this.label.container);

    // Make the entire component clickable (including label area)
    this.setupLabelClickability();

    // Set box model to auto-size based on content
    this.boxModel.width = 'auto';
    this.boxModel.height = 'auto';
  }

  /** @internal */
  private setupLabelClickability(): void {
    // Make the entire component container clickable
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';
    
    // Make label container clickable to toggle checkbox
    this.label.container.eventMode = 'static';
    this.label.container.cursor = 'pointer';
    this.label.container.on('pointerdown', () => {
      if (!this.props.disabled) {
        this.checkbox.toggle();
      }
    });
    
    // Also make checkbox container clickable (in case label doesn't cover it)
    this.checkbox.container.eventMode = 'static';
    this.checkbox.container.cursor = 'pointer';
  }

  /**
   * Get the checkbox instance (for direct access if needed)
   */
  public getCheckbox(): UICheckbox {
    return this.checkbox;
  }

  /**
   * Get the label instance (for direct access if needed)
   */
  public getLabel(): UILabel {
    return this.label;
  }

  /**
   * Set the checked state
   */
  public setChecked(checked: boolean): void {
    this.checkbox.setChecked(checked);
  }

  /**
   * Get the current checked state
   */
  public getChecked(): boolean {
    return this.checkbox.getChecked();
  }

  /**
   * Toggle the checkbox state
   */
  public toggle(): void {
    this.checkbox.toggle();
  }

  /**
   * Set disabled state
   */
  public setDisabled(disabled: boolean): void {
    this.props.disabled = disabled;
    this.checkbox.setDisabled(disabled);
    this.enabled = !disabled;
    // Update label color when disabled state changes (use theme resolver if available)
    const resolver = (this.checkbox as any).themeResolver;
    const labelColor = disabled 
      ? (resolver?.getColor('disabled') ?? 0x666666)
      : this.props.textColor;
    this.label.setColor(labelColor);
    this.label.container.cursor = disabled ? 'default' : 'pointer';
    // Alpha is handled by checkbox component
  }

  /**
   * Update the label text
   */
  public setLabelText(text: string): void {
    this.props.label = text;
    this.label.setText(text);
    this.markLayoutDirty();
  }

  /** @internal */
  measure(): MeasuredSize {
    const checkboxSize = this.props.size;
    const labelBounds = this.label.container.children[0]?.getLocalBounds();
    const labelWidth = labelBounds?.width ?? 0;
    const labelHeight = Math.max(checkboxSize, labelBounds?.height ?? this.props.fontSize);

    const totalWidth = checkboxSize + this.props.gap + labelWidth;
    const totalHeight = labelHeight;

    return {
      width: totalWidth,
      height: totalHeight
    };
  }

  /** @internal */
  layout(availableWidth: number, availableHeight: number): void {
    const measured = this.measure();
    const checkboxSize = this.props.size;

    // Ensure label is laid out first to get accurate measurements
    this.label.layout(availableWidth, availableHeight);
    const labelMeasured = this.label.measure();
    const labelHeight = labelMeasured.height;
    const labelWidth = labelMeasured.width;

    // Position checkbox and label based on labelPosition
    // Vertically center both checkbox and label
    const checkboxY = (measured.height - checkboxSize) / 2;
    const labelY = (measured.height - labelHeight) / 2;

    if (this.labelPosition === 'right') {
      // Checkbox on left, label on right
      this.checkbox.container.position.set(0, checkboxY);
      this.label.container.position.set(checkboxSize + this.props.gap, labelY);
    } else {
      // Label on left, checkbox on right
      this.label.container.position.set(0, labelY);
      this.checkbox.container.position.set(labelWidth + this.props.gap, checkboxY);
    }

    // Update hit area to include both checkbox and label
    this.container.hitArea = new PIXI.Rectangle(0, 0, measured.width, measured.height);
    
    // Ensure container is interactive
    if (this.container.eventMode === 'none' || this.container.eventMode === 'passive') {
      this.container.eventMode = 'static';
    }

    this.computedLayout.width = measured.width;
    this.computedLayout.height = measured.height;
    this.layoutDirty = false;
    this.render();
  }

  /** @internal */
  protected render(): void {
    // Rendering is handled by checkbox and label components
  }

  /**
   * Update the checked state (for controlled mode)
   */
  public updateChecked(checked: boolean): void {
    this.checkbox.updateChecked(checked);
  }

  /**
   * Clean up event listeners
   */
  public destroy(): void {
    this.checkbox.destroy();
    super.destroy();
  }
}

