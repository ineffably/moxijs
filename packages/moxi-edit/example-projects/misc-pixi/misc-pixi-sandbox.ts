
import { loadFonts, prepMoxi } from 'moxi';
import PIXI, { BitmapText, Graphics } from 'pixi.js';


export const init = (async () => {
  const hostElement = document.getElementById('app') as HTMLElement;
  const { scene, engine, PIXIAssets, loadAssets } = await prepMoxi({ hostElement });

  await loadFonts();
  
  const assetList = [
    { src: './assets/character_robot_idle.png', alias: 'character' }
  ];

  await loadAssets(assetList);

  const sprite = new PIXI.Sprite(PIXIAssets.get('character').texture);

  // scene.eventMode = 'none'; // 
  scene.init();
  engine.start();
});

// if we are loading this in moxi-edit, we can call the init function directly.
// this is because the file is also pretranspiled for direct use in the browser.
if ((window as any).moxiedit) {
  init();
}

