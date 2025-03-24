
import { Entity, Engine, RenderManager, Scene, AssetLoader } from 'moxi';
import { Sprite } from 'pixi.js';

// This example is a copy of a basic PIXI.JS example as a baseline without using moxi.

class BunnyMatrix extends Entity {
  texture: any;
  constructor(texture) {
    super();
    this.texture = texture;
  }

  update = (deltaTime: number) => {
    this.rotation += deltaTime * 0.1;
  }

  init(renderer) {
    for (let i = 0; i < 25; i++) {
      const bunny = new Sprite(this.texture);

      bunny.x = (i % 5) * 40;
      bunny.y = Math.floor(i / 5) * 40;
      this.addChild(bunny);
    }
  }
}

(async () => {

  const root = document.getElementById('app');
  const renderMan = await RenderManager.create(root, { width: 1280, height: 720 });
  const { renderer } = renderMan;
  renderer.background.color = 'cornflowerblue';
  const world = new Scene(renderer);
  const engine = new Engine(world);

  const assets = [
    { src: 'https://pixijs.com/assets/bunny.png', alias: 'bunny' }
  ];
  const { PIXIAssets, loadAssets } = new AssetLoader();
  await loadAssets(assets);
  
  const bunnyTexture = PIXIAssets.get('bunny');
  const bunnyMatrix = new BunnyMatrix(bunnyTexture);
  // bunnyMatrix.init(bunnyTexture);
  world.addChild(bunnyMatrix)
  world.init();
  engine.start();


})();
