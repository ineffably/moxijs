import { StateMachine } from '../src/library/state-machine';
import { StateLogic } from '../src/library/state-logic';

describe('StateMachine', () => {
  class IdleState extends StateLogic {
    updateCalled = false;
    enterCalled = false;
    exitCalled = false;

    constructor() {
      super('idle');
    }

    update(entity: any, deltaTime: number) {
      this.updateCalled = true;
    }

    onEnter(prevState: string | null) {
      this.enterCalled = true;
    }

    onExit(nextState: string) {
      this.exitCalled = true;
    }
  }

  class WalkState extends StateLogic {
    updateCalled = false;
    enterCalled = false;
    exitCalled = false;

    constructor() {
      super('walk');
    }

    update(entity: any, deltaTime: number) {
      this.updateCalled = true;
    }

    onEnter(prevState: string | null) {
      this.enterCalled = true;
    }

    onExit(nextState: string) {
      this.exitCalled = true;
    }
  }

  describe('constructor', () => {
    it('should create a state machine with initial states', () => {
      const idleState = new IdleState();
      const walkState = new WalkState();
      
      const machine = new StateMachine({
        'idle': idleState,
        'walk': walkState
      });
      
      expect(machine.currentState).toBeNull();
    });

    it('should create an empty state machine', () => {
      const machine = new StateMachine();
      expect(machine.currentState).toBeNull();
    });
  });

  describe('addState', () => {
    it('should add a state to the machine', () => {
      const machine = new StateMachine();
      const idleState = new IdleState();
      
      machine.addState(idleState);
      machine.setState('idle');
      
      expect(machine.currentState).toBe('idle');
    });
  });

  describe('setState', () => {
    it('should transition to a new state', () => {
      const idleState = new IdleState();
      const walkState = new WalkState();
      
      const machine = new StateMachine({
        'idle': idleState,
        'walk': walkState
      });
      
      machine.setState('idle');
      expect(machine.currentState).toBe('idle');
      expect(idleState.enterCalled).toBe(true);
      
      machine.setState('walk');
      expect(machine.currentState).toBe('walk');
      expect(idleState.exitCalled).toBe(true);
      expect(walkState.enterCalled).toBe(true);
    });

    it('should call onExit on previous state', () => {
      const idleState = new IdleState();
      const walkState = new WalkState();
      
      const machine = new StateMachine({
        'idle': idleState,
        'walk': walkState
      });
      
      machine.setState('idle');
      machine.setState('walk');
      
      expect(idleState.exitCalled).toBe(true);
    });

    it('should call onEnter on new state', () => {
      const idleState = new IdleState();
      const walkState = new WalkState();
      
      const machine = new StateMachine({
        'idle': idleState,
        'walk': walkState
      });
      
      machine.setState('walk');
      
      expect(walkState.enterCalled).toBe(true);
    });

    it('should dispatch stateChange event', (done) => {
      const idleState = new IdleState();
      const walkState = new WalkState();
      
      const machine = new StateMachine({
        'idle': idleState,
        'walk': walkState
      });
      
      machine.addEventListener('stateChange', (event: any) => {
        expect(event.detail.prevState).toBeNull();
        expect(event.detail.newState).toBe('idle');
        done();
      });
      
      machine.setState('idle');
    });

    it('should include previous state in event', (done) => {
      const idleState = new IdleState();
      const walkState = new WalkState();
      
      const machine = new StateMachine({
        'idle': idleState,
        'walk': walkState
      });
      
      machine.setState('idle');
      
      machine.addEventListener('stateChange', (event: any) => {
        expect(event.detail.prevState).toBe('idle');
        expect(event.detail.newState).toBe('walk');
        done();
      });
      
      machine.setState('walk');
    });

    it('should not transition to non-existent state', () => {
      const idleState = new IdleState();
      const machine = new StateMachine({
        'idle': idleState
      });
      
      machine.setState('idle');
      expect(machine.currentState).toBe('idle');
      
      machine.setState('nonExistent');
      expect(machine.currentState).toBe('idle'); // Should remain unchanged
    });
  });

  describe('update', () => {
    it('should update current state', () => {
      const idleState = new IdleState();
      const machine = new StateMachine({
        'idle': idleState
      });
      
      machine.setState('idle');
      machine.update(0.1);
      
      expect(idleState.updateCalled).toBe(true);
    });

    it('should not update if no current state', () => {
      const machine = new StateMachine();
      
      // Should not throw
      expect(() => machine.update(0.1)).not.toThrow();
    });
  });

  describe('currentState', () => {
    it('should return current state name', () => {
      const idleState = new IdleState();
      const machine = new StateMachine({
        'idle': idleState
      });
      
      expect(machine.currentState).toBeNull();
      
      machine.setState('idle');
      expect(machine.currentState).toBe('idle');
    });
  });
});

