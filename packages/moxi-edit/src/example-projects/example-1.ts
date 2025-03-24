import type { MoxiProjectSchema } from '../types/editor-types';

export const project = {
  name: 'Test Project',
  description: 'This is a test project',
  files: {
    'index.ts': {
      name: 'index.ts',
      language: 'typescript',
      value: `
import * as PIXI from 'pixi.js';
console.log('PIXI: ', PIXI.VERSION);
  `
  }},
  initfile: 'index.ts',
  activeFile: 'index.ts'
} as MoxiProjectSchema;
