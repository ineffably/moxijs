/**
 * EventManager - Centralized event listener management utility
 *
 * Prevents memory leaks by tracking all registered event listeners and providing
 * batch cleanup functionality. Particularly useful for components that need to
 * register multiple window/document listeners and clean them up on destroy.
 */
export interface EventRegistration {
    target: EventTarget;
    type: string;
    handler: EventListener;
    options?: AddEventListenerOptions;
}
/**
 * Manages event listener lifecycle to prevent memory leaks
 */
export declare class EventManager {
    private registrations;
    /**
     * Register an event listener and track it for later cleanup
     *
     * @param target Event target (window, document, element, etc.)
     * @param type Event type ('click', 'wheel', 'mousemove', etc.)
     * @param handler Event handler function
     * @param options Optional event listener options
     * @returns Registration object that can be used to unregister this specific listener
     */
    register(target: EventTarget, type: string, handler: EventListener, options?: AddEventListenerOptions): EventRegistration;
    /**
     * Unregister a specific event listener
     *
     * @param registration The registration object returned from register()
     */
    unregister(registration: EventRegistration): void;
    /**
     * Unregister all event listeners managed by this EventManager
     *
     * Should be called when the component/card is destroyed to prevent memory leaks
     */
    unregisterAll(): void;
    /**
     * Get the count of active registrations
     *
     * Useful for debugging and testing
     */
    getRegistrationCount(): number;
    /**
     * Check if a specific registration is currently active
     *
     * @param registration The registration to check
     * @returns True if the registration is active
     */
    hasRegistration(registration: EventRegistration): boolean;
}
