import { MoxiProjectSchema } from '../../src/types/editor-types';
// @ts-ignore
import pixiSandbox from '!raw-loader!./misc-pixi-sandbox';

export const project = {
  name: 'misc pixi elements',
  description: 'A playground of elements as concepts with pixi',
  files: {
    'index.ts': {
      name: 'index.ts',
      language: 'typescript',
      value: pixiSandbox,
      path: '/'
    }
  },
  initfile: 'index.ts',
  activeFile: 'index.ts'
} as MoxiProjectSchema;

