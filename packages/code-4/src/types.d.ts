export type IntrinsicLanguages = 'typescript' | 'javascript' | 'json';

export interface FileSpec { 
  name: string;
  language: 'typescript',
  value: string;
  path?: string;
}
