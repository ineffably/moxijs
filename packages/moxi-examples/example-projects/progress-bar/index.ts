import { MoxiProjectSchema } from '../../src/types/editor-types';

// @ts-expect-error raw-loader 
import progressBarExample from '!raw-loader!./progress-bar-example';
// @ts-expect-error raw-loader 
import progressBarLogic from '!raw-loader!./progress-bar-logic';

// TODO: code4 needs multi-file support for projects tp have access to virtual file imports
export const project = {
  name: 'Progress Bar Example',
  description: 'This shows a bit more complex logic with moxi and PIXI.JS.',
  files: {
    'index.ts': {
      name: 'index.ts',
      language: 'typescript',
      value: progressBarExample,
      path: '/'
    },
    'progress-bar-logic.ts': {
      name: 'progress-bar-logic.tsx', 
      module: './progress-bar-logic',
      language: 'typescript',
      value: progressBarLogic, 
      path: '/'
    }
  },
  initfile: 'index.ts',
  activeFile: 'index.ts'
} as MoxiProjectSchema;

