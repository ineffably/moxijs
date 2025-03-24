// index.d.ts with moxi imports don't resolve

// brut forcing this for now, there's got to be a more elegant solution
// ...or I'll make one? dts-bundle-generator was throwing errors 
// and if that's the best way it's future chads problem. 
// @ts-ignore
import moxiIndex from '!raw-loader!../../../moxi/lib/types/index.d.ts';
// @ts-ignore
import moxiEntities from '!raw-loader!../../../moxi/lib/types/entities.d.ts';
// @ts-ignore
import moxiEngine from '!raw-loader!../../../moxi/lib/types/engine.d.ts';
// @ts-ignore
import clientEvents from '!raw-loader!../../../moxi/lib/types/client-events.d.ts';
// @ts-ignore
import moxiScene from '!raw-loader!../../../moxi/lib/types/scene.d.ts';
// @ts-ignore
import renderManager from '!raw-loader!../../../moxi/lib/types/render-manager.d';
// @ts-ignore
import assetLoader from '!raw-loader!../../../moxi/lib/types/asset-loader.d';
// @ts-ignore
import utils from '!raw-loader!../../../moxi/lib/types/utils.d';

// @ts-ignore
import pixidef from '!raw-loader!../../../../node_modules/pixi.js/dist/pixi.js.d.ts';

export function extraLibLoader(defaults) {
  // the loader doesn't follow the imports
  // so I have to combine them together individually and makes it fragile,
  // so, would be nice to have at dts generator
  const moxiDef = `declare module 'moxi' { 
${assetLoader}
${clientEvents}
${moxiScene}
${moxiEntities}
${moxiEngine}
${renderManager}
${utils}
${moxiIndex}
}`;

  const pixiDef = `declare module 'pixi.js' { ${pixidef} }`;
  defaults.addExtraLib(moxiDef, 'file:///node_modules/moxi/lib/index.d.ts');
  defaults.addExtraLib(pixiDef, 'file:///node_modules/pixi.js/dist/pixi.js.d.ts');
}