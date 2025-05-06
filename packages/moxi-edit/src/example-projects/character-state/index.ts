import { MoxiProjectSchema } from '../../types/editor-types';
// @ts-ignore
import characterState from '!raw-loader!./character-state-example'; 

export const project = {
  name: 'Character States',
  description: 'Simple character animation example',
  files: {
    'index.ts': {
      name: 'index.ts',
      language: 'typescript',
      value: characterState,
      path: '/'
    }
  },
  initfile: 'index.ts',
  activeFile: 'index.ts'
} as MoxiProjectSchema;

