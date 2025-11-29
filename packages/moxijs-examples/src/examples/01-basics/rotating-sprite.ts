import { utils, setupMoxi, Logic, asEntity, asBitmapText, asSprite } from '@moxijs/core';
import { Sprite, BitmapText, Renderer } from 'pixi.js';
import { ASSETS } from '../../assets-config';

const { rad2deg } = utils;

class RotationLabel extends Logic<BitmapText> {
  targetEntity: Sprite = null;

  constructor(targetEntity: Sprite) {
    super();
    this.targetEntity = targetEntity;
  }

  update(entity: BitmapText) {
    entity.text = `${(Math.round(rad2deg(this.targetEntity.rotation)) + 90) % 360}°`;
  }
}

class CharacterLogic extends Logic<Sprite> {
  update(entity: Sprite, deltaTime: number) {
    entity.rotation += deltaTime * 0.1;
  }

  init(entity: Sprite, renderer: Renderer<HTMLCanvasElement>) {
    const { width, height } = renderer.canvas;
    entity.anchor.set(0.5);
    entity.x = width / 2;
    entity.y = height / 2;
  }
} 

export async function initRotatingSprite() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  const { scene, engine, PIXIAssets, loadAssets } = await setupMoxi({ 
    hostElement: root,
    showLoadingScene: true,
    renderOptions: {
      width: 1280,
      height: 720,
      backgroundColor: 0x00ffff // cyan
    }
  });
  const { renderer } = scene;

  await loadAssets([
    { src: ASSETS.ROBOT_IDLE, alias: 'character' },
    { src: ASSETS.KENNEY_FUTURE_THIN_FONT, alias: 'kenney-future-thin' }
  ]);
  
  const texture = PIXIAssets.get('character');
  
  const characterSprite = asSprite(
    { texture },
    { eventMode: 'none' }
  );
  
  const label = asEntity(asBitmapText(
    {
      text: '0°',
      style: {
        fontFamily: 'kenney-future-thin',
        fontSize: 32,
        fontStyle: 'normal',
        fill: 0x000000, // black
      },
      pixelPerfect: true
    },
    {
      x: renderer.canvas.width / 2,
      y: 50
    }
  ));
  label.moxiEntity.addLogic(new RotationLabel(characterSprite));

  const character = asEntity<Sprite>(characterSprite);
  character.moxiEntity.addLogic(new CharacterLogic());
  
  scene.addChild(character);
  scene.addChild(label);
  scene.init();
  engine.start();

  console.log('✅ Rotating Sprite example loaded');
}

