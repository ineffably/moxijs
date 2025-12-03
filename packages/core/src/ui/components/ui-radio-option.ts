import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { UIRadioButton } from './ui-radio-button';
import { UILabel } from './ui-label';
import { EdgeInsets } from '../core/edge-insets';
import { ThemeResolver } from '../theming/theme-resolver';

/**
 * Props for configuring a UIRadioOption (internal component)
 */
interface UIRadioOptionProps {
  label: string;
  selected: boolean;
  disabled?: boolean;
  size?: number;
  fontSize?: number;
  textColor?: number;
  backgroundColor?: number;
  borderColor?: number;
  selectedColor?: number;
  labelGap?: number;
  onChange?: (selected: boolean) => void;
  /** Optional ThemeResolver for automatic color resolution */
  themeResolver?: ThemeResolver;
}

/**
 * Internal component for a single radio button with label
 */
class UIRadioOption extends UIComponent {
  private props: Required<Omit<UIRadioOptionProps, 'onChange'>>;
  private onChange?: (selected: boolean) => void;
  private radioButton: UIRadioButton;
  private label: UILabel;

  constructor(props: UIRadioOptionProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    const resolver = props.themeResolver;

    this.props = {
      label: props.label,
      selected: props.selected,
      disabled: props.disabled ?? false,
      size: props.size ?? 20,
      fontSize: props.fontSize ?? 16,
      textColor: props.textColor ?? resolver?.getTextColor() ?? 0xffffff,
      backgroundColor: props.backgroundColor ?? resolver?.getColor('background') ?? 0xffffff,
      borderColor: props.borderColor ?? resolver?.getColor('border') ?? 0xcccccc,
      selectedColor: props.selectedColor ?? resolver?.getColor('selected') ?? 0x4a90e2,
      labelGap: props.labelGap ?? 8
    };

    this.onChange = props.onChange;

    // Create radio button with theme resolver
    this.radioButton = new UIRadioButton({
      selected: this.props.selected,
      disabled: this.props.disabled,
      size: this.props.size,
      backgroundColor: this.props.backgroundColor,
      borderColor: this.props.borderColor,
      selectedColor: this.props.selectedColor,
      themeResolver: resolver,
      onChange: (selected) => {
        this.onChange?.(selected);
      }
    }, {
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

    // Make label clickable to select radio
    this.label.container.eventMode = 'static';
    this.label.container.cursor = 'pointer';
    this.label.container.on('pointerdown', () => {
      if (!this.props.disabled) {
        this.onChange?.(true);
      }
    });

    // Add to container
    this.container.addChild(this.radioButton.container);
    this.container.addChild(this.label.container);

    // Set box model to auto-size
    this.boxModel.width = 'auto';
    this.boxModel.height = 'auto';
  }

  public updateSelected(selected: boolean): void {
    this.radioButton.updateSelected(selected);
  }

  public setDisabled(disabled: boolean): void {
    this.props.disabled = disabled;
    this.radioButton.setDisabled(disabled);
    // Update label color when disabled state changes (use theme resolver if available)
    const resolver = (this.radioButton as any).themeResolver;
    const labelColor = disabled 
      ? (resolver?.getColor('disabled') ?? 0x666666)
      : this.props.textColor;
    this.label.setColor(labelColor);
  }

  /** @internal */
  measure(): MeasuredSize {
    const radioSize = this.props.size;
    const labelMeasured = this.label.measure();
    const labelHeight = labelMeasured.height;
    const totalHeight = Math.max(radioSize, labelHeight);
    const totalWidth = radioSize + this.props.labelGap + labelMeasured.width;

    return {
      width: totalWidth,
      height: totalHeight
    };
  }

  /** @internal */
  layout(availableWidth: number, availableHeight: number): void {
    const measured = this.measure();
    const radioSize = this.props.size;
    
    // Layout radio button
    this.radioButton.layout(radioSize, radioSize);
    
    // Layout label
    const labelMeasured = this.label.measure();
    this.label.layout(labelMeasured.width, labelMeasured.height);
    
    // Position label next to radio button
    const labelY = (measured.height - labelMeasured.height) / 2;
    this.label.container.position.set(radioSize + this.props.labelGap, labelY);
    
    // Center radio button vertically
    const radioY = (measured.height - radioSize) / 2;
    this.radioButton.container.position.set(0, radioY);

    // Update hit area for entire option
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
    // Rendering is handled by child components
  }

  public destroy(): void {
    this.radioButton.destroy();
    this.label.destroy();
    super.destroy();
  }
}

export { UIRadioOption };

