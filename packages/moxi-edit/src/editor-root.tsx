import { StateProvider } from './state-provider';
import { BasicEditor } from './basic-editor';
import { ConfigProvider, theme } from 'antd';
import { EditorState, MoxiProjectSchema } from './types/editor-types';
import { getLocalData } from './library/local-data';
import { project } from './example-projects/basic-pixi-only';
import '@ant-design/v5-patch-for-react-19';
import 'antd/dist/reset.css';
import './editor.css';
import { ProjectPlayer } from './project-player';

const testProject = project as MoxiProjectSchema;
const cachedState = getLocalData('moxi-editor') as EditorState;

export const EditorRoot = () => {
  return (
    <StateProvider
      initState={{ activeProject: cachedState?.activeProject || testProject }}
    >
      <ConfigProvider
        theme={{
          algorithm: [theme.darkAlgorithm],
          // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
        }}
      >
        <BasicEditor />
        {/* <ProjectPlayer /> */}
      </ConfigProvider>
    </StateProvider>
  );
};

