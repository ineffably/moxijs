import { UIComponent } from './ui-component';
/**
 * Interface for focusable UI components
 *
 * @category UI
 */
export interface Focusable {
    /** Whether this component can receive focus */
    canFocus(): boolean;
    /** Called when component receives focus */
    onFocus(): void;
    /** Called when component loses focus */
    onBlur(): void;
    /** The tab index for focus order (lower values focused first) */
    tabIndex: number;
    /** Whether this component is currently focused */
    isFocused(): boolean;
}
/**
 * Manages keyboard focus and tab navigation for UI components
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const focusManager = new UIFocusManager();
 * focusManager.register(button1);
 * focusManager.register(textInput1);
 * focusManager.register(button2);
 *
 * // Focus first component
 * focusManager.focusFirst();
 *
 * // Or focus specific component
 * focusManager.focus(textInput1);
 * ```
 */
export declare class UIFocusManager {
    private static instance;
    private focusableComponents;
    private currentFocusIndex;
    private keydownHandler;
    constructor();
    /**
     * Gets the current global focus manager instance
     */
    static getInstance(): UIFocusManager | null;
    /**
     * Sets up global keyboard listeners for tab navigation
     */
    private setupKeyboardListeners;
    /**
     * Registers a focusable component
     */
    register(component: UIComponent & Focusable): void;
    /**
     * Automatically discovers and registers all focusable components in a container
     * Walks the component tree and finds all components with tabIndex >= 0
     */
    registerContainer(container: UIComponent): void;
    /**
     * Recursively discovers focusable components in the tree
     */
    private discoverFocusableComponents;
    /**
     * Checks if a component implements the Focusable interface
     */
    private isFocusableComponent;
    /**
     * Unregisters a focusable component
     */
    unregister(component: UIComponent & Focusable): void;
    /**
     * Sorts components by tab index
     */
    private sortByTabIndex;
    /**
     * Focuses a specific component
     */
    focus(component: UIComponent & Focusable): void;
    /**
     * Request focus for a component (called by components when clicked)
     * This is a helper that finds the component and calls focus()
     */
    requestFocus(component: UIComponent & Focusable): void;
    /**
     * Blurs the currently focused component
     */
    blur(): void;
    /**
     * Focuses the next component in tab order
     */
    focusNext(): void;
    /**
     * Focuses the previous component in tab order
     */
    focusPrevious(): void;
    /**
     * Focuses the first focusable component
     */
    focusFirst(): void;
    /**
     * Focuses the last focusable component
     */
    focusLast(): void;
    /**
     * Gets the currently focused component
     */
    getCurrentFocus(): (UIComponent & Focusable) | null;
    /**
     * Gets all registered focusable components
     */
    getFocusableComponents(): (UIComponent & Focusable)[];
    /**
     * Clears all registered components
     */
    clear(): void;
    /**
     * Cleanup when destroying the focus manager
     */
    destroy(): void;
}
