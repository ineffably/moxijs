import { StateBehavior } from './state-behavior';
export type StateChangeEvent = {
    prevState: string | null;
    newState: string;
};
type StateBehaviorRecords = Record<string, StateBehavior>;
export declare class StateMachine extends EventTarget {
    private _states;
    private _currentState;
    private _currentStateName;
    constructor(states?: StateBehaviorRecords);
    update(deltaTime: number): void;
    setState(stateName: string): void;
    addState(state: StateBehavior): void;
    get currentState(): string | null;
}
export {};
