/**
 * Theme Applier Service
 * 
 * Single Responsibility: Apply theme colors to visual elements.
 * Pure service - takes theme data + state → applies colors to graphics/text.
 * 
 * @category UI Services
 */

import PIXI from 'pixi.js';
import { DefaultUITheme } from '../theming/theme-data';
import { ThemeResolver } from '../theming/theme-resolver';

/**
 * Component visual state
 */
export interface ComponentState {
  enabled: boolean;
  focused: boolean;
  hovered: boolean;
  pressed: boolean;
  checked?: boolean;
}

/**
 * Theme Applier
 * 
 * Applies theme colors to visual elements based on component state.
 * Separates theme resolution from visual application.
 */
export class ThemeApplier {
  private resolver: ThemeResolver;

  constructor(theme: DefaultUITheme) {
    this.resolver = new ThemeResolver(theme);
  }

  /**
   * Apply background color to graphics based on state
   */
  applyBackground(
    graphics: PIXI.Graphics,
    state: ComponentState,
    override?: number
  ): number {
    if (!state.enabled) {
      return this.resolver.getColor('disabled', override);
    }

    if (state.pressed) {
      return this.resolver.getColor('selected', override);
    }

    if (state.hovered) {
      return this.resolver.getColor('hover', override);
    }

    if (state.focused) {
      return this.resolver.getColor('focus', override);
    }

    if (state.checked !== undefined && state.checked) {
      return this.resolver.getColor('selected', override);
    }

    return this.resolver.getColor('background', override);
  }

  /**
   * Apply text color based on state
   */
  applyTextColor(
    state: ComponentState,
    override?: number
  ): number {
    if (!state.enabled) {
      return this.resolver.getColor('disabled');
    }

    return this.resolver.getTextColor(override);
  }

  /**
   * Apply placeholder color
   */
  applyPlaceholderColor(override?: number): number {
    return this.resolver.getPlaceholderColor(override);
  }

  /**
   * Apply border color based on state
   */
  applyBorderColor(
    state: ComponentState,
    override?: number
  ): number {
    if (!state.enabled) {
      return this.resolver.getColor('disabled');
    }

    if (state.hovered) {
      return this.resolver.getColor('hover', override);
    }

    return this.resolver.getColor('border', override);
  }

  /**
   * Apply checkmark color (for checkboxes)
   */
  applyCheckmarkColor(override?: number): number {
    return this.resolver.getCheckmarkColor(override);
  }

  /**
   * Get the theme resolver (for advanced use cases)
   */
  getResolver(): ThemeResolver {
    return this.resolver;
  }
}

