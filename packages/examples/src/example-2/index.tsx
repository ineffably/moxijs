import { Code4Editor } from 'code-4';
import { useEffect } from 'react';

// @ts-ignore
import sdkTypeDef from '!raw-loader!../../../moxi/lib/index.d.ts';
// @ts-ignore
import pixidef from '!raw-loader!../../../../node_modules/pixi.js/dist/pixi.js.d.ts';

export const Example02 = () => {
  useEffect(() => {
    console.log('Example02');
  }, []);

  return (
    <Code4Editor tsDefaultsPlugin={(defaults) => {
      defaults.addExtraLib(`declare module 'moxi' { ${sdkTypeDef} }`, 'file:///node_modules/moxi/lib/index.d.ts');
      defaults.addExtraLib(`declare module 'pixi.js' { ${pixidef} }`, 'file:///node_modules/pixi.js/dist/pixi.js.d.ts');
    }}
    />
  );
};
