
import { Engine, RenderManager, Scene, AssetLoader, Entity } from 'moxi';
import PIXI from 'pixi.js';

class Character extends Entity {
  update(deltaTime: number) {
    super.update(deltaTime);
    this.rotation += deltaTime * 0.1;
  }

  init(renderer: PIXI.Renderer<HTMLCanvasElement>) {
    this.label = 'roboto';
    const { width, height } = renderer.view.canvas;
    this.anchor.set(0.5);
    this.x = width / 2;
    this.y = height / 2;
  }
}

export const init = (async () => {
  const root = document.getElementById('app');
  const { renderer } = await RenderManager.create(root, { width: 1280, height: 720, backgroundColor: 0x1099bb });
  // renderer.background.color = 'green';

  const scene = new Scene(renderer);

  // // we can either call loadWorld or we can pass the world into the engine constructor.
  const engine = new Engine(scene);
  const assetList = [
    { src: './assets/character_robot_idle.png', alias: 'character' }
  ];

  const { PIXIAssets, loadAssets } = new AssetLoader();
  await loadAssets(assetList);

  const characterTexture = PIXIAssets.get('character');
  const character = new Character(characterTexture);
  scene.addChild(character);
  scene.init();
  engine.start();
});

// if we are loading this in moxi-edit, we can call the init function directly.
// this is because the file is also pretranspiled for direct use in the browser.
if((window as any).moxiedit) {
  init();
}

