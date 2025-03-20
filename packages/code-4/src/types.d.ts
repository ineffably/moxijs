export type IntrinsicLanguages = 'typescript' | 'javascript' | 'json';

export interface FileSpec { 
  name: string;
  language: 'typescript',
  value: string;
}

export interface ProjectSpec {
  name: string;
  files: Record<string, FileSpec>;
}