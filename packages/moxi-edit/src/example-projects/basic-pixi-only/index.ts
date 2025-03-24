import { MoxiProjectSchema } from '../../types/editor-types';
// @ts-ignore
import basicPixiOnly from '!raw-loader!./basic-pixi-only';

export const project = {
  name: 'Basic Pixi Only',
  description: 'This project is only using PIXI.JS as a baseline and is a copy of simple example.',
  files: {
    'index.ts': {
      name: 'index.ts',
      language: 'typescript',
      value: basicPixiOnly
    }
  },
  initfile: 'index.ts',
  activeFile: 'index.ts'
} as MoxiProjectSchema;

