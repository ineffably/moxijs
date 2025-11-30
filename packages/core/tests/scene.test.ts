import { Scene } from '../src/main/scene';
import { asEntity } from '../src/main/moxi-entity';
import { Logic } from '../src/main/logic';
import PIXI from 'pixi.js';

describe('Scene', () => {
  const createMockRenderer = (): PIXI.Renderer<HTMLCanvasElement> => {
    return {
      render: jest.fn(),
      canvas: {
        width: 1280,
        height: 720
      } as HTMLCanvasElement
    } as any;
  };

  describe('constructor', () => {
    it('should create a Scene with renderer', () => {
      const renderer = createMockRenderer();
      const scene = new Scene(renderer);
      
      expect(scene).toBeInstanceOf(PIXI.Container);
      expect(scene.renderer).toBe(renderer);
    });
  });

  describe('init', () => {
    it('should initialize all moxijs entities', () => {
      const renderer = createMockRenderer();
      const scene = new Scene(renderer);
      
      let initCallCount = 0;
      class TestLogic extends Logic<PIXI.Container> {
        name = 'TestLogic';
        init(entity: PIXI.Container, renderer: PIXI.Renderer<HTMLCanvasElement>) {
          initCallCount++;
        }
      }
      
      const container1 = asEntity(new PIXI.Container());
      const container2 = asEntity(new PIXI.Container());
      container1.moxiEntity.addLogic(new TestLogic());
      container2.moxiEntity.addLogic(new TestLogic());
      
      scene.addChild(container1);
      scene.addChild(container2);
      
      scene.init();
      
      expect(initCallCount).toBe(2);
    });

    it('should not initialize non-moxi entities', () => {
      const renderer = createMockRenderer();
      const scene = new Scene(renderer);
      
      const regularContainer = new PIXI.Container();
      const moxiEntity = asEntity(new PIXI.Container());
      
      scene.addChild(regularContainer);
      scene.addChild(moxiEntity);
      
      // Should not throw
      expect(() => scene.init()).not.toThrow();
    });
  });

  describe('update', () => {
    it('should update all moxijs entities', () => {
      const renderer = createMockRenderer();
      const scene = new Scene(renderer);
      
      let updateCount = 0;
      class TestLogic extends Logic<PIXI.Container> {
        name = 'TestLogic';
        update(entity: PIXI.Container, deltaTime: number) {
          updateCount++;
        }
      }
      
      const entity1 = asEntity(new PIXI.Container());
      const entity2 = asEntity(new PIXI.Container());
      entity1.moxiEntity.addLogic(new TestLogic());
      entity2.moxiEntity.addLogic(new TestLogic());
      
      scene.addChild(entity1);
      scene.addChild(entity2);
      
      scene.update(0.1);
      
      expect(updateCount).toBe(2);
    });

    it('should pass deltaTime to entities', () => {
      const renderer = createMockRenderer();
      const scene = new Scene(renderer);
      
      let receivedDeltaTime = 0;
      const entity = asEntity(new PIXI.Container());
      
      // Add a logic that tracks deltaTime
      class DeltaTrackerLogic extends Logic<PIXI.Container> {
        name = 'DeltaTrackerLogic';
        update(entity: PIXI.Container, deltaTime: number) {
          receivedDeltaTime = deltaTime;
        }
      }
      
      entity.moxiEntity.addLogic(new DeltaTrackerLogic());
      scene.addChild(entity);
      
      scene.update(0.5);
      
      expect(receivedDeltaTime).toBe(0.5);
    });
  });

  describe('draw', () => {
    it('should render the scene', () => {
      const renderer = createMockRenderer();
      const scene = new Scene(renderer);
      
      scene.draw(0.1);
      
      expect(renderer.render).toHaveBeenCalledWith(scene);
    });
  });
});

