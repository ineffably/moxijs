import { StateProvider } from './state-provider';
import { BasicEditor } from '../components/code-editor/basic-editor';
import { SceneEditor } from '../components/scene-editor';

import { ConfigProvider, theme } from 'antd';
import { EditorState, MoxiProjectSchema } from '../types/editor-types';
import { getLocalData } from '../library/local-data';
import { Route, Router } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { ProjectPlayer } from '../components/project-player';
import { project } from '../example-projects/progress-bar'; // Change this to any example project you want to use as a default for the editor root.

import '@ant-design/v5-patch-for-react-19';
import 'antd/dist/reset.css';

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
        <Router hook={useHashLocation}>
          <Route path="/">
            <BasicEditor />
          </Route>
          <Route path="/editscene">
            <SceneEditor />
          </Route>
          <Route path="/example/:exampleName">
            {({ exampleName }: any) => <ProjectPlayer {...{exampleName}} />} 
          </Route>
        </Router>
      </ConfigProvider>
    </StateProvider>
  );
};

