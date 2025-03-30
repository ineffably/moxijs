import { MoxiProjectSchema } from '../../types/editor-types';
// @ts-ignore
import progressBarExample from '!raw-loader!./progress-bar-example';
// @ts-ignore
import progressBarBehavior from '!raw-loader!./progress-bar-bahavior';

// TODO: code4 needs multi-file support for projects tp have access to virtual file imports
export const project = {
  name: 'Progress Bar Example',
  description: 'This shows a bit more complex behaviors with moxi and PIXI.JS.',
  files: {
    'index.ts': {
      name: 'index.ts',
      language: 'typescript',
      value: progressBarExample,
      path: '/'
    },
    'progress-bar-behavior.ts': {
      name: 'progress-bar-behavior.tsx', 
      module: './progress-bar-behavior',
      language: 'typescript',
      value: progressBarBehavior, 
      path: '/'
    }
  },
  initfile: 'index.ts',
  activeFile: 'index.ts'
} as MoxiProjectSchema;

