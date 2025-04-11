import { putLocalData } from './local-data';
import { EditorState, ReducerActions } from '../types/editor-types';

const persistState = (state: EditorState) => {
  const { activeProject } = state;
  putLocalData('moxi-editor', { activeProject });
  return state;
};

export const editorReducer = (
  lastState: EditorState,
  action: ReducerActions
): EditorState => {
  const { payload, type } = action;

  switch (type) {
    case 'UpdateProject': {
      const { activeProject } = payload;
      return persistState({
        ...lastState,
        ...{ activeProject }
      });
    }
    case 'Loaded':
      const { isLoading } = payload;
      return persistState({
        ...lastState,
        ...{ isLoading }
      });
    default: {
      console.warn('StoreReducer: type not handled', type);
      console.warn('StoreReducer: payload', payload);
      return persistState({ ...lastState });
    }
  }
};
