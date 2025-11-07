import { utils, setupMoxi, Logic, asEntity } from 'moxi';
const { rad2deg } = utils;

import PIXI from 'pixi.js';

class RotationLabel extends Logic<PIXI.BitmapText> {
  targetEntity: PIXI.Sprite = null;

  constructor(targetEntity: PIXI.Sprite) {
    super();
    this.targetEntity = targetEntity;
  }

  update(entity: PIXI.BitmapText) {
    entity.text = `${(Math.round(rad2deg(this.targetEntity.rotation)) + 90) % 360}`;
  }
}

class CharacterLogic extends Logic<PIXI.Sprite> {
  update(entity: PIXI.Sprite, deltaTime: number) {
    entity.rotation += deltaTime * 0.1;
  }

  init(entity: PIXI.Sprite, renderer: PIXI.Renderer<HTMLCanvasElement>) {
    entity.label = 'roboto';
    const { width, height } = renderer.view.canvas;
    entity.anchor.set(0.5);
    entity.x = width / 2;
    entity.y = height / 2;
  }
} 

export const init = (async () => {
  const root = document.getElementById('app');
  const { scene, engine, PIXIAssets, loadAssets } = await setupMoxi({ hostElement: root });
  const { renderer } = scene;
  renderer.background.color = 'green';

  const assetList = [
    { src: './assets/character_robot_idle.png', alias: 'character' }
  ];
  
  await loadAssets(assetList);
  
  const labelText = new PIXI.BitmapText({
    text: `${0}`,
    style: {
      fontFamily: 'kenfuture-thin', 
      fontSize: 32, 
      fontStyle: 'normal', 
      fill: 'white',
    }
  });

  const texture = PIXIAssets.get('character');
  const characterSprite = new PIXI.Sprite({ texture });
  characterSprite.eventMode = 'none';

  const label = asEntity(labelText);
  label.position.set( renderer.view.canvas.width / 2, 50);
  label.moxiEntity.addLogic(new RotationLabel(characterSprite));

  const character = asEntity<PIXI.Sprite>(characterSprite);
  character.moxiEntity.addLogic(new CharacterLogic());
  
  scene.addChild(character);
  scene.addChild(label);
  scene.init();
  engine.start();
});

// if we are loading this in moxi-edit, we can call the init function directly.
// this is because the file is also pretranspiled for direct use in the browser.
if((window as any).moxiedit) {
  init();
}

