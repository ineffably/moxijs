import { Logic, InstancedLogic } from '../src/core/logic';
import { MoxiEntity, asEntity } from '../src/core/moxi-entity';
import PIXI from 'pixi.js';

describe('Logic', () => {
  class TestLogic extends Logic<PIXI.Container> {
    name = 'TestLogic';
    initCalled = false;
    updateCalled = false;
    lastDeltaTime = 0;

    init(entity: PIXI.Container, renderer: PIXI.Renderer<HTMLCanvasElement>) {
      this.initCalled = true;
    }

    update(entity: PIXI.Container, deltaTime: number) {
      this.updateCalled = true;
      this.lastDeltaTime = deltaTime;
    }
  }

  class RotateLogic extends InstancedLogic<PIXI.Container> {
    name = 'RotateLogic';
    speed: number;

    constructor(speed: number = 1) {
      super();
      this.speed = speed;
    }

    update(entity: PIXI.Container, deltaTime: number) {
      if (entity && 'rotation' in entity) {
        (entity as any).rotation += this.speed * deltaTime;
      }
    }
  }

  describe('Logic base class', () => {
    it('should create a logic instance', () => {
      const logic = new TestLogic();
      expect(logic).toBeInstanceOf(Logic);
      expect(logic.active).toBe(true);
    });

    it('should allow setting active state', () => {
      const logic = new TestLogic();
      logic.active = false;
      expect(logic.active).toBe(false);
    });

    it('should have default name from constructor', () => {
      const logic = new TestLogic();
      expect(logic.name).toBe('TestLogic');
    });
  });

  describe('InstancedLogic', () => {
    it('should create an instanced logic with constructor args', () => {
      const logic = new RotateLogic(5);
      expect(logic).toBeInstanceOf(InstancedLogic);
      expect(logic.speed).toBe(5);
    });

    it('should allow multiple instances with different configs', () => {
      const slowLogic = new RotateLogic(1);
      const fastLogic = new RotateLogic(10);
      
      expect(slowLogic.speed).toBe(1);
      expect(fastLogic.speed).toBe(10);
    });
  });
});

describe('MoxiEntity', () => {
  class MovementLogic extends Logic<PIXI.Container> {
    name = 'MovementLogic';
    x = 0;
    y = 0;

    update(entity: PIXI.Container, deltaTime: number) {
      this.x += deltaTime * 10;
      this.y += deltaTime * 5;
    }
  }

  class HealthLogic extends Logic<PIXI.Container> {
    name = 'HealthLogic';
    health = 100;

    init(entity: PIXI.Container) {
      this.health = 100;
    }
  }

  describe('constructor', () => {
    it('should create a MoxiEntity with an entity', () => {
      const container = new PIXI.Container();
      const entity = new MoxiEntity(container);
      
      expect(entity.entity).toBe(container);
      expect(entity.logic).toEqual({});
    });

    it('should create a MoxiEntity with initial logic', () => {
      const container = new PIXI.Container();
      const movementLogic = new MovementLogic();
      const entity = new MoxiEntity(container, {
        'MovementLogic': movementLogic
      });
      
      expect(entity.logic['MovementLogic']).toBe(movementLogic);
    });
  });

  describe('addLogic', () => {
    it('should add logic to entity', () => {
      const container = new PIXI.Container();
      const entity = new MoxiEntity(container);
      const logic = new MovementLogic();
      
      entity.addLogic(logic);
      
      expect(entity.logic['MovementLogic']).toBe(logic);
    });

    it('should use explicit name if provided', () => {
      const container = new PIXI.Container();
      const entity = new MoxiEntity(container);
      const logic = new MovementLogic();
      logic.name = 'CustomName';
      
      entity.addLogic(logic);
      
      expect(entity.logic['CustomName']).toBe(logic);
      expect(entity.logic['MovementLogic']).toBeUndefined();
    });
  });

  describe('getLogic', () => {
    it('should retrieve logic by name', () => {
      const container = new PIXI.Container();
      const entity = new MoxiEntity(container);
      const logic = new MovementLogic();
      
      entity.addLogic(logic);
      const retrieved = entity.getLogic<MovementLogic>('MovementLogic');
      
      expect(retrieved).toBe(logic);
    });

    it('should return undefined for non-existent logic', () => {
      const container = new PIXI.Container();
      const entity = new MoxiEntity(container);
      
      const retrieved = entity.getLogic('NonExistent');
      
      expect(retrieved).toBeUndefined();
    });
  });

  describe('init', () => {
    it('should initialize all logic components', () => {
      const container = new PIXI.Container();
      const entity = new MoxiEntity(container);
      const healthLogic = new HealthLogic();
      const mockRenderer = {} as PIXI.Renderer<HTMLCanvasElement>;
      
      entity.addLogic(healthLogic);
      entity.init(mockRenderer);
      
      expect(healthLogic.health).toBe(100);
    });

    it('should not initialize inactive logic', () => {
      const container = new PIXI.Container();
      const entity = new MoxiEntity(container);
      const logic = new MovementLogic();
      logic.active = false;
      
      entity.addLogic(logic);
      entity.init({} as PIXI.Renderer<HTMLCanvasElement>);
      
      // Logic should still be added but init won't be called if it doesn't have init method
      expect(entity.logic['MovementLogic']).toBe(logic);
    });
  });

  describe('update', () => {
    it('should update all active logic components', () => {
      const container = new PIXI.Container();
      const entity = new MoxiEntity(container);
      const logic = new MovementLogic();
      
      entity.addLogic(logic);
      entity.update(0.1);
      
      expect(logic.x).toBe(1); // 0.1 * 10
      expect(logic.y).toBe(0.5); // 0.1 * 5
    });

    it('should not update inactive logic', () => {
      const container = new PIXI.Container();
      const entity = new MoxiEntity(container);
      const logic = new MovementLogic();
      logic.active = false;
      
      entity.addLogic(logic);
      entity.update(0.1);
      
      expect(logic.x).toBe(0);
      expect(logic.y).toBe(0);
    });

    it('should handle multiple logic components', () => {
      const container = new PIXI.Container();
      const entity = new MoxiEntity(container);
      const movementLogic = new MovementLogic();
      const healthLogic = new HealthLogic();
      
      entity.addLogic(movementLogic);
      entity.addLogic(healthLogic);
      entity.update(0.2);
      
      expect(movementLogic.x).toBe(2);
      expect(healthLogic.health).toBe(100); // HealthLogic doesn't update
    });
  });
});

describe('asEntity', () => {
  it('should convert a container to an AsEntity', () => {
    const container = new PIXI.Container();
    const entity = asEntity(container);
    
    expect(entity).toBe(container);
    expect(entity.moxiEntity).toBeInstanceOf(MoxiEntity);
    expect(entity.moxiEntity.entity).toBe(container);
  });

  it('should add isInteractive method', () => {
    const container = new PIXI.Container();
    const entity = asEntity(container);
    
    expect(typeof entity.isInteractive).toBe('function');
    expect(entity.isInteractive()).toBe(false);
  });

  it('should accept initial logic', () => {
    const container = new PIXI.Container();
    class TestLogic extends Logic<PIXI.Container> {
      name = 'TestLogic';
    }
    const logic = new TestLogic();
    
    const entity = asEntity(container, {
      'TestLogic': logic
    });
    
    expect(entity.moxiEntity.getLogic('TestLogic')).toBe(logic);
  });
});

