import PIXI, { Ticker } from 'pixi.js';
import { Scene } from './scene';

export class Engine {
  ticker: PIXI.Ticker;
  root: Scene;
  logger: (msg: string) => void;
  loggerFrequencyMs: number;
  nextLogTime: number;

  constructor(stage: Scene = null) {
    this.root = stage;

    const ticker = PIXI.Ticker.shared;
    ticker.autoStart = false;
    ticker.add(this.gameLoop);
    this.ticker = ticker;

    this.loggerFrequencyMs = 500;
    this.nextLogTime = 0;
    this.logger = (msg) => null;
  }

  start() {
    this.ticker.start();
    return this;
  }

  stop() {
    this.ticker.stop();
    return this;
  }

  gameLoop = (tikerTime: Ticker) => {
    if (this.root) {
      const { deltaTime } = tikerTime;
      this.root.update(deltaTime);
      this.root.draw(deltaTime);
    }
  };

  loadStage(stage: Scene) {
    this.root = stage;
    return this;
  }
}
