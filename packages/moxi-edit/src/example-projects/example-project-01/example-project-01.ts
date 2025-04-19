import { prepMoxi, asEntity, asTextureFrames } from 'moxi';
import PIXI from 'pixi.js';  

export const init = (async () => {
  const root = document.getElementById('app');
  const { scene, engine, loadAssets, camera, PIXIAssets } = await prepMoxi({ hostElement: root });
  scene.renderer.background.color = 'green';
  scene.renderer.view.antialias = true;

  const assetList = [
    { src: './assets/sproutlands/tiles/Grass_tiles_v2_simple.png', alias: 'simple_grass_sheet' },
    { src: './assets/sproutlands/characters/basic-spritesheet.png', alias: 'character_sheet' },
  ];
  
  await loadAssets(assetList);

  camera.desiredScale.set(4);
  
  // Get the character sheet texture using the getAsset utility
  const baseTexture = PIXIAssets.get<PIXI.TextureSource>('character_sheet');
  const grassSheet = PIXIAssets.get<PIXI.TextureSource>('simple_grass_sheet');
  baseTexture.source.style.scaleMode = 'nearest';
  grassSheet.source.style.scaleMode = 'nearest';
  
  const characterFrames = asTextureFrames(PIXI, baseTexture, { 
    frameWidth: 48,   
    frameHeight: 48, 
    columns: 4, 
      rows: 4 
  });

  const grassFrames = asTextureFrames(PIXI, grassSheet, {
    frameWidth: 16, 
    frameHeight: 16, 
    columns: 6, 
    rows: 5 
  });
  
  // Create sprite directly with the texture instead of using Sprite.from()
  const grassCorner = new PIXI.Sprite(grassFrames[29]);
  grassCorner.scale.set(1);
  scene.addChild(asEntity(grassCorner));
  
  scene.init();
  engine.start();
});

// if we are loading this in moxi-edit, we can call the init function directly.
// this is because the file is also pretranspiled for direct use in the browser.
if((window as any).moxiedit) {
  init();
}
