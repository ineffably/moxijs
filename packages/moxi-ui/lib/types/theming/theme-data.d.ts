import { BaseTheme } from './theme-manager';
export interface DefaultUITheme extends BaseTheme {
    background: number;
    panelBackground: number;
    surfaceBackground: number;
    border: number;
    text: number;
    textSecondary: number;
    controlBackground: number;
    controlBorder: number;
    controlText: number;
    controlSelected: number;
    controlHover: number;
    controlFocus: number;
    controlDisabled: number;
    controlDisabledText: number;
    checkboxCheckmark?: number;
    textInputPlaceholder?: number;
    selectDropdown?: number;
    accent: number;
    accentSecondary?: number;
    error: number;
    success: number;
}
export declare function createDefaultDarkTheme(): DefaultUITheme;
export declare function createDefaultLightTheme(): DefaultUITheme;
