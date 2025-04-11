import { prepMoxi, asEntity } from 'moxi';
import PIXI, { TextureSource } from 'pixi.js';
import { asTextureFrames } from './texture-frames';

export const init = (async () => {
  const root = document.getElementById('app');
  const { scene, engine, PIXIAssets, loadAssets, camera } = await prepMoxi({ hostElement: root });
  scene.renderer.background.color = 'green';
  scene.renderer.view.antialias = true;

  const assetList = [
    { src: './assets/sproutlands/tiles/Grass_tiles_v2_simple.png', alias: 'simple_grass_sheet' },
    { src: './assets/sproutlands/characters/basic-spritesheet.png', alias: 'character_sheet' },
  ];
  
  await loadAssets(assetList);

  camera.desiredScale.set(8, 8);
  
  // Get the character sheet texture
  const baseTexture = PIXIAssets.get<TextureSource>('character_sheet');
  const grassSheet = PIXIAssets.get<TextureSource>('simple_grass_sheet');
  baseTexture.source.style.scaleMode = 'nearest';
  grassSheet.source.style.scaleMode = 'nearest';
  
  const characterFrames = asTextureFrames(baseTexture, { 
    frameWidth: 48, 
    frameHeight: 48, 
    columns: 4, 
      rows: 4 
  });

  const grassFrames = asTextureFrames(grassSheet, {
    frameWidth: 16, 
    frameHeight: 16, 
    columns: 6, 
    rows: 5 
  });

  
  const grassCorner = PIXI.Sprite.from(grassFrames[29]);
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

