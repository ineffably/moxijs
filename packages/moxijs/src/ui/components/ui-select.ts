import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { UIPanel } from './ui-panel';
import { UILabel } from './ui-label';
import { EdgeInsets } from '../core/edge-insets';

/**
 * Option structure for Select component
 *
 * @category UI
 */
export interface SelectOption {
  /** Display text for the option */
  label: string;
  /** The actual value */
  value: any;
  /** Whether this option is disabled */
  disabled?: boolean;
}

/**
 * Props for configuring a UISelect
 *
 * @category UI
 */
export interface UISelectProps {
  /** Array of options */
  options: SelectOption[];
  /** Current selected value (controlled) */
  value?: any;
  /** Default selected value (uncontrolled) */
  defaultValue?: any;
  /** Change callback */
  onChange?: (value: any) => void;
  /** Width of the select */
  width?: number;
  /** Height of the select */
  height?: number;
  /** Placeholder text when nothing selected */
  placeholder?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Background color */
  backgroundColor?: number;
  /** Text color */
  textColor?: number;
  /** Border radius */
  borderRadius?: number;
}

/**
 * A select/dropdown component with options
 * Follows Ant Design's data-driven pattern
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const select = new UISelect({
 *   options: [
 *     { label: 'Option 1', value: 1 },
 *     { label: 'Option 2', value: 2 },
 *     { label: 'Option 3', value: 3 }
 *   ],
 *   placeholder: 'Choose an option',
 *   onChange: (value) => console.log('Selected:', value)
 * });
 * ```
 */
export class UISelect extends UIComponent {
  private props: Required<Omit<UISelectProps, 'onChange' | 'value' | 'defaultValue'>>;
  private onChange?: (value: any) => void;

  private selectedValue: any;
  private background: UIPanel;
  private label: UILabel;
  private dropdownContainer?: PIXI.Container;
  private dropdownPanel?: UIPanel;
  private optionLabels: UILabel[] = [];
  private isOpen: boolean = false;

  private hoverColor: number;
  private selectedColor: number;

  constructor(props: UISelectProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    this.props = {
      options: props.options ?? [],
      placeholder: props.placeholder ?? 'Select...',
      width: props.width ?? 200,
      height: props.height ?? 36,
      disabled: props.disabled ?? false,
      backgroundColor: props.backgroundColor ?? 0xffffff,
      textColor: props.textColor ?? 0x000000,
      borderRadius: props.borderRadius ?? 4
    };

    this.onChange = props.onChange;
    this.selectedValue = props.value ?? props.defaultValue;

    // Calculate colors
    this.hoverColor = this.darkenColor(this.props.backgroundColor, 0.95);
    this.selectedColor = this.darkenColor(this.props.backgroundColor, 0.9);

    // Set box model dimensions
    this.boxModel.width = this.props.width;
    this.boxModel.height = this.props.height;

    // Create background
    this.background = new UIPanel({
      backgroundColor: this.props.backgroundColor,
      width: this.props.width,
      height: this.props.height,
      borderRadius: this.props.borderRadius
    });
    this.container.addChild(this.background.container);

    // Create label for selected value
    const displayText = this.getDisplayText();
    this.label = new UILabel({
      text: displayText,
      fontSize: 14,
      color: this.selectedValue ? this.props.textColor : 0x999999,
      align: 'left'
    }, {
      padding: EdgeInsets.symmetric(8, 12)
    });
    this.container.addChild(this.label.container);

    // Setup interactivity
    this.setupInteractivity();
  }

  /**
   * Gets the display text based on selected value
   */
  private getDisplayText(): string {
    if (!this.selectedValue) {
      return this.props.placeholder;
    }

    const option = this.props.options.find(opt => opt.value === this.selectedValue);
    return option ? option.label : this.props.placeholder;
  }

  /**
   * Sets up mouse/touch event handlers
   */
  private setupInteractivity(): void {
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';

    this.container.on('pointerdown', this.handlePointerDown.bind(this));
  }

  private handlePointerDown(): void {
    if (this.props.disabled) return;

    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Opens the dropdown menu
   */
  private openDropdown(): void {
    this.isOpen = true;

    // Create dropdown container
    this.dropdownContainer = new PIXI.Container();
    this.dropdownContainer.position.set(0, this.props.height + 4);

    // Create dropdown panel
    const dropdownHeight = Math.min(this.props.options.length * 32, 200);
    this.dropdownPanel = new UIPanel({
      backgroundColor: this.props.backgroundColor,
      width: this.props.width,
      height: dropdownHeight,
      borderRadius: this.props.borderRadius
    });
    this.dropdownContainer.addChild(this.dropdownPanel.container);

    // Create option labels
    this.optionLabels = [];
    this.props.options.forEach((option, index) => {
      const optionContainer = new PIXI.Container();
      optionContainer.position.set(0, index * 32);

      // Option background
      const optionBg = new PIXI.Graphics();
      optionBg.rect(0, 0, this.props.width, 32);
      optionBg.fill({ color: this.props.backgroundColor, alpha: 0 });
      optionContainer.addChild(optionBg);

      // Option label
      const optionLabel = new UILabel({
        text: option.label,
        fontSize: 14,
        color: option.disabled ? 0x999999 : this.props.textColor,
        align: 'left'
      }, {
        padding: EdgeInsets.symmetric(8, 12)
      });
      optionLabel.layout(this.props.width, 32);
      optionContainer.addChild(optionLabel.container);

      if (!option.disabled) {
        optionContainer.eventMode = 'static';
        optionContainer.cursor = 'pointer';

        // Hover effect
        optionContainer.on('pointerover', () => {
          optionBg.clear();
          optionBg.rect(0, 0, this.props.width, 32);
          optionBg.fill({ color: this.hoverColor });
        });

        optionContainer.on('pointerout', () => {
          optionBg.clear();
          optionBg.rect(0, 0, this.props.width, 32);
          optionBg.fill({ color: this.props.backgroundColor, alpha: 0 });
        });

        // Click handler
        optionContainer.on('pointerdown', () => {
          this.selectOption(option.value);
        });
      }

      this.dropdownContainer!.addChild(optionContainer);
      this.optionLabels.push(optionLabel);
    });

    this.container.addChild(this.dropdownContainer);

    // Add click outside listener
    this.setupClickOutside();
  }

  /**
   * Closes the dropdown menu
   */
  private closeDropdown(): void {
    this.isOpen = false;

    if (this.dropdownContainer) {
      this.container.removeChild(this.dropdownContainer);
      this.dropdownContainer = undefined;
      this.dropdownPanel = undefined;
      this.optionLabels = [];
    }

    // Remove click outside listener
    this.removeClickOutside();
  }

  /**
   * Selects an option
   */
  private selectOption(value: any): void {
    this.selectedValue = value;
    this.label.setText(this.getDisplayText());
    this.label.setColor(this.props.textColor);

    this.onChange?.(value);
    this.closeDropdown();
  }

  /**
   * Setup click outside detection
   */
  private setupClickOutside(): void {
    // Simple approach: close on any outside click
    const stage = this.container.parent;
    if (stage) {
      stage.eventMode = 'static';
      stage.once('pointerdown', (e) => {
        // Check if click is outside
        const point = e.global;
        const bounds = this.container.getBounds();

        // Check if point is within bounds manually
        if (point.x < bounds.x || point.x > bounds.x + bounds.width ||
            point.y < bounds.y || point.y > bounds.y + bounds.height) {
          this.closeDropdown();
        }
      });
    }
  }

  /**
   * Remove click outside detection
   */
  private removeClickOutside(): void {
    // Handled by 'once' in setupClickOutside
  }

  /**
   * Darkens a color by a factor
   */
  private darkenColor(color: number, factor: number): number {
    const r = ((color >> 16) & 0xff) * factor;
    const g = ((color >> 8) & 0xff) * factor;
    const b = (color & 0xff) * factor;
    return ((r << 16) | (g << 8) | b) >>> 0;
  }

  /**
   * Measures the size needed for this select
   */
  measure(): MeasuredSize {
    return {
      width: this.props.width,
      height: this.props.height
    };
  }

  /**
   * Performs layout for this select
   */
  layout(availableWidth: number, availableHeight: number): void {
    const measured = this.measure();

    this.computedLayout.width = measured.width;
    this.computedLayout.height = measured.height;

    // Layout background
    this.background.layout(measured.width, measured.height);

    // Layout label
    this.label.layout(measured.width, measured.height);

    this.layoutDirty = false;
    this.render();
  }

  /**
   * Renders the select
   */
  protected render(): void {
    // Rendering handled by background and label
  }

  /**
   * Sets the selected value programmatically
   */
  setValue(value: any): void {
    this.selectedValue = value;
    this.label.setText(this.getDisplayText());
    this.label.setColor(this.props.textColor);
  }

  /**
   * Gets the current selected value
   */
  getValue(): any {
    return this.selectedValue;
  }

  /**
   * Updates the options
   */
  setOptions(options: SelectOption[]): void {
    this.props.options = options;
    if (this.isOpen) {
      this.closeDropdown();
    }
  }
}
