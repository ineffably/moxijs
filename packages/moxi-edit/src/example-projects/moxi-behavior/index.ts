import { MoxiProjectSchema } from '../../types/editor-types';
// @ts-ignore
import moxiBehavior from '!raw-loader!./moxi-behavior'; // This will load the raw content of the file for the example project. Make sure to have raw-loader installed in your build setup.

export const project = {
  name: 'moxi behavior',
  description: 'Behaviors were just introduced after the decent refactor in object model',
  files: {
    'index.ts': {
      name: 'index.ts',
      language: 'typescript',
      value: moxiBehavior,
      path: '/'
    }
  },
  initfile: 'index.ts',
  activeFile: 'index.ts'
} as MoxiProjectSchema;

