import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { UIPanel } from './ui-panel';
import { UILabel } from './ui-label';
import { UITextInput } from './ui-text-input';
import { EdgeInsets } from '../core/edge-insets';
import { UIFocusManager } from '../core/ui-focus-manager';
import { ThemeResolver } from '../theming/theme-resolver';

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
  /** Background color (overrides theme) */
  backgroundColor?: number;
  /** Background color for dropdown panel (overrides theme) */
  dropdownBackgroundColor?: number;
  /** Text color (overrides theme) */
  textColor?: number;
  /** Border radius */
  borderRadius?: number;
  /** Enable combo box mode (type to filter options) */
  filterable?: boolean;
  /** Allow custom values in filterable mode (not just from options) */
  allowCustomValue?: boolean;
  /** Optional ThemeResolver for automatic color resolution */
  themeResolver?: ThemeResolver;
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
  private props: Required<Omit<UISelectProps, 'onChange' | 'value' | 'defaultValue' | 'themeResolver'>>;
  private onChange?: (value: any) => void;

  private selectedValue: any;
  private isControlled: boolean;
  private background: UIPanel;
  private label: UILabel;
  private textInput?: UITextInput; // For filterable mode
  private arrowIndicator: PIXI.Graphics;
  private dropdownContainer?: PIXI.Container;
  private dropdownPanel?: UIPanel;
  private optionLabels: UILabel[] = [];
  private optionContainers: PIXI.Container[] = [];
  private isOpen: boolean = false;
  private highlightedIndex: number = -1;
  private filteredOptions: SelectOption[] = []; // For filterable mode
  private filterText: string = ''; // Current filter text

  private hoverColor: number;
  private selectedColor: number;
  private themeResolver?: ThemeResolver;

  // Keyboard handler for cleanup
  private keydownHandler?: (e: KeyboardEvent) => void;

  constructor(props: UISelectProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    this.props = {
      options: props.options ?? [],
      placeholder: props.placeholder ?? 'Select...',
      width: props.width ?? 200,
      height: props.height ?? 36,
      disabled: props.disabled ?? false,
      backgroundColor: props.backgroundColor ?? 0xffffff,
      dropdownBackgroundColor: props.dropdownBackgroundColor ?? props.backgroundColor ?? 0xffffff,
      textColor: props.textColor ?? 0x000000,
      borderRadius: props.borderRadius ?? 4,
      filterable: props.filterable ?? false,
      allowCustomValue: props.allowCustomValue ?? false
    };

    this.onChange = props.onChange;
    this.isControlled = props.value !== undefined;
    this.selectedValue = props.value ?? props.defaultValue;
    this.themeResolver = props.themeResolver;

    // Calculate colors
    this.hoverColor = this.darkenColor(this.props.backgroundColor, 0.95);
    this.selectedColor = this.darkenColor(this.props.backgroundColor, 0.9);

    // Make select focusable by default
    this.tabIndex = 0;

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

    // Create dropdown arrow indicator
    this.arrowIndicator = new PIXI.Graphics();
    // Ensure effects array is initialized
    if (this.arrowIndicator.effects === null) {
      this.arrowIndicator.effects = [];
    }
    this.updateArrowIndicator();
    this.container.addChild(this.arrowIndicator);

    // Create label or text input based on filterable mode
    if (this.props.filterable) {
      // Combo box mode: use text input
      const displayText = this.getDisplayText();
      this.textInput = new UITextInput({
        value: displayText === this.props.placeholder ? '' : displayText,
        placeholder: this.props.placeholder,
        width: this.props.width - 30, // Reserve space for arrow
        height: this.props.height,
        fontSize: 14,
        backgroundColor: 0x00000000, // Transparent - background panel provides color
        textColor: this.props.textColor,
        placeholderColor: 0x999999,
        borderRadius: 0, // No border radius on input, panel handles it
        onChange: (value) => {
          this.filterText = value;
          this.filterOptions(value);
          if (this.isOpen) {
            this.updateDropdown();
          }
        }
      }, {
        padding: EdgeInsets.symmetric(8, 12)
      });
      this.container.addChild(this.textInput.container);
    } else {
      // Pure select mode: use label
      const displayText = this.getDisplayText();
      this.label = new UILabel({
        text: displayText,
        fontSize: 14,
        color: this.selectedValue ? this.props.textColor : 0x999999,
        align: 'left',
        fontFamily: 'PixelOperator8' // Use pixel-perfect font
      }, {
        padding: EdgeInsets.symmetric(8, 12)
      });
      this.container.addChild(this.label.container);
    }

    // Initialize filtered options
    this.filteredOptions = [...this.props.options];

    // Setup interactivity
    this.setupInteractivity();

    // Initial disabled state
    if (this.props.disabled) {
      this.enabled = false;
      this.updateDisabledVisuals();
    }
  }

  /**
   * Gets the display text based on selected value
   */
  private getDisplayText(): string {
    if (!this.selectedValue) {
      return this.props.placeholder;
    }

    const option = this.props.options.find(opt => opt.value === this.selectedValue);
    return option ? option.label : (this.props.allowCustomValue ? String(this.selectedValue) : this.props.placeholder);
  }

  /**
   * Updates the dropdown arrow indicator
   */
  private updateArrowIndicator(): void {
    if (!this.arrowIndicator) return;
    
    // Ensure effects array is initialized
    if (this.arrowIndicator.effects === null) {
      this.arrowIndicator.effects = [];
    }
    
    this.arrowIndicator.clear();
    
    const arrowSize = 6;
    const arrowX = this.props.width - 20; // Position from right edge
    const arrowY = this.props.height / 2;
    
    // Use muted arrow color when disabled (use theme resolver if available)
    const disabledArrowColor = this.themeResolver?.getColor('disabled') ?? 0x666666;
    const arrowColor = this.props.disabled ? disabledArrowColor : this.props.textColor;
    
    // Draw triangle pointing down when closed, up when open
    if (this.isOpen) {
      // Pointing up when open
      this.arrowIndicator.moveTo(arrowX, arrowY - arrowSize / 2);
      this.arrowIndicator.lineTo(arrowX - arrowSize, arrowY + arrowSize / 2);
      this.arrowIndicator.lineTo(arrowX + arrowSize, arrowY + arrowSize / 2);
    } else {
      // Pointing down when closed (default state)
      this.arrowIndicator.moveTo(arrowX, arrowY + arrowSize / 2);
      this.arrowIndicator.lineTo(arrowX - arrowSize, arrowY - arrowSize / 2);
      this.arrowIndicator.lineTo(arrowX + arrowSize, arrowY - arrowSize / 2);
    }
    this.arrowIndicator.closePath();
    this.arrowIndicator.fill({ color: arrowColor });
  }

  /**
   * Updates visuals for disabled state
   */
  private updateDisabledVisuals(): void {
    if (!this.props.disabled) {
      this.container.alpha = 1.0;
      // Restore normal colors
      if (this.background) {
        this.background.setBackgroundColor(this.props.backgroundColor);
      }
      if (this.label) {
        this.label.setColor(this.props.textColor);
      }
      if (this.textInput) {
        // UITextInput doesn't have setColor, update textDisplay directly
        const textDisplay = (this.textInput as any).textDisplay;
        if (textDisplay) {
          textDisplay.style.fill = this.props.textColor;
        }
      }
      this.updateArrowIndicator();
      return;
    }

    // More obvious disabled state: muted colors and reduced opacity
    this.container.alpha = 0.6;
    
    // Update background color to muted gray
    const disabledBgColor = 0x3a3a3a; // Darker gray for disabled
    if (this.background) {
      this.background.setBackgroundColor(disabledBgColor);
    }
    
    // Update text color to muted gray
    const disabledTextColor = 0x666666;
    if (this.label) {
      this.label.setColor(disabledTextColor);
    }
    if (this.textInput) {
      // UITextInput doesn't have setColor, update textDisplay directly
      const textDisplay = (this.textInput as any).textDisplay;
      if (textDisplay) {
        textDisplay.style.fill = disabledTextColor;
      }
    }
    
    // Update arrow indicator
    this.updateArrowIndicator();
  }

  /**
   * Filters options based on filter text
   */
  private filterOptions(filterText: string): void {
    if (!filterText.trim()) {
      this.filteredOptions = [...this.props.options];
      return;
    }

    const lowerFilter = filterText.toLowerCase();
    this.filteredOptions = this.props.options.filter(opt => 
      opt.label.toLowerCase().includes(lowerFilter) && !opt.disabled
    );

    // If allowCustomValue is true, add current filter text as an option if it doesn't match
    if (this.props.allowCustomValue && filterText.trim()) {
      const exactMatch = this.props.options.some(opt => 
        opt.label.toLowerCase() === lowerFilter || opt.value === filterText
      );
      if (!exactMatch) {
        this.filteredOptions.unshift({
          label: filterText,
          value: filterText
        });
      }
    }
  }

  /**
   * Sets up mouse/touch event handlers
   */
  private setupInteractivity(): void {
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';

    this.container.on('pointerdown', this.handlePointerDown.bind(this));

    // Keyboard support
    if (typeof window !== 'undefined') {
      this.keydownHandler = (e: KeyboardEvent) => {
        if (!this.focused || this.props.disabled) return;

        if (this.isOpen) {
          // Handle keyboard navigation when dropdown is open
          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              e.stopPropagation();
              this.highlightNext();
              break;
            case 'ArrowUp':
              e.preventDefault();
              e.stopPropagation();
              this.highlightPrevious();
              break;
            case 'Enter':
            case ' ':
              e.preventDefault();
              e.stopPropagation();
              if (this.highlightedIndex >= 0) {
                const optionsToShow = this.props.filterable ? this.filteredOptions : this.props.options;
                const option = optionsToShow[this.highlightedIndex];
                if (option && !option.disabled) {
                  this.selectOption(option.value);
                }
              } else if (this.props.filterable && this.props.allowCustomValue && this.filterText.trim()) {
                // Allow custom value in filterable mode
                this.selectOption(this.filterText.trim());
              }
              break;
            case 'Escape':
              e.preventDefault();
              e.stopPropagation();
              this.closeDropdown();
              break;
          }
        } else {
          // Open dropdown with Space or Enter
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            this.openDropdown();
          }
        }
      };
      window.addEventListener('keydown', this.keydownHandler);
    }
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
   * Highlights the next option in the dropdown
   */
  private highlightNext(): void {
    const optionsToShow = this.props.filterable ? this.filteredOptions : this.props.options;
    const enabledOptions = optionsToShow.map((opt, idx) => ({ opt, idx }))
      .filter(({ opt }) => !opt.disabled);
    
    if (enabledOptions.length === 0) return;

    const currentIdx = this.highlightedIndex >= 0
      ? enabledOptions.findIndex(({ idx }) => idx === this.highlightedIndex)
      : -1;

    const nextIdx = currentIdx < enabledOptions.length - 1
      ? currentIdx + 1
      : 0;

    this.highlightedIndex = enabledOptions[nextIdx].idx;
    this.updateHighlight();
  }

  /**
   * Highlights the previous option in the dropdown
   */
  private highlightPrevious(): void {
    const optionsToShow = this.props.filterable ? this.filteredOptions : this.props.options;
    const enabledOptions = optionsToShow.map((opt, idx) => ({ opt, idx }))
      .filter(({ opt }) => !opt.disabled);
    
    if (enabledOptions.length === 0) return;

    const currentIdx = this.highlightedIndex >= 0
      ? enabledOptions.findIndex(({ idx }) => idx === this.highlightedIndex)
      : enabledOptions.length;

    const prevIdx = currentIdx > 0
      ? currentIdx - 1
      : enabledOptions.length - 1;

    this.highlightedIndex = enabledOptions[prevIdx].idx;
    this.updateHighlight();
  }

  /**
   * Updates the visual highlight of options
   */
  private updateHighlight(): void {
    const optionsToShow = this.props.filterable ? this.filteredOptions : this.props.options;
    this.optionContainers.forEach((container, index) => {
      const optionBg = container.children[0] as PIXI.Graphics;
      const option = optionsToShow[index];
      
      if (option && index === this.highlightedIndex && !option.disabled) {
        optionBg.clear();
        optionBg.rect(0, 0, this.props.width, 32);
        optionBg.fill({ color: this.hoverColor });
      } else {
        optionBg.clear();
        optionBg.rect(0, 0, this.props.width, 32);
        optionBg.fill({ color: this.props.dropdownBackgroundColor, alpha: 1 });
      }
    });
  }

  /**
   * Opens the dropdown menu
   */
  private openDropdown(): void {
    this.isOpen = true;
    this.updateArrowIndicator();

    // Reset filter if not in filterable mode
    if (!this.props.filterable) {
      this.filterText = '';
      this.filteredOptions = [...this.props.options];
    }

    // Create dropdown container
    this.dropdownContainer = new PIXI.Container();
    // Ensure effects array is initialized
    if (this.dropdownContainer.effects === null) {
      this.dropdownContainer.effects = [];
    }
    this.dropdownContainer.position.set(0, this.props.height + 4);

    // Create dropdown panel
    const optionsToShow = this.props.filterable ? this.filteredOptions : this.props.options;
    const dropdownHeight = Math.min(optionsToShow.length * 32, 200);
    this.dropdownPanel = new UIPanel({
      backgroundColor: this.props.dropdownBackgroundColor,
      width: this.props.width,
      height: dropdownHeight,
      borderRadius: this.props.borderRadius
    });
    this.dropdownContainer.addChild(this.dropdownPanel.container);

    // Create option labels
    this.optionLabels = [];
    this.optionContainers = [];
    this.highlightedIndex = -1;

    optionsToShow.forEach((option, index) => {
      const optionContainer = new PIXI.Container();
      // Ensure effects array is initialized
      if (optionContainer.effects === null) {
        optionContainer.effects = [];
      }
      optionContainer.position.set(0, index * 32);

      // Option background
      const optionBg = new PIXI.Graphics();
      // Ensure effects array is initialized
      if (optionBg.effects === null) {
        optionBg.effects = [];
      }
      optionBg.rect(0, 0, this.props.width, 32);
      optionBg.fill({ color: this.props.dropdownBackgroundColor, alpha: 0 });
      optionContainer.addChild(optionBg);

      // Option label
      const optionLabel = new UILabel({
        text: option.label,
        fontSize: 14,
        color: option.disabled ? 0x999999 : this.props.textColor,
        align: 'left',
        fontFamily: 'PixelOperator8' // Use pixel-perfect font
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
          this.highlightedIndex = index;
          this.updateHighlight();
        });

        optionContainer.on('pointerout', () => {
          // Don't clear highlight on mouse out - keep keyboard navigation state
        });

        // Click handler
        optionContainer.on('pointerdown', () => {
          this.selectOption(option.value);
        });
      }

      this.dropdownContainer!.addChild(optionContainer);
      this.optionLabels.push(optionLabel);
      this.optionContainers.push(optionContainer);
    });

    // Highlight first enabled option
    const firstEnabled = optionsToShow.findIndex(opt => !opt.disabled);
    if (firstEnabled >= 0) {
      this.highlightedIndex = firstEnabled;
      this.updateHighlight();
    }

    // Add dropdown to parent container (or stage) to ensure it's on top
    // Calculate global position for the dropdown
    const globalPos = this.container.getGlobalPosition();
    this.dropdownContainer.position.set(globalPos.x, globalPos.y + this.props.height + 4);
    
    // Find the highest parent container (stage or root)
    let parentContainer = this.container.parent;
    while (parentContainer && parentContainer.parent) {
      parentContainer = parentContainer.parent;
    }
    
    if (parentContainer) {
      // Add to top-level container and move to end (top of z-order)
      parentContainer.addChild(this.dropdownContainer);
      parentContainer.setChildIndex(this.dropdownContainer, parentContainer.children.length - 1);
    } else {
      // Fallback: add to own container
      this.container.addChild(this.dropdownContainer);
      // Reset position since we're in local space
      this.dropdownContainer.position.set(0, this.props.height + 4);
    }

    // Add click outside listener
    this.setupClickOutside();
  }

  /**
   * Updates the dropdown with current filtered options
   */
  private updateDropdown(): void {
    if (!this.isOpen || !this.dropdownContainer) return;

    // Close and reopen to refresh options
    const wasOpen = this.isOpen;
    this.closeDropdown();
    if (wasOpen) {
      this.openDropdown();
    }
  }

  /**
   * Closes the dropdown menu
   */
  private closeDropdown(): void {
    this.isOpen = false;
    this.highlightedIndex = -1;
    this.updateArrowIndicator();

    if (this.dropdownContainer) {
      // Ensure all child containers have initialized effects arrays
      this.optionContainers.forEach(container => {
        if (container.effects === null) {
          container.effects = [];
        }
      });

      // Ensure dropdown container has initialized effects
      if (this.dropdownContainer.effects === null) {
        this.dropdownContainer.effects = [];
      }

      // Ensure dropdown panel container has initialized effects
      if (this.dropdownPanel && this.dropdownPanel.container.effects === null) {
        this.dropdownPanel.container.effects = [];
      }

      // Remove from parent before destroying (could be in parent container or own container)
      if (this.dropdownContainer.parent) {
        this.dropdownContainer.parent.removeChild(this.dropdownContainer);
      }

      // Clean up option labels
      this.optionLabels.forEach(label => {
        if (label.container.effects === null) {
          label.container.effects = [];
        }
      });

      // Destroy the dropdown container
      this.dropdownContainer.destroy({ children: true });
      this.dropdownContainer = undefined;
      this.dropdownPanel = undefined;
      this.optionLabels = [];
      this.optionContainers = [];
    }

    // Remove click outside listener
    this.removeClickOutside();
  }

  /**
   * Selects an option
   */
  private selectOption(value: any): void {
    if (this.props.disabled) return;

    if (!this.isControlled) {
      this.selectedValue = value;
    }

    // Update display based on mode
    if (this.props.filterable && this.textInput) {
      const option = this.props.options.find(opt => opt.value === value);
      const displayText = option ? option.label : (this.props.allowCustomValue ? String(value) : '');
      this.textInput.setValue(displayText);
      this.filterText = displayText;
    } else if (this.label) {
      this.label.setText(this.getDisplayText());
      this.label.setColor(this.props.textColor);
    }

    this.onChange?.(value);
    this.closeDropdown();
  }

  /**
   * Setup click outside detection
   */
  private setupClickOutside(): void {
    // Find the top-level container (stage or root) for click detection
    let topContainer = this.container.parent;
    while (topContainer && topContainer.parent) {
      topContainer = topContainer.parent;
    }
    
    if (topContainer) {
      topContainer.eventMode = 'static';
      topContainer.once('pointerdown', (e) => {
        // Check if click is outside both the select and dropdown
        const point = e.global;
        const selectBounds = this.container.getBounds();
        const dropdownBounds = this.dropdownContainer?.getBounds();

        // Check if point is within select bounds
        const inSelect = point.x >= selectBounds.x && point.x <= selectBounds.x + selectBounds.width &&
                        point.y >= selectBounds.y && point.y <= selectBounds.y + selectBounds.height;
        
        // Check if point is within dropdown bounds
        const inDropdown = dropdownBounds && 
                          point.x >= dropdownBounds.x && point.x <= dropdownBounds.x + dropdownBounds.width &&
                          point.y >= dropdownBounds.y && point.y <= dropdownBounds.y + dropdownBounds.height;

        // Close if click is outside both
        if (!inSelect && !inDropdown) {
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

    // Layout label or text input based on mode
    if (this.props.filterable && this.textInput) {
      this.textInput.layout(measured.width - 30, measured.height); // Reserve space for arrow
      // Center text input vertically
      const textInputMeasured = this.textInput.measure();
      const textInputY = (measured.height - textInputMeasured.height) / 2;
      this.textInput.container.position.set(0, textInputY);
    } else if (this.label) {
      // Layout label with full height to ensure proper vertical centering
      this.label.layout(measured.width - 30, measured.height); // Reserve space for arrow
      // Center label vertically
      const labelMeasured = this.label.measure();
      const labelY = (measured.height - labelMeasured.height) / 2;
      this.label.container.position.set(0, labelY);
    }

    // Update arrow position
    this.updateArrowIndicator();

    // Update disabled visuals if needed
    if (this.props.disabled) {
      this.updateDisabledVisuals();
    }

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
    if (this.props.disabled) return;
    if (this.isControlled) return; // Controlled mode - don't update internal state

    this.selectedValue = value;
    
    if (this.props.filterable && this.textInput) {
      const displayText = this.getDisplayText();
      this.textInput.setValue(displayText === this.props.placeholder ? '' : displayText);
      this.filterText = displayText === this.props.placeholder ? '' : displayText;
    } else if (this.label) {
      this.label.setText(this.getDisplayText());
      this.label.setColor(this.props.textColor);
    }
  }

  /**
   * Gets the current selected value
   */
  getValue(): any {
    return this.selectedValue;
  }

  /**
   * Cleanup keyboard handler
   */
  public destroy(): void {
    if (this.keydownHandler && typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.keydownHandler);
    }
    if (this.isOpen) {
      this.closeDropdown();
    }
    
    // Ensure effects arrays are initialized before destruction
    if (this.container.effects === null) {
      this.container.effects = [];
    }
    if (this.background && this.background.container.effects === null) {
      this.background.container.effects = [];
    }
    if (this.label && this.label.container.effects === null) {
      this.label.container.effects = [];
    }
    if (this.textInput && this.textInput.container.effects === null) {
      this.textInput.container.effects = [];
    }
    if (this.arrowIndicator && this.arrowIndicator.effects === null) {
      this.arrowIndicator.effects = [];
    }
    
    super.destroy();
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
