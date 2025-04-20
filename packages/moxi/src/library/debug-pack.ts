import PIXI from 'pixi.js';
import { Scene } from '../core/scene';

export const console = () => {
  
};


export class SceneGraph extends PIXI.Container {
  scene: Scene;
  
  constructor(scene: Scene) {
    super();
    this.scene = scene;
  }

  update(deltaTime: number) {
    
  }
}