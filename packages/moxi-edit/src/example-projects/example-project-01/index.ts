// @ts-ignore
import exampleProject01Example from '!raw-loader!./example-project-01';

export const project = {
  name: 'Template Project',
  description: 'This is a template project for creating new projects in moxi-edit.',
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
