import { StateProvider } from './state-provider';
import { BasicEditor } from '../components/code-editor/basic-editor';
import { SceneEditor } from '../components/scene-editor';

import { ConfigProvider, theme, Card, Space, Button, Typography } from 'antd';
import { EditorState, MoxiProjectSchema } from '../types/editor-types';
import { getLocalData } from '../library/local-data';
import { Route, Router, Link } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { ProjectPlayer } from './project-player';
import { project } from '../example-projects/progress-bar'; // Change this to any example project you want to use as a default for the editor root.

import '@ant-design/v5-patch-for-react-19';
import 'antd/dist/reset.css';

const { Title } = Typography;

const testProject = project as MoxiProjectSchema;
const cachedState = getLocalData('moxi-editor') as EditorState;

const HomePage = () => {
  const [, navigate] = useHashLocation();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px' }}>
      <Card
        title={<Title level={3}>Moxi Editor</Title>}
        style={{ width: 500, maxWidth: '100%' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Button 
            block 
            size="large" 
            onClick={() => navigate('/editor')}
            type="primary"
          >
            Basic Editor
          </Button>
          <Button 
            block 
            size="large" 
            onClick={() => navigate('/editscene')}
            type="primary"
          >
            Scene Editor
          </Button>
          <Button 
            block 
            size="large" 
            onClick={() => navigate('/example/moxi-progress-bar')}
            type="primary"
          >
            Examples Player
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export const EditorRoot = () => {
  return (
    <StateProvider
      initState={{ activeProject: cachedState?.activeProject || testProject }}
    >
      <ConfigProvider
        theme={{
          algorithm: [theme.defaultAlgorithm],
          // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
        }}
      >
        <Router hook={useHashLocation}>
          <Route path="/">
            <HomePage />
          </Route>
          <Route path="/editor">
            <BasicEditor />
          </Route>
          <Route path="/editscene">
            <SceneEditor />
          </Route>
          <Route path="/example/:exampleName">
            {({ exampleName }: any) => <ProjectPlayer {...{ exampleName }} />}
          </Route>
        </Router>
      </ConfigProvider>
    </StateProvider>
  );
};

