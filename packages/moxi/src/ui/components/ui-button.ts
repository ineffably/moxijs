import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { UILabel } from './ui-label';
import { UIPanel } from './ui-panel';
import { EdgeInsets } from '../core/edge-insets';

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
  /** Background color */
  backgroundColor?: number;
  /** Text color */
  textColor?: number;
  /** Font size */
  fontSize?: number;
  /** Border radius */
  borderRadius?: number;
  /** Padding inside button */
  padding?: EdgeInsets;
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
  private props: Required<Omit<UIButtonProps, 'onClick' | 'onHover'>>;
  private onClick?: () => void;
  private onHover?: () => void;

  private state: ButtonState = ButtonState.Normal;
  private background: UIPanel;
  private label?: UILabel;

  // Original colors for state transitions
  private normalColor: number;
  private hoverColor: number;
  private pressedColor: number;
  private disabledColor: number;

  // Cached label center position
  private labelCenterX: number = 0;
  private labelCenterY: number = 0;

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

    this.onClick = props.onClick;
    this.onHover = props.onHover;

    // Calculate state colors (darken for hover/press, desaturate for disabled)
    this.normalColor = this.props.backgroundColor;
    this.hoverColor = this.darkenColor(this.normalColor, 0.9);
    this.pressedColor = this.darkenColor(this.normalColor, 0.8);
    this.disabledColor = 0x888888;

    // Set box model dimensions
    this.boxModel.width = this.props.width;
    this.boxModel.height = this.props.height;

    // Create background panel
    this.background = new UIPanel({
      backgroundColor: this.normalColor,
      width: this.props.width,
      height: this.props.height,
      borderRadius: this.props.borderRadius
    });
    this.container.addChild(this.background.container);

    // Create label if text provided
    if (this.props.label) {
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

    // Setup interactivity
    this.setupInteractivity();

    // Initial state
    if (!this.props.enabled) {
      this.setState(ButtonState.Disabled);
    }
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
    if (this.props.enabled) {
      this.setState(ButtonState.Pressed);
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
    let color: number;
    let yOffset = 0;

    switch (this.state) {
      case ButtonState.Normal:
        color = this.normalColor;
        break;
      case ButtonState.Hover:
        color = this.hoverColor;
        break;
      case ButtonState.Pressed:
        color = this.pressedColor;
        yOffset = 2; // Depth effect
        break;
      case ButtonState.Disabled:
        color = this.disabledColor;
        this.container.cursor = 'default';
        break;
    }

    this.background.setBackgroundColor(color);

    // Apply depth offset while maintaining centered position
    if (this.label) {
      this.label.setPosition(this.labelCenterX, this.labelCenterY + yOffset);
    }
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

    // Layout background
    this.background.layout(measured.width, measured.height);

    // Layout and center label
    if (this.label) {
      this.label.layout(measured.width, measured.height);

      // Center the label and cache the position
      const labelLayout = this.label.getLayout();
      this.labelCenterX = (measured.width - labelLayout.width) / 2;
      this.labelCenterY = (measured.height - labelLayout.height) / 2;
      this.label.setPosition(this.labelCenterX, this.labelCenterY);
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
}
