import { UIComponent } from './ui-component';
export interface Focusable {
    canFocus(): boolean;
    onFocus(): void;
    onBlur(): void;
    tabIndex: number;
    isFocused(): boolean;
}
export declare class UIFocusManager {
    private static instance;
    private focusableComponents;
    private currentFocusIndex;
    private keydownHandler;
    constructor();
    static getInstance(): UIFocusManager | null;
    private setupKeyboardListeners;
    register(component: UIComponent & Focusable): void;
    registerContainer(container: UIComponent): void;
    private discoverFocusableComponents;
    private isFocusableComponent;
    unregister(component: UIComponent & Focusable): void;
    private sortByTabIndex;
    focus(component: UIComponent & Focusable): void;
    requestFocus(component: UIComponent & Focusable): void;
    blur(): void;
    focusNext(): void;
    focusPrevious(): void;
    focusFirst(): void;
    focusLast(): void;
    getCurrentFocus(): (UIComponent & Focusable) | null;
    getFocusableComponents(): (UIComponent & Focusable)[];
    clear(): void;
    destroy(): void;
}
