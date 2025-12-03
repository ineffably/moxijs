import PIXI from 'pixi.js';
import { DefaultUITheme } from '../theming/theme-data';
import { ThemeResolver } from '../theming/theme-resolver';
export interface ComponentState {
    enabled: boolean;
    focused: boolean;
    hovered: boolean;
    pressed: boolean;
    checked?: boolean;
}
export declare class ThemeApplier {
    private resolver;
    constructor(theme: DefaultUITheme);
    applyBackground(graphics: PIXI.Graphics, state: ComponentState, override?: number): number;
    applyTextColor(state: ComponentState, override?: number): number;
    applyPlaceholderColor(override?: number): number;
    applyBorderColor(state: ComponentState, override?: number): number;
    applyCheckmarkColor(override?: number): number;
    getResolver(): ThemeResolver;
}
