export interface OnAction {
    target: EventTarget;
    type: string;
    handler: EventListener;
    options?: AddEventListenerOptions;
}
export declare class ActionManager {
    private actions;
    add(target: EventTarget, type: string, handler: EventListener, options?: AddEventListenerOptions): OnAction;
    remove(action: OnAction): void;
    removeAll(): void;
    getCount(): number;
    hasAction(action: OnAction): boolean;
}
