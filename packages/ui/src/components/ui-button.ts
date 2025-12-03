import * as PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { UILabel } from './ui-label';
import { EdgeInsets } from '../core/edge-insets';
import { UIFocusManager } from '../core/ui-focus-manager';
import {
  ButtonBackgroundStrategy,
  SolidColorBackgroundStrategy,
  SpriteBackgroundStrategy,
  SpriteBackgroundConfig
} from './button-background-strategy';
import { ThemeResolver } from '../theming/theme-resolver';
// Theme resolver is now in base class
// ComponentState removed - using base class state properties

/** Button visual states. */
export enum ButtonState {
  Normal = 'normal',
  Hover = 'hover',
  Pressed = 'pressed',
  Disabled = 'disabled'
}

// Re-export SpriteBackgroundConfig for convenience
export type { SpriteBackgroundConfig } from './button-background-strategy';

/** UIButton configuration. */
export interface UIButtonProps {
  /** Button label text */
  label?: string;
  /** Button width */
  width?: number;
  /** Button height */
  height?: number;
  /** Background color (overrides theme, only used if spriteBackground is not provided) */
  backgroundColor?: number;
  /** Sprite-based background configuration */
  spriteBackground?: SpriteBackgroundConfig;
  /** Text color (overrides theme) */
  textColor?: number;
  /** Font size */
  fontSize?: number;
  /** Border radius (only used with backgroundColor) */
  borderRadius?: number;
  /** Padding inside button */
  padding?: EdgeInsets;
  /** Use BitmapText instead of regular text */
  useBitmapText?: boolean;
  /** BitmapText font family (required if useBitmapText is true) */
  bitmapFontFamily?: string;
  /** Click callback */
  onClick?: () => void;
  /** Hover callback */
  onHover?: () => void;
  /** Enabled state */
  enabled?: boolean;
  /** Optional ThemeResolver for automatic color resolution */
  themeResolver?: ThemeResolver;
}

/**
 * Interactive button component with hover, press, and disabled states.
 * Supports solid color or sprite-based backgrounds, bitmap text, and keyboard focus.
 *
 * @example
 * ```ts
 * // Basic button
 * const btn = new UIButton({
 *   label: 'Click Me',
 *   width: 150,
 *   height: 40,
 *   backgroundColor: 0x4a90e2,
 *   textColor: 0xffffff,
 *   onClick: () => console.log('clicked')
 * });
 *
 * // Sprite-based button
 * const spriteBtn = new UIButton({
 *   label: 'Play',
 *   spriteBackground: {
 *     normal: normalTexture,
 *     hover: hoverTexture,
 *     pressed: pressedTexture
 *   }
 * });
 * ```
 */
export class UIButton extends UIComponent {
  // Props
  private props: Required<Omit<UIButtonProps, 'onClick' | 'onHover' | 'spriteBackground' | 'useBitmapText' | 'bitmapFontFamily' | 'themeResolver'>>;
  private useBitmapText: boolean;
  private bitmapFontFamily?: string;
  private onClick?: () => void;
  private onHover?: () => void;

  // Services (composition) - ThemeApplier removed, using base class helpers

  // Button state
  private state: ButtonState = ButtonState.Normal;
  private backgroundStrategy: ButtonBackgroundStrategy;
  private label?: UILabel;
  private bitmapLabel?: PIXI.BitmapText;

  // Cached label center position
  private labelCenterX: number = 0;
  private labelCenterY: number = 0;

  // State is now in base class (enabled, focused, hovered, pressed)

  // Theme resolver is now in base class

  // Keyboard handler for cleanup
  private keydownHandler?: (e: KeyboardEvent) => void;

  /**
   * Safely invoke a callback with error handling
   */
  private safeInvokeCallback(callback?: () => void, callbackName: string = 'callback'): void {
    if (!callback) return;
    try {
      callback();
    } catch (error) {
      console.error(`Error in ${callbackName}:`, error);
    }
  }

  constructor(props: UIButtonProps = {}, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    this.props = {
      label: props.label ?? '',
      width: props.width ?? 120,
      height: props.height ?? 40,
      backgroundColor: props.backgroundColor ?? 0x4a90e2,
      textColor: props.textColor ?? 0xffffff,
      fontSize: props.fontSize ?? 16,
      borderRadius: props.borderRadius ?? 4,
      padding: props.padding ?? EdgeInsets.symmetric(8, 16),
      enabled: props.enabled ?? true
    };

    this.useBitmapText = props.useBitmapText ?? false;
    this.bitmapFontFamily = props.bitmapFontFamily;
    this.onClick = props.onClick;
    this.onHover = props.onHover;

    // Initialize theme resolver
    this.themeResolver = props.themeResolver;

    // Update component state
    this.enabled = this.props.enabled;

    // Set box model dimensions
    this.boxModel.width = this.props.width;
    this.boxModel.height = this.props.height;

    // Make buttons focusable by default
    this.tabIndex = 0;

    // Create background strategy based on configuration
    if (props.spriteBackground) {
      this.backgroundStrategy = new SpriteBackgroundStrategy(
        props.spriteBackground,
        this.props.width,
        this.props.height
      );
    } else {
      this.backgroundStrategy = new SolidColorBackgroundStrategy(
        this.props.backgroundColor,
        this.props.width,
        this.props.height,
        this.props.borderRadius
      );
    }

    // Create and add background
    const backgroundContainer = this.backgroundStrategy.create(this.props.width, this.props.height);
    this.container.addChild(backgroundContainer);

    // Create label if text provided
    if (this.props.label) {
      if (this.useBitmapText && this.bitmapFontFamily) {
        this.createBitmapLabel();
      } else {
        this.label = new UILabel({
          text: this.props.label,
          fontSize: this.props.fontSize,
          color: this.props.textColor,
          align: 'center'
        }, {
          padding: EdgeInsets.zero() // No padding - we'll position manually
        });
        // Disable UILabel's automatic render positioning since we'll center manually
        this.label.container.position.set(0, 0);
        this.container.addChild(this.label.container);
      }
    }

    // Setup interactivity
    this.setupInteractivity();

    // Initial state
    if (!this.props.enabled) {
      this.setState(ButtonState.Disabled);
    }
  }

  /** @internal */
  private createBitmapLabel(): void {
    if (!this.bitmapFontFamily) return;

    this.bitmapLabel = new PIXI.BitmapText({
      text: this.props.label,
      style: {
        fontFamily: this.bitmapFontFamily,
        fontSize: this.props.fontSize,
        fill: this.props.textColor
      }
    });

    this.container.addChild(this.bitmapLabel);
  }

  /** @internal */
  private setupInteractivity(): void {
    this.makeInteractive('pointer');

    this.container.on('pointerover', this.handlePointerOver.bind(this));
    this.container.on('pointerout', this.handlePointerOut.bind(this));
    this.container.on('pointerdown', this.handlePointerDown.bind(this));
    this.container.on('pointerup', this.handlePointerUp.bind(this));
    this.container.on('pointerupoutside', this.handlePointerUpOutside.bind(this));

    // Handle keyboard interaction when focused
    if (typeof window !== 'undefined') {
      this.keydownHandler = (e: KeyboardEvent) => {
        if (this.isFocused() && this.props.enabled) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();

            // Show pressed state
            this.setState(ButtonState.Pressed);

            // Trigger click
            this.safeInvokeCallback(this.onClick, 'onClick');

            // Return to hover state after a short delay (simulating button release)
            setTimeout(() => {
              if (this.props.enabled) {
                this.setState(ButtonState.Normal);
              }
            }, 100);
          }
        }
      };
      window.addEventListener('keydown', this.keydownHandler);
    }
  }

  private handlePointerOver(): void {
    if (this.props.enabled && this.state === ButtonState.Normal) {
      this.hovered = true;
      this.setState(ButtonState.Hover);
      this.safeInvokeCallback(this.onHover, 'onHover');
    }
  }

  private handlePointerOut(): void {
    if (this.props.enabled && this.state !== ButtonState.Pressed) {
      this.hovered = false;
      this.setState(ButtonState.Normal);
    }
  }

  private handlePointerDown(): void {
    if (this.props.enabled) {
      this.pressed = true;
      this.setState(ButtonState.Pressed);

      // Request focus through the focus manager
      if (this.canFocus()) {
        const focusManager = UIFocusManager.getInstance();
        if (focusManager) {
          focusManager.requestFocus(this);
        } else {
          // Fallback if no focus manager
          this.onFocus();
        }
      }
    }
  }

  private handlePointerUp(): void {
    if (this.props.enabled) {
      this.pressed = false;
      this.hovered = true;
      this.setState(ButtonState.Hover);
      this.safeInvokeCallback(this.onClick, 'onClick');
    }
  }

  private handlePointerUpOutside(): void {
    if (this.props.enabled) {
      this.pressed = false;
      this.hovered = false;
      this.setState(ButtonState.Normal);
    }
  }

  /** @internal */
  private setState(newState: ButtonState): void {
    this.state = newState;
    this.updateVisuals();
  }

  /** @internal */
  private updateVisuals(): void {
    // Update background using strategy
    this.backgroundStrategy.updateState(this.state);

    // Calculate depth offset for pressed state
    const yOffset = this.state === ButtonState.Pressed ? 2 : 0;

    // Update cursor for disabled state
    if (this.state === ButtonState.Disabled) {
      this.container.cursor = 'default';
    } else {
      this.container.cursor = 'pointer';
    }

    // Apply depth offset to label
    if (this.label) {
      this.label.container.position.set(this.labelCenterX, this.labelCenterY + yOffset);
    } else if (this.bitmapLabel) {
      this.bitmapLabel.x = this.labelCenterX;
      this.bitmapLabel.y = this.labelCenterY + yOffset;
    }
  }

  /** @internal */
  measure(): MeasuredSize {
    return {
      width: this.props.width,
      height: this.props.height
    };
  }

  /** @internal */
  layout(availableWidth: number, availableHeight: number): void {
    const measured = this.measure();

    this.computedLayout.width = measured.width;
    this.computedLayout.height = measured.height;

    // Get actual background height from strategy
    const actualHeight = this.backgroundStrategy.getActualHeight();

    // Layout and center label
    if (this.label) {
      this.label.layout(measured.width, measured.height);

      // Center the label and cache the position
      // Use the label's layout dimensions which account for DPR scaling correctly
      const labelLayout = this.label.getLayout();
      this.labelCenterX = (measured.width - labelLayout.width) / 2;
      this.labelCenterY = (actualHeight - labelLayout.height) / 2;
      
      // Position the label container (not the text object directly)
      this.label.container.position.set(this.labelCenterX, this.labelCenterY);
    } else if (this.bitmapLabel) {
      // Center the bitmap text using actual background height
      this.labelCenterX = (measured.width - this.bitmapLabel.width) / 2;
      this.labelCenterY = (actualHeight - this.bitmapLabel.height) / 2;
      this.bitmapLabel.x = this.labelCenterX;
      this.bitmapLabel.y = this.labelCenterY;
    }

    this.layoutDirty = false;
    this.render();
  }

  /** @internal */
  protected render(): void {
    // Rendering is handled by background and label
  }

  /** Update button text. */
  setLabel(text: string): void {
    if (this.label) {
      this.label.setText(text);
      this.markLayoutDirty();
    } else if (this.bitmapLabel) {
      this.bitmapLabel.text = text;
      this.markLayoutDirty();
    }
  }

  /** Enable or disable the button. */
  setEnabled(enabled: boolean): void {
    this.props.enabled = enabled;
    this.enabled = enabled;
    this.setState(enabled ? ButtonState.Normal : ButtonState.Disabled);
  }

  /** Get current visual state. */
  getState(): ButtonState {
    return this.state;
  }

  /** Clean up event listeners. */
  destroy(): void {
    if (typeof window !== 'undefined' && this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
    }
    super.destroy();
  }

}
