// @ts-ignore
import exampleProject01Example from '!raw-loader!./example-project-01';

export const project = {
  name: 'Example Project 01',
  description: 'This is an example project 01 for moxi-edit.',
  files: {
    'index.ts': {
      name: 'index.ts',
      language: 'typescript',
      value: exampleProject01Example,
    },
  },
  initfile: 'index.ts',
  activeFile: 'index.ts',
};
