// index.d.ts with moxi imports don't resolve

// dts-bundle-generator was throwing errors
// brute forcing this for now, tedious, there's got to be a more elegant solution
// ...or I'll make one? 
// and if that's the best way it's future chads problem. 

// @ts-ignore
import assetLoader from '!raw-loader!../../../moxi/lib/types/core/asset-loader.d.ts';
// @ts-ignore
import behavior from '!raw-loader!../../../moxi/lib/types/core/bahavior.d.ts';
// @ts-ignore
import clientEvents from '!raw-loader!../../../moxi/lib/types/library/client-events.d.ts';
// @ts-ignore
import engine from '!raw-loader!../../../moxi/lib/types/core/engine.d.ts';
// @ts-ignore
import entity from '!raw-loader!../../../moxi/lib/types/core/moxi-entity.d.ts';
// @ts-ignore
import index from '!raw-loader!../../../moxi/lib/types/index.d.ts';
// @ts-ignore
import prepare from '!raw-loader!../../../moxi/lib/types/library/prepare.d.ts';
// @ts-ignore
import renderManager from '!raw-loader!../../../moxi/lib/types/core/render-manager.d.ts';
// @ts-ignore
import scene from '!raw-loader!../../../moxi/lib/types/core/scene.d.ts';
// @ts-ignore
import utils from '!raw-loader!../../../moxi/lib/types/library/utils.d.ts';

// @ts-ignore
import pixidef from '!raw-loader!../../../../node_modules/pixi.js/dist/pixi.js.d.ts';

export function extraLibLoader(defaults) {
  // the loader doesn't follow the imports
  // so I have to combine them together individually and makes it fragile,
  // so, would be nice to have a dts generator
  const moxiDef = `declare module 'moxi' { 
${assetLoader}
${clientEvents}
${index}
${scene}
${entity}
${engine}
${renderManager}
${utils}
${behavior}
${prepare}
}`;

  const pixiDef = `declare module 'pixi.js' { ${pixidef} }`;
  defaults.addExtraLib(moxiDef, 'file:///node_modules/moxi/lib/index.d.ts');
  defaults.addExtraLib(pixiDef, 'file:///node_modules/pixi.js/dist/pixi.js.d.ts');
}