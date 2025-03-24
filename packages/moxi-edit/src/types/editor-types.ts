import type { FileSpec } from 'code-4';

export interface EditorState {
  isLoading?: boolean;
  activeProject?: MoxiProjectSchema;
}

export type ActionTypes =
  'UpdateProject' |
  'SetEngine' |
  'SetWorld' |
  'Loaded';

export interface ReducerActions {
  payload: any;
  type: ActionTypes;
}

export interface ProviderState {
  state: EditorState;
  dispatch?: React.Dispatch<ReducerActions>;
}

export interface MoxiProjectSchema {
  name: string;
  description: string;
  files: Record<string, FileSpec>;
  initfile: 'index.ts';
  htmlDoc?: string;
  activeFile?: string;
}


