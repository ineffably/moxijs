/**
 * UITextInput - Refactored with Composition Services
 * 
 * This is a proof-of-concept refactored version using:
 * - LayoutEngine for layout calculations
 * - TextInputHandler for keyboard/cursor management
 * - FormStateManager for state management
 * - ThemeApplier for theming
 * 
 * @category UI
 */

import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { UIPanel } from './ui-panel';
import { UIFocusManager } from '../core/ui-focus-manager';
import { asTextDPR } from '../../library/as-pixi';
import { ThemeResolver } from '../theming/theme-resolver';
import { DefaultUITheme, createDefaultDarkTheme } from '../theming/theme-data';
import {
  LayoutEngine,
  FormStateManager,
  TextInputHandler,
  ThemeApplier,
  ComponentState
} from '../services';

/**
 * Props for configuring a UITextInput
 *
 * @category UI
 */
export interface UITextInputProps {
  /** Current value (controlled) */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Change callback */
  onChange?: (value: string) => void;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Maximum character length */
  maxLength?: number;
  /** Width of the input */
  width?: number;
  /** Height of the input */
  height?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Background color (overrides theme) */
  backgroundColor?: number;
  /** Text color (overrides theme) */
  textColor?: number;
  /** Placeholder text color (overrides theme) */
  placeholderColor?: number;
  /** Border radius */
  borderRadius?: number;
  /** Font size */
  fontSize?: number;
  /** Input type for validation */
  type?: 'text' | 'number';
  /** Optional ThemeResolver for automatic color resolution */
  themeResolver?: ThemeResolver;
}

/**
 * A text input component using composition services
 * Supports both controlled and uncontrolled modes
 *
 * @category UI
 */
export class UITextInput extends UIComponent {
  // Props
  private props: Required<Omit<UITextInputProps, 'onChange' | 'value' | 'defaultValue' | 'themeResolver'>>;
  
  // Services (composition)
  private layoutEngine: LayoutEngine;
  private stateManager: FormStateManager<string>;
  private inputHandler: TextInputHandler;
  private themeApplier: ThemeApplier;
  
  // Visual elements
  private background: UIPanel;
  private textDisplay: PIXI.Text;
  private cursor: PIXI.Graphics;
  
  // Cursor blink state
  private cursorBlinkInterval?: number;
  private cursorVisible: boolean = true;
  
  // Component state (data-driven)
  private componentState: ComponentState = {
    enabled: true,
    focused: false,
    hovered: false,
    pressed: false
  };
  
  // Theme data
  private theme: DefaultUITheme;
  private themeResolver?: ThemeResolver;
  private colorOverrides: {
    backgroundColor?: number;
    textColor?: number;
    placeholderColor?: number;
  } = {};

  constructor(props: UITextInputProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    // Initialize props
    this.props = {
      placeholder: props.placeholder ?? '',
      maxLength: props.maxLength ?? 100,
      width: props.width ?? 200,
      height: props.height ?? 36,
      disabled: props.disabled ?? false,
      backgroundColor: props.backgroundColor ?? 0xffffff,
      textColor: props.textColor ?? 0x000000,
      placeholderColor: props.placeholderColor ?? 0x999999,
      borderRadius: props.borderRadius ?? 4,
      fontSize: props.fontSize ?? 14,
      type: props.type ?? 'text'
    };

    // Store color overrides
    this.colorOverrides = {
      backgroundColor: props.backgroundColor,
      textColor: props.textColor,
      placeholderColor: props.placeholderColor
    };

    // Initialize theme
    // If themeResolver is provided, store it for direct color resolution
    // Otherwise use default theme
    this.themeResolver = props.themeResolver;
    this.theme = createDefaultDarkTheme();
    
    // TODO: Add getTheme() method to ThemeResolver to access theme data
    // For now, if themeResolver is provided, we'll use it directly for color resolution
    
    // Initialize services
    this.layoutEngine = new LayoutEngine();
    this.stateManager = new FormStateManager({
      value: props.value,
      defaultValue: props.defaultValue,
      onChange: props.onChange
    });
    this.inputHandler = new TextInputHandler({
      value: this.stateManager.getValue(),
      maxLength: this.props.maxLength,
      type: this.props.type,
      multiline: false,
      onChange: (value) => {
        this.stateManager.setValue(value);
        this.updateText();
      }
    });
    this.themeApplier = new ThemeApplier(this.theme);

    // Update component state
    this.componentState.enabled = !this.props.disabled;

    // Set box model dimensions
    this.boxModel.width = this.props.width;
    this.boxModel.height = this.props.height;

    // Create visual elements
    this.createVisuals();

    // Setup interactivity
    this.setupInteractivity();
  }

  /**
   * Create visual elements
   */
  private createVisuals(): void {
    // Create background
    // Use themeResolver directly if available, otherwise use themeApplier
    const bgColor = this.themeResolver
      ? this.themeResolver.getColor('background', this.colorOverrides.backgroundColor)
      : this.themeApplier.applyBackground(
          {} as PIXI.Graphics, // Dummy - we'll use UIPanel
          this.componentState,
          this.colorOverrides.backgroundColor
        );
    
    this.background = new UIPanel({
      backgroundColor: bgColor,
      width: this.props.width,
      height: this.props.height,
      borderRadius: this.props.borderRadius
    });
    this.container.addChild(this.background.container);

    // Create text display
    const displayText = this.getDisplayText();
    const textColor = displayText === this.props.placeholder
      ? (this.themeResolver
          ? this.themeResolver.getPlaceholderColor(this.colorOverrides.placeholderColor)
          : this.themeApplier.applyPlaceholderColor(this.colorOverrides.placeholderColor))
      : (this.themeResolver
          ? this.themeResolver.getTextColor(this.colorOverrides.textColor)
          : this.themeApplier.applyTextColor(this.componentState, this.colorOverrides.textColor));

    this.textDisplay = asTextDPR({
      text: displayText,
      style: {
        fontFamily: 'PixelOperator8',
        fontSize: this.props.fontSize,
        fill: textColor,
        align: 'left'
      },
      dprScale: 2,
      pixelPerfect: true
    });
    const textY = Math.round((this.props.height - this.props.fontSize) / 2);
    this.textDisplay.position.set(12, textY);
    this.textDisplay.roundPixels = true;
    this.container.addChild(this.textDisplay);

    // Create cursor
    this.cursor = new PIXI.Graphics();
    this.cursor.visible = false;
    this.container.addChild(this.cursor);
  }

  /**
   * Gets the display text (value or placeholder)
   */
  private getDisplayText(): string {
    const value = this.stateManager.getValue();
    return value || this.props.placeholder;
  }

  /**
   * Sets up mouse/keyboard event handlers
   */
  private setupInteractivity(): void {
    this.container.eventMode = 'static';
    this.container.cursor = 'text';

    // Click to focus
    this.container.on('pointerdown', this.handlePointerDown.bind(this));

    // Listen for global keyboard events
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
  }

  private handlePointerDown(e: PIXI.FederatedPointerEvent): void {
    if (this.props.disabled) return;

    const focusManager = UIFocusManager.getInstance();
    if (focusManager) {
      focusManager.requestFocus(this);
    } else {
      this.onFocus();
    }
    e.stopPropagation();
  }

  /**
   * Called when input receives focus
   */
  override onFocus(): void {
    if (this.focused) return;

    super.onFocus();
    this.componentState.focused = true;
    
    // Set cursor position
    this.inputHandler.setCursorPosition(this.stateManager.getValue().length);
    this.cursor.visible = true;
    this.updateCursor();
    this.startCursorBlink();

    // Update background for focus state
    this.updateBackground();
  }

  /**
   * Called when input loses focus
   */
  override onBlur(): void {
    if (!this.focused) return;

    super.onBlur();
    this.componentState.focused = false;
    this.cursor.visible = false;
    this.stopCursorBlink();

    // Update background for normal state
    this.updateBackground();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.focused || this.props.disabled) return;

    // Handle Enter/Escape for blur
    if (e.key === 'Enter' || e.key === 'Escape') {
      this.onBlur();
      return;
    }

    // Delegate keyboard handling to TextInputHandler
    const handled = this.inputHandler.handleKeyDown(e);
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      this.updateCursor();
    }
  }

  /**
   * Update text display
   */
  private updateText(): void {
    const value = this.stateManager.getValue();
    const displayText = this.getDisplayText();
    
    this.textDisplay.text = displayText;
    
    // Update text color based on whether showing placeholder
    const textColor = value
      ? (this.themeResolver
          ? this.themeResolver.getTextColor(this.colorOverrides.textColor)
          : this.themeApplier.applyTextColor(this.componentState, this.colorOverrides.textColor))
      : (this.themeResolver
          ? this.themeResolver.getPlaceholderColor(this.colorOverrides.placeholderColor)
          : this.themeApplier.applyPlaceholderColor(this.colorOverrides.placeholderColor));
    
    this.textDisplay.style.fill = textColor;
    this.updateCursor();
  }

  /**
   * Update cursor position visually
   */
  private updateCursor(): void {
    const value = this.stateManager.getValue();
    const cursorPos = this.inputHandler.getCursorPosition();
    const textUpToCursor = value.substring(0, cursorPos);
    
    const dprScale = 2;
    const tempText = new PIXI.Text({
      text: textUpToCursor,
      style: {
        fontFamily: 'PixelOperator8',
        fontSize: this.props.fontSize * dprScale,
        fill: this.textDisplay.style.fill,
        align: 'left'
      }
    });
    
    if (tempText.effects === null) {
      tempText.effects = [];
    }

    const cursorX = 12 + (tempText.width / dprScale);
    const cursorY = (this.props.height - this.props.fontSize) / 2;

    this.cursor.clear();
    this.cursor.rect(cursorX, cursorY, 1, this.props.fontSize);
    const cursorColor = this.themeResolver
      ? this.themeResolver.getTextColor(this.colorOverrides.textColor)
      : this.themeApplier.applyTextColor(this.componentState, this.colorOverrides.textColor);
    this.cursor.fill({ color: cursorColor });

    tempText.destroy();
  }

  /**
   * Update background based on state
   */
  private updateBackground(): void {
    const bgColor = this.themeResolver
      ? this.themeResolver.getColor(
          this.componentState.focused ? 'focus' : 'background',
          this.colorOverrides.backgroundColor
        )
      : this.themeApplier.applyBackground(
          {} as PIXI.Graphics,
          this.componentState,
          this.colorOverrides.backgroundColor
        );

    // Recreate background panel with new color
    const oldBackground = this.background;
    this.background = new UIPanel({
      backgroundColor: bgColor,
      width: this.props.width,
      height: this.props.height,
      borderRadius: this.props.borderRadius
    });
    
    // Replace in container
    const index = this.container.getChildIndex(oldBackground.container);
    this.container.removeChild(oldBackground.container);
    this.container.addChildAt(this.background.container, index);
    oldBackground.destroy();
  }

  /**
   * Start cursor blinking animation
   */
  private startCursorBlink(): void {
    this.stopCursorBlink();
    this.cursorVisible = true;

    this.cursorBlinkInterval = window.setInterval(() => {
      this.cursorVisible = !this.cursorVisible;
      this.cursor.visible = this.cursorVisible;
    }, 530);
  }

  /**
   * Stop cursor blinking animation
   */
  private stopCursorBlink(): void {
    if (this.cursorBlinkInterval) {
      window.clearInterval(this.cursorBlinkInterval);
      this.cursorBlinkInterval = undefined;
    }
  }

  /**
   * Measures the size needed for this input
   */
  measure(): MeasuredSize {
    const contentSize: MeasuredSize = {
      width: this.props.width,
      height: this.props.height
    };
    
    return this.layoutEngine.measure(this.boxModel, contentSize);
  }

  /**
   * Performs layout for this input
   */
  layout(availableWidth: number, availableHeight: number): void {
    const measured = this.measure();
    
    // Use LayoutEngine to calculate layout
    this.computedLayout = this.layoutEngine.layout(
      this.boxModel,
      measured,
      { width: availableWidth, height: availableHeight }
    );

    // Layout background
    this.background.layout(measured.width, measured.height);

    this.layoutDirty = false;
    this.render();
  }

  /**
   * Renders the input
   */
  protected render(): void {
    // Rendering handled by background, text, and cursor
  }

  /**
   * Sets the value programmatically
   */
  setValue(value: string): void {
    this.stateManager.setValue(value);
    this.inputHandler.setValue(value);
    this.inputHandler.setCursorPosition(value.length);
    this.updateText();
  }

  /**
   * Gets the current value
   */
  getValue(): string {
    return this.stateManager.getValue();
  }

  /**
   * Update value (for controlled mode)
   */
  updateValue(value: string): void {
    this.stateManager.updateValue(value);
    this.inputHandler.setValue(value);
    this.updateText();
  }

  /**
   * Cleanup when destroying
   */
  destroy(): void {
    this.stopCursorBlink();
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }
    super.destroy();
  }
}

