import { StateLogic } from './state-logic';
export type StateChangeEvent = {
    prevState: string | null;
    newState: string;
};
type StateLogicRecords = Record<string, StateLogic>;
export declare class StateMachine extends EventTarget {
    private _states;
    private _currentState;
    private _currentStateName;
    constructor(states?: StateLogicRecords);
    update(deltaTime: number): void;
    setState(stateName: string): void;
    addState(state: StateLogic): void;
    get currentState(): string | null;
}
export {};
