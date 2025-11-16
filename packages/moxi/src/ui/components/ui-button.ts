import PIXI from 'pixi.js';
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

/**
 * Button visual states
 *
 * @category UI
 */
export enum ButtonState {
  Normal = 'normal',
  Hover = 'hover',
  Pressed = 'pressed',
  Disabled = 'disabled'
}

// Re-export SpriteBackgroundConfig for convenience
export type { SpriteBackgroundConfig } from './button-background-strategy';

/**
 * Props for configuring a UIButton
 *
 * @category UI
 */
export interface UIButtonProps {
  /** Button label text */
  label?: string;
  /** Button width */
  width?: number;
  /** Button height */
  height?: number;
  /** Background color (only used if spriteBackground is not provided) */
  backgroundColor?: number;
  /** Sprite-based background configuration */
  spriteBackground?: SpriteBackgroundConfig;
  /** Text color */
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
}

/**
 * An interactive button component
 * Supports hover, press, and disabled states
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const button = new UIButton({
 *   label: 'Click Me',
 *   width: 150,
 *   height: 40,
 *   backgroundColor: 0x4a90e2,
 *   textColor: 0xffffff,
 *   onClick: () => console.log('Button clicked!')
 * });
 * ```
 */
export class UIButton extends UIComponent {
  private props: Required<Omit<UIButtonProps, 'onClick' | 'onHover' | 'spriteBackground' | 'useBitmapText' | 'bitmapFontFamily'>>;
  private useBitmapText: boolean;
  private bitmapFontFamily?: string;
  private onClick?: () => void;
  private onHover?: () => void;

  private state: ButtonState = ButtonState.Normal;
  private backgroundStrategy: ButtonBackgroundStrategy;
  private label?: UILabel;
  private bitmapLabel?: PIXI.BitmapText;

  // Cached label center position
  private labelCenterX: number = 0;
  private labelCenterY: number = 0;

  // Keyboard handler for cleanup
  private keydownHandler?: (e: KeyboardEvent) => void;

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
          padding: EdgeInsets.zero()
        });
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

  /**
   * Creates a BitmapText label
   */
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

  /**
   * Sets up mouse/touch event handlers
   */
  private setupInteractivity(): void {
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';

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
            this.onClick?.();

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
      this.setState(ButtonState.Hover);
      this.onHover?.();
    }
  }

  private handlePointerOut(): void {
    if (this.props.enabled && this.state !== ButtonState.Pressed) {
      this.setState(ButtonState.Normal);
    }
  }

  private handlePointerDown(): void {
    console.log('🔵 Button handlePointerDown called');
    console.log('  - enabled:', this.props.enabled);
    console.log('  - canFocus:', this.canFocus());
    console.log('  - tabIndex:', this.tabIndex);

    if (this.props.enabled) {
      this.setState(ButtonState.Pressed);

      // Request focus through the focus manager
      if (this.canFocus()) {
        const focusManager = UIFocusManager.getInstance();
        console.log('  - focusManager:', focusManager);
        if (focusManager) {
          console.log('  - Calling requestFocus');
          focusManager.requestFocus(this);
        } else {
          console.log('  - No focus manager, calling onFocus directly');
          // Fallback if no focus manager
          this.onFocus();
        }
      } else {
        console.log('  - canFocus returned false, NOT focusing');
      }
    }
  }

  private handlePointerUp(): void {
    if (this.props.enabled) {
      this.setState(ButtonState.Hover);
      this.onClick?.();
    }
  }

  private handlePointerUpOutside(): void {
    if (this.props.enabled) {
      this.setState(ButtonState.Normal);
    }
  }

  /**
   * Updates the button's visual state
   */
  private setState(newState: ButtonState): void {
    this.state = newState;
    this.updateVisuals();
  }

  /**
   * Updates visuals based on current state
   */
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
      this.label.setPosition(this.labelCenterX, this.labelCenterY + yOffset);
    } else if (this.bitmapLabel) {
      this.bitmapLabel.x = this.labelCenterX;
      this.bitmapLabel.y = this.labelCenterY + yOffset;
    }
  }

  /**
   * Measures the size needed for this button
   */
  measure(): MeasuredSize {
    return {
      width: this.props.width,
      height: this.props.height
    };
  }

  /**
   * Performs layout for this button
   */
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
      const labelLayout = this.label.getLayout();
      this.labelCenterX = (measured.width - labelLayout.width) / 2;
      this.labelCenterY = (actualHeight - labelLayout.height) / 2;
      this.label.setPosition(this.labelCenterX, this.labelCenterY);
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

  /**
   * Renders the button (called after layout)
   */
  protected render(): void {
    // Rendering is handled by background and label
  }

  /**
   * Sets the button label
   */
  setLabel(text: string): void {
    if (this.label) {
      this.label.setText(text);
      this.markLayoutDirty();
    } else if (this.bitmapLabel) {
      this.bitmapLabel.text = text;
      this.markLayoutDirty();
    }
  }

  /**
   * Sets the enabled state
   */
  setEnabled(enabled: boolean): void {
    this.props.enabled = enabled;
    this.setState(enabled ? ButtonState.Normal : ButtonState.Disabled);
  }

  /**
   * Gets the current state
   */
  getState(): ButtonState {
    return this.state;
  }

  /**
   * Cleanup when destroying the button
   */
  destroy(): void {
    if (typeof window !== 'undefined' && this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
    }
    super.destroy();
  }

}
