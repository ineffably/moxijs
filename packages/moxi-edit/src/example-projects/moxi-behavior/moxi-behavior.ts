
import { Behavior, Entity, loadFonts, prepMoxi } from 'moxi';
import PIXI, { BitmapText } from 'pixi.js';

class CenterEntity extends Behavior {
  init(renderer: PIXI.Renderer<HTMLCanvasElement>) {
    const { entity } = this;
    const { width, height } = renderer.view.canvas;
    entity.anchor.set(0.5);
    entity.x = width / 2;
    entity.y = height / 2;
  }
}

class SpinAroundEntity extends Behavior {
  update(deltaTime: number, entity: Entity) {
    entity.rotation += deltaTime * 0.1;
  }
}

export const init = (async () => {
  const hostElement = document.getElementById('app') as HTMLElement;
  const { scene, engine, PIXIAssets, loadAssets } = await prepMoxi({ hostElement });
  await loadFonts();
  const title = new BitmapText({
    text: 'Welcome to Moxi Behavior and Bitmap Font Example', style: {
      fontFamily: 'kenfuture-thin',
      fontSize: 32,
      fontStyle: 'normal',
      fill: 0xffffff,
    }
  });
  title.eventMode = 'none'; // Bitmap text defaults evenmode, let's turn it off

  const assetList = [
    { src: './assets/character_robot_idle.png', alias: 'character' }
  ];

  await loadAssets(assetList);

  const spinAround = new SpinAroundEntity();
  const character = new Entity(PIXIAssets.get('character'));
  // TODO: do a mild refactor here.., 
  // would be nice to syntactically have character.addBehavior<CenterEntity>()
  // this is not C# though, using a direct approach for now
  character.addBehavior(new CenterEntity());
  character.addBehavior(spinAround);

  scene.addChild(character);
  scene.addChild(title);

  // scene.eventMode = 'none'; // 
  scene.init();
  engine.start();

  // demonstrates you can disable behaviors at runtime
  // window.setTimeout(() => {
  //   spinAround.active = false;
  // }, 2000);
});

// These files are also pretranspiled for direct use in the browser.
if ((window as any).moxiedit) {
  init();
}

