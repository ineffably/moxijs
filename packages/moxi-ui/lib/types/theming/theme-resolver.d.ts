import { DefaultUITheme } from './theme-data';
export type ColorType = 'background' | 'border' | 'text' | 'selected' | 'hover' | 'focus' | 'disabled';
export type ControlType = 'checkbox' | 'textInput' | 'textArea' | 'button' | 'radio' | 'select';
export declare class ThemeResolver {
    private theme;
    constructor(theme: DefaultUITheme);
    getColor(type: ColorType, override?: number): number;
    getControlColor(controlType: ControlType, type: ColorType, override?: number): number;
    getControlProperty(propertyName: keyof DefaultUITheme, fallback: number): number;
    getTextColor(override?: number): number;
    getTextSecondary(override?: number): number;
    getPlaceholderColor(override?: number): number;
    getCheckmarkColor(override?: number): number;
    getSelectDropdownBackground(override?: number): number;
    private capitalize;
}
