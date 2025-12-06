import * as PIXI from 'pixi.js';
import { UIComponent } from '../base/ui-component';
import { BoxModel, MeasuredSize } from '../base/box-model';
import { UILabel } from './ui-label';
import { EdgeInsets } from '../base/edge-insets';
import { UIFocusManager } from '../base/ui-focus-manager';
import {
  ButtonBackgroundStrategy,
  SolidColorBackgroundStrategy,
  SpriteBackgroundStrategy,
  SpriteBackgroundConfig
} from './button-background-strategy';
import { ThemeResolver } from '../theming/theme-resolver';
import { ActionManager } from '@moxijs/core';
import { UI_LAYOUT_DEFAULTS } from '../theming/theme-data';
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
  /** MSDF font family name. If provided, uses MSDF (Multi-channel Signed Distance Field) text rendering for crisp text at any scale. Must match the loaded MSDF font's family name. */
  msdfFontFamily?: string;
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
  private props: UIButtonProps;
  private useBitmapText: boolean;
  private bitmapFontFamily?: string;
  /** Local msdfFontFamily prop (can be overridden by parent inheritance) */
  private localMsdfFontFamily?: string;
  private onClick?: () => void;
  private onHover?: () => void;

  // Services (composition) - ThemeApplier removed, using base class helpers

  // Button state
  private state: ButtonState = ButtonState.Normal;
  private backgroundStrategy: ButtonBackgroundStrategy;
  private label?: UILabel;
  private bitmapLabel?: PIXI.BitmapText;
  /** Track if label has been initialized */
  private labelInitialized = false;

  // Cached label center position
  private labelCenterX: number = 0;
  private labelCenterY: number = 0;

  // State is now in base class (enabled, focused, hovered, pressed)

  // Theme resolver is now in base class

  // Event listener management
  private actions = new ActionManager();

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

    // Store props as-is (undefined values mean "inherit" or "default")
    this.props = {
      ...props
    };

    this.useBitmapText = props.useBitmapText ?? false;
    this.bitmapFontFamily = props.bitmapFontFamily;
    this.localMsdfFontFamily = props.msdfFontFamily;
    this.onClick = props.onClick;
    this.onHover = props.onHover;

    // Initialize theme resolver
    this.themeResolver = props.themeResolver;

    // Update component state
    this.enabled = this.props.enabled ?? true;

    // Set box model dimensions if provided
    if (this.props.width !== undefined) {
      this.boxModel.width = this.props.width;
    }
    if (this.props.height !== undefined) {
      this.boxModel.height = this.props.height;
    }

    // Make buttons focusable by default
    this.tabIndex = 0;

    // Create background strategy based on configuration
    // Initial size is 0 or explicit, updated in layout()
    const initialWidth = this.props.width ?? 0;
    const initialHeight = this.props.height ?? 0;
    const initialRadius = this.props.borderRadius ?? 0;

    if (props.spriteBackground) {
      this.backgroundStrategy = new SpriteBackgroundStrategy(
        props.spriteBackground,
        initialWidth,
        initialHeight
      );
    } else {
      this.backgroundStrategy = new SolidColorBackgroundStrategy(
        this.props.backgroundColor ?? 0x4a90e2,
        initialWidth,
        initialHeight,
        initialRadius
      );
    }

    // Create and add background
    const backgroundContainer = this.backgroundStrategy.create(initialWidth, initialHeight);
    this.container.addChild(backgroundContainer);

    // Note: Label creation is deferred to ensureLabel() for font inheritance support

    // Setup interactivity
    this.setupInteractivity();

    // Initial state
    if (this.enabled === false) {
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

  /**
   * Ensures label is created (lazy initialization).
   * Called before measure/render to allow font inheritance from parent.
   */
  private ensureLabel(): void {
    if (this.labelInitialized || !this.props.label) return;
    this.labelInitialized = true;

    if (this.useBitmapText && this.bitmapFontFamily) {
      this.createBitmapLabel();
    } else {
      // Resolve MSDF font family - check local prop first, then inherit from parent
      const effectiveMsdfFont = this.getInheritedMsdfFontFamily(this.localMsdfFontFamily);

      if (effectiveMsdfFont) {
        // Use MSDF text rendering via UILabel (UILabel will also inherit)
        this.label = new UILabel({
          text: this.props.label,
          fontSize: this.props.fontSize,
          color: this.props.textColor,
          align: 'center',
          msdfFontFamily: effectiveMsdfFont
        }, {
          padding: EdgeInsets.zero()
        });
      } else {
        // Regular canvas text
        this.label = new UILabel({
          text: this.props.label,
          fontSize: this.props.fontSize,
          color: this.props.textColor,
          align: 'center'
        }, {
          padding: EdgeInsets.zero()
        });
      }

      // Set parent for inheritance chain (important!)
      this.label.parent = this;
      this.label.container.position.set(0, 0);
      this.container.addChild(this.label.container);
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

    // Handle keyboard interaction when focused
    if (typeof window !== 'undefined') {
      this.actions.add(window, 'keydown', this.handleKeyDown.bind(this) as EventListener);
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
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
    // Resolve defaults and inheritance
    const effectiveHeight = this.props.height
      ?? this.resolveInheritedLayoutParam('controlHeight')
      ?? UI_LAYOUT_DEFAULTS.CONTROL_HEIGHT;

    const effectiveBorderRadius = this.props.borderRadius
      ?? this.resolveInheritedLayoutParam('borderRadius')
      ?? UI_LAYOUT_DEFAULTS.BORDER_RADIUS;

    const effectivePadding = this.props.padding
      ?? (this.resolveInheritedLayoutParam('defaultPadding') !== undefined
        ? EdgeInsets.all(this.resolveInheritedLayoutParam('defaultPadding')!)
        : EdgeInsets.symmetric(8, 16)); // Button default padding

    // Update BoxModel with resolved values for measurement
    if (this.boxModel.height === 'auto' || typeof this.boxModel.height === 'number') {
      if (this.props.height === undefined && this.boxModel.height === 'auto') {
        this.boxModel.height = effectiveHeight;
      }
    }

    // Update padding
    if (!this.props.padding) {
      this.boxModel.padding = effectivePadding;
    }

    // Ensure label exists (lazy init for inheritance support)
    this.ensureLabel();

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

      // Position the label container
      this.label.container.position.set(this.labelCenterX, this.labelCenterY);
    } else if (this.bitmapLabel) {
      // Center the bitmap text
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
    this.actions.removeAll();
    super.destroy();
  }

}
