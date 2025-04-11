
import { prepMoxi, asEntity } from 'moxi';
import PIXI from 'pixi.js';


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
  
  scene.addChild(character);
  scene.init();
  engine.start();
});

// if we are loading this in moxi-edit, we can call the init function directly.
// this is because the file is also pretranspiled for direct use in the browser.
if((window as any).moxiedit) {
  init();
}

