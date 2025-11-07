import { Logic } from '../core/logic';
import { Container, Renderer } from 'pixi.js';

export class StateLogic extends Logic<Container> {
  private _entity: Container;
  private _name: string;

  constructor(name: string) {
    super();
    this._name = name;
  }

  get name() {
    return this._name;
  }

  get entity() {
    return this._entity;
  }

  init(entity: Container, renderer: Renderer) {
    this._entity = entity;
    super.init(entity, renderer);
  }

  onEnter(state: string) {
  }

  onExit(state: string) {
  }

  update(entity: Container, deltaTime: number) {
  }
  
}

