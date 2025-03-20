import { StateProvider } from './state-provider';
import { BasicEditor } from './basic-editor';

export const EditorRoot = ({ children }) => {
  return (
    <StateProvider>
      <BasicEditor />
    </StateProvider>
  );
};