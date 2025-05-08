import { StateBehavior } from './state-behavior';

// Define the custom event type for state changes
export type StateChangeEvent = {
  prevState: string | null;
  newState: string;
};

type StateChangeEventListener = (event: StateChangeEvent) => void;
type StateBehaviorRecords = Record<string, StateBehavior>;

export class StateMachine extends EventTarget {
  private _states: StateBehaviorRecords = {};
  private _currentState: StateBehavior | null = null;
  private _currentStateName: string | null = null;

  constructor(states: StateBehaviorRecords = {}) {
    super();
    this._states = states;
  }

  update(deltaTime: number) {
    if (this._currentState) {
      this._currentState.update(this._currentState.entity, deltaTime);
    }
  }
  
  setState(stateName: string) {
    const nextState = this._states[stateName];
    if(!nextState) return;

    const prevStateName = this._currentStateName;
    
    if (this._currentState) {
      this._currentState.onExit(stateName);
    }

    this._currentState = this._states[stateName];
    this._currentStateName = stateName;
    this._currentState.onEnter(stateName);
    
    // Dispatch the state change event
    const event = new CustomEvent<StateChangeEvent>('stateChange', {
      detail: {
        prevState: prevStateName,
        newState: stateName
      }
    });
    
    this.dispatchEvent(event);
  }

  addState(state: StateBehavior) {
    this._states[state.name] = state;
  }
  
  get currentState(): string | null {
    return this._currentStateName;
  }
}