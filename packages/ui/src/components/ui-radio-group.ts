import * as PIXI from 'pixi.js';
import { UIComponent } from '../base/ui-component';
import { BoxModel, MeasuredSize } from '../base/box-model';
import { FlexContainer, FlexDirection } from '../layout/flex-container';
import { EdgeInsets } from '../base/edge-insets';
import { UIRadioOption } from './ui-radio-option';
import { ThemeResolver } from '../theming/theme-resolver';
// Theme resolver is now in base class
import {
  FormStateManager
} from '../services';

/**
 * A single radio option with label and value
 */
export interface RadioOption {
  /** Display label */
  label: string;
  /** Value for this option */
  value: any;
  /** Whether this option is disabled */
  disabled?: boolean;
}

/**
 * Props for configuring a UIRadioGroup
 *
 * @category UI
 */
export interface UIRadioGroupProps {
  /** Array of radio options */
  options: RadioOption[];
  /** Currently selected value (controlled) */
  value?: any;
  /** Default selected value (uncontrolled) */
  defaultValue?: any;
  /** Change callback */
  onChange?: (value: any) => void;
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Gap between radio buttons */
  gap?: number;
  /** Size of each radio button */
  size?: number;
  /** Label font size */
  fontSize?: number;
  /** Label text color */
  textColor?: number;
  /** Radio button colors */
  backgroundColor?: number;
  borderColor?: number;
  selectedColor?: number;
  /** Gap between radio button and label */
  labelGap?: number;
  /** Optional ThemeResolver for automatic color resolution */
  themeResolver?: ThemeResolver;
}

/**
 * A radio button group that manages multiple radio buttons with single selection.
 * Only one radio button can be selected at a time.
 * Follows DOM API patterns for familiarity.
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const radioGroup = new UIRadioGroup({
 *   options: [
 *     { label: 'Option 1', value: 'opt1' },
 *     { label: 'Option 2', value: 'opt2' },
 *     { label: 'Option 3', value: 'opt3' }
 *   ],
 *   value: 'opt1',
 *   onChange: (value) => console.log('Selected:', value),
 *   direction: 'vertical'
 * });
 * ```
 */
export class UIRadioGroup extends UIComponent {
  private props: Required<Omit<UIRadioGroupProps, 'onChange' | 'value' | 'defaultValue' | 'themeResolver'>>;
  
  // Services (composition)
  private stateManager: FormStateManager<any>;
  // ThemeApplier removed - using base class helpers
  
  // Theme resolver is now in base class
  private radioOptions: UIRadioOption[] = [];
  private flexContainer: FlexContainer;
  
  // Note: onChange is handled by FormStateManager, but we keep the prop reference for backward compatibility
  private onChange?: (value: any) => void;

  constructor(props: UIRadioGroupProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    if (!props.options || props.options.length === 0) {
      throw new Error('UIRadioGroup requires at least one option');
    }

    // Initialize theme resolver
    this.themeResolver = props.themeResolver;
    
    this.stateManager = new FormStateManager({
      value: props.value,
      defaultValue: props.defaultValue ?? props.options[0]?.value,
      onChange: props.onChange
    });

    // Resolve colors using ThemeResolver if provided, otherwise use defaults
    const resolver = this.themeResolver;
    this.props = {
      options: props.options,
      disabled: props.disabled ?? false,
      direction: props.direction ?? 'vertical',
      gap: props.gap ?? 12,
      size: props.size ?? 20,
      fontSize: props.fontSize ?? 16,
      textColor: props.textColor ?? resolver?.getTextColor() ?? 0xffffff,
      backgroundColor: props.backgroundColor ?? resolver?.getColor('background') ?? 0xffffff,
      borderColor: props.borderColor ?? resolver?.getColor('border') ?? 0xcccccc,
      selectedColor: props.selectedColor ?? resolver?.getColor('selected') ?? 0x4a90e2,
      labelGap: props.labelGap ?? 8
    };

    this.onChange = props.onChange;
    
    // Note: onChange is handled by FormStateManager, but we keep this for backward compatibility

    // Create flex container for layout
    this.flexContainer = new FlexContainer({
      direction: this.props.direction === 'horizontal' ? FlexDirection.Row : FlexDirection.Column,
      gap: this.props.gap,
      padding: EdgeInsets.zero()
    });
    this.container.addChild(this.flexContainer.container);

    // Create radio buttons and labels
    this.createRadioButtons();

    // Set box model to auto-size based on content
    this.boxModel.width = 'auto';
    this.boxModel.height = 'auto';
  }

  /** @internal */
  private createRadioButtons(): void {
    // Clear existing
    this.radioOptions.forEach(option => option.destroy());
    this.radioOptions = [];

    // Create each radio option
    const resolver = this.themeResolver;
    
    this.props.options.forEach((option) => {
      const radioOption = new UIRadioOption({
        label: option.label,
        selected: this.stateManager.getValue() === option.value,
        disabled: this.props.disabled || option.disabled,
        size: this.props.size,
        fontSize: this.props.fontSize,
        textColor: this.props.textColor,
        backgroundColor: this.props.backgroundColor,
        borderColor: this.props.borderColor,
        selectedColor: this.props.selectedColor,
        labelGap: this.props.labelGap,
        themeResolver: resolver,
        onChange: (selected) => {
          if (selected) {
            this.handleSelection(option.value);
          }
        }
      }, {
        padding: EdgeInsets.zero()
      });

      this.radioOptions.push(radioOption);
      this.flexContainer.addChild(radioOption);
    });
  }

  /** @internal */
  private handleSelection(value: any): void {
    if (this.props.disabled) return;
    if (this.stateManager.getValue() === value) return; // Already selected

    // Update selected value through FormStateManager
    this.stateManager.setValue(value);

    // Update all radio options
    this.radioOptions.forEach((radioOption, index) => {
      const option = this.props.options[index];
      radioOption.updateSelected(option.value === value);
    });
  }

  /**
   * Get the currently selected value
   */
  public getValue(): any {
    return this.stateManager.getValue();
  }

  /**
   * Set the selected value
   */
  public setValue(value: any): void {
    if (this.props.disabled) return;
    // FormStateManager handles controlled mode automatically
    this.handleSelection(value);
  }

  /**
   * Update the selected value (for controlled mode)
   */
  public updateValue(value: any): void {
    if (this.stateManager.isControlledMode() && value !== this.stateManager.getValue()) {
      this.stateManager.updateValue(value);
      // Update all radio options
      this.radioOptions.forEach((radioOption, index) => {
        const option = this.props.options[index];
        radioOption.updateSelected(option.value === value);
      });
    }
  }

  /**
   * Set disabled state
   */
  public setDisabled(disabled: boolean): void {
    this.props.disabled = disabled;
    this.radioOptions.forEach(option => option.setDisabled(disabled));
  }

  /** @internal */
  measure(): MeasuredSize {
    // Measure flex container
    const flexMeasured = this.flexContainer.measure();
    return {
      width: flexMeasured.width,
      height: flexMeasured.height
    };
  }

  /** @internal */
  layout(availableWidth: number, availableHeight: number): void {
    // Layout flex container
    this.flexContainer.layout(availableWidth, availableHeight);
    
    super.layout(availableWidth, availableHeight);
    this.render();
  }

  /** @internal */
  protected render(): void {
    // Rendering is handled by child components
  }

  /**
   * Clean up
   */
  public destroy(): void {
    this.radioOptions.forEach(option => option.destroy());
    this.flexContainer.destroy();
    super.destroy();
  }
}

