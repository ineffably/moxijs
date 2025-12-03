/**
 * Simplified Theme Data Structures
 * 
 * Pure data structures - no logic.
 * Follows KISS, SRP, and Separation of Concerns principles.
 */

import { BaseTheme } from './theme-manager';

/**
 * Default UI Theme Interface
 * 
 * Simplified to ~15 generic properties + minimal control-specific overrides.
 * All controls inherit from generic colors by default.
 */
export interface DefaultUITheme extends BaseTheme {
  // === Base Colors ===
  /** Background color for main workspace/viewport */
  background: number;
  /** Background color for panels/cards */
  panelBackground: number;
  /** Background color for elevated surfaces */
  surfaceBackground: number;
  /** General border color */
  border: number;
  
  // === Text Colors ===
  /** Primary text color */
  text: number;
  /** Secondary/muted text color */
  textSecondary: number;
  
  // === Generic Control Colors (Used by ALL controls) ===
  /** Default background for all controls (buttons, inputs, checkboxes, etc.) */
  controlBackground: number;
  /** Default border color for all controls */
  controlBorder: number;
  /** Default text color for all controls */
  controlText: number;
  /** Background color when control is selected/checked */
  controlSelected: number;
  /** Background color on hover */
  controlHover: number;
  /** Background color when focused */
  controlFocus: number;
  /** Background color when disabled */
  controlDisabled: number;
  /** Text color when disabled */
  controlDisabledText: number;
  
  // === Minimal Control-Specific Overrides (Only when truly different) ===
  /** Checkbox checkmark color (checkbox-specific) */
  checkboxCheckmark?: number;
  /** Text input placeholder color (input-specific) */
  textInputPlaceholder?: number;
  /** Select dropdown panel background (select-specific) */
  selectDropdown?: number;
  
  // === Accent & Status Colors ===
  /** Primary accent color */
  accent: number;
  /** Secondary accent color */
  accentSecondary?: number;
  /** Error/warning color */
  error: number;
  /** Success color */
  success: number;
}

/**
 * Create a default dark theme
 */
export function createDefaultDarkTheme(): DefaultUITheme {
  return {
    // Base colors
    background: 0x1e1e1e,
    panelBackground: 0x2a2a2a,
    surfaceBackground: 0x333333,
    border: 0x404040,
    
    // Text colors
    text: 0xffffff,
    textSecondary: 0xcccccc,
    
    // Generic control colors (used by ALL controls)
    controlBackground: 0x2a2a2a,
    controlBorder: 0x404040,
    controlText: 0xffffff,
    controlSelected: 0x4a90e2,      // Blue for selected/checked
    controlHover: 0x353535,
    controlFocus: 0x353535,
    controlDisabled: 0x3a3a3a,
    controlDisabledText: 0x666666,
    
    // Control-specific overrides (only when different)
    checkboxCheckmark: 0xffffff,     // White checkmark on blue
    textInputPlaceholder: 0x999999,  // Muted placeholder
    selectDropdown: 0x2a2a2a,        // Same as controlBackground
    
    // Accent & status
    accent: 0x4a90e2,
    accentSecondary: 0x6a8a9a,
    error: 0xdc3545,
    success: 0x28a745
  };
}

/**
 * Create a default light theme
 */
export function createDefaultLightTheme(): DefaultUITheme {
  return {
    // Base colors
    background: 0xffffff,
    panelBackground: 0xf5f5f5,
    surfaceBackground: 0xeeeeee,
    border: 0xdddddd,
    
    // Text colors
    text: 0x000000,
    textSecondary: 0x666666,
    
    // Generic control colors (used by ALL controls)
    controlBackground: 0xffffff,
    controlBorder: 0xdddddd,
    controlText: 0x000000,
    controlSelected: 0x4a90e2,       // Blue for selected/checked
    controlHover: 0xf0f0f0,
    controlFocus: 0xf0f0f0,
    controlDisabled: 0xf5f5f5,
    controlDisabledText: 0x999999,
    
    // Control-specific overrides (only when different)
    checkboxCheckmark: 0xffffff,     // White checkmark on blue
    textInputPlaceholder: 0x999999,  // Muted placeholder
    selectDropdown: 0xffffff,        // Same as controlBackground
    
    // Accent & status
    accent: 0x4a90e2,
    accentSecondary: 0x6a8a9a,
    error: 0xdc3545,
    success: 0x28a745
  };
}

