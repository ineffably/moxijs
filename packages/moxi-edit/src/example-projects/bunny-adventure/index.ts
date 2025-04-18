// @ts-ignore
import bunnyAdventureExample from '!raw-loader!./bunny-adventure';

export const project = {
  name: 'Bunny Adventure',
  description: 'A simple 2D game example with character movement and animations using Moxi and PixiJS.',
  files: {
    'index.ts': {
      name: 'index.ts',
      language: 'typescript',
      value: bunnyAdventureExample,
    },
  },
  initfile: 'index.ts',
  activeFile: 'index.ts',
}; 