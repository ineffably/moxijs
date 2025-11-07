// @ts-ignore
import basicMoxiExample from '!raw-loader!./basic-moxi';

export const project = {
  name: 'Basic Moxi',
  description: 'This is the same as the basic pixi example, but, using moxi.',
  files: {
    'index.ts': {
      name: 'index.ts',
      language: 'typescript',
      value: basicMoxiExample,
    },
  },
  initfile: 'index.ts',
  activeFile: 'index.ts',
};
