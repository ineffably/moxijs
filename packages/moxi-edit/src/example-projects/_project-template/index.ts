// @ts-ignore
import templateProjectExample from '!raw-loader!./template-project';

export const project = {
  name: 'Template Project',
  description: 'This is a template project for creating new projects in moxi-edit.',
  files: {
    'index.ts': {
      name: 'index.ts',
      language: 'typescript',
      value: templateProjectExample,
    },
  },
  initfile: 'index.ts',
  activeFile: 'index.ts',
};
