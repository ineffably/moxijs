/**
 * Theme Resolver
 * 
 * Single Responsibility: Resolve colors from theme data.
 * Pure functions - takes data, returns data.
 * No component knowledge, no side effects.
 */

import { DefaultUITheme } from './theme-data';

export type ColorType = 'background' | 'border' | 'text' | 'selected' | 'hover' | 'focus' | 'disabled';
export type ControlType = 'checkbox' | 'textInput' | 'textArea' | 'button' | 'radio' | 'select';

/**
 * Theme Resolver
 * 
 * Resolves colors from theme data following the fallback chain:
 * override → control-specific → generic → fallback
 */
export class ThemeResolver {
  constructor(private theme: DefaultUITheme) {}

  /**
   * Get a generic control color
   * 
   * @param type - Color type (background, border, text, etc.)
   * @param override - Optional override value (highest priority)
   * @returns Resolved color value
   */
  getColor(type: ColorType, override?: number): number {
    if (override !== undefined) return override;
    
    const key = `control${this.capitalize(type)}` as keyof DefaultUITheme;
    const value = this.theme[key];
    
    if (typeof value === 'number') {
      return value;
    }
    
    // Fallback to controlBackground if specific type not found
    return this.theme.controlBackground;
  }

  /**
   * Get a control-specific color with fallback to generic
   * 
   * @param controlType - Control type (checkbox, textInput, etc.)
   * @param type - Color type (background, border, text, etc.)
   * @param override - Optional override value (highest priority)
   * @returns Resolved color value
   */
  getControlColor(controlType: ControlType, type: ColorType, override?: number): number {
    if (override !== undefined) return override;
    
    // Check for control-specific override
    const controlKey = `${controlType}${this.capitalize(type)}` as keyof DefaultUITheme;
    const controlValue = this.theme[controlKey];
    
    if (typeof controlValue === 'number') {
      return controlValue;
    }
    
    // Fall back to generic
    return this.getColor(type);
  }

  /**
   * Get control-specific property (like checkboxCheckmark, textInputPlaceholder)
   * 
   * @param propertyName - Property name (e.g., 'checkboxCheckmark')
   * @param fallback - Fallback value if property doesn't exist
   * @returns Property value or fallback
   */
  getControlProperty(propertyName: keyof DefaultUITheme, fallback: number): number {
    const value = this.theme[propertyName];
    return typeof value === 'number' ? value : fallback;
  }

  /**
   * Get text color (with secondary fallback)
   */
  getTextColor(override?: number): number {
    if (override !== undefined) return override;
    return this.theme.text;
  }

  /**
   * Get secondary text color
   */
  getTextSecondary(override?: number): number {
    if (override !== undefined) return override;
    return this.theme.textSecondary;
  }

  /**
   * Get placeholder color (for text inputs/areas)
   */
  getPlaceholderColor(override?: number): number {
    if (override !== undefined) return override;
    return this.getControlProperty('textInputPlaceholder', this.theme.textSecondary);
  }

  /**
   * Get checkbox checkmark color
   */
  getCheckmarkColor(override?: number): number {
    if (override !== undefined) return override;
    return this.getControlProperty('checkboxCheckmark', this.theme.controlText);
  }

  /**
   * Get select dropdown background
   */
  getSelectDropdownBackground(override?: number): number {
    if (override !== undefined) return override;
    return this.getControlProperty('selectDropdown', this.theme.controlBackground);
  }

  /**
   * Helper to capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

