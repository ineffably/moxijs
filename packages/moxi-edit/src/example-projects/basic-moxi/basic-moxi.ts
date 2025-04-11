
import { Engine, RenderManager, Scene, AssetLoader, prepMoxi, Behavior, asEntity } from 'moxi';
import PIXI from 'pixi.js';

class CharacterBehavior extends Behavior<PIXI.Sprite> {
  update(entity: PIXI.Sprite, deltaTime: number) {
    super.update(entity, deltaTime);
    entity.rotation += deltaTime * 0.1;
  }

  init(entity: PIXI.Sprite, renderer: PIXI.Renderer<HTMLCanvasElement>) {
    super.init(entity, renderer);
    entity.label = 'roboto';
    const { width, height } = renderer.view.canvas;
    entity.anchor.set(0.5);
    entity.x = width / 2;
    entity.y = height / 2;
  }
} 

export const init = (async () => {
  const root = document.getElementById('app');
  const { scene, engine, PIXIAssets, loadAssets } = await prepMoxi({ hostElement: root });
  scene.renderer.background.color = 'green';

  const assetList = [
    { src: './assets/character_robot_idle.png', alias: 'character' }
  ];
  
  await loadAssets(assetList);

  const texture = PIXIAssets.get('character');
  const characterSprite = new PIXI.Sprite({ texture });
  characterSprite.eventMode = 'none';
  
  const character = asEntity<PIXI.Sprite>(characterSprite);
  character.moxiEntity.addBehavior(new CharacterBehavior());
  
  scene.addChild(character);
  scene.init();
  engine.start();
});

// if we are loading this in moxi-edit, we can call the init function directly.
// this is because the file is also pretranspiled for direct use in the browser.
if((window as any).moxiedit) {
  init();
}

