import React, { useContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import moxi from 'moxi';
import PIXI from 'pixi.js';
import { Layout, Menu, Splitter, Tabs } from 'antd';
import { RcTabsProps } from 'antd/dist/antd';
import { Code4Editor } from 'code-4';
import { extraLibLoader } from '../../library/extra-lib-loader';
import { EditorContext } from '../../page/state-provider';
import { examplesLibrary } from '../../example-projects';
import { ItemType, MenuItemType } from 'antd/es/menu/interface';
import './basic-editor.css';

const { Content } = Layout;

const requireMap = {
  'React': React,
  'ReactDOM': ReactDOM,
  'moxi': moxi,
  'pixi.js': PIXI
};

interface BasicEditorProps {
  project?: string;
}

export const BasicEditor = () => {
  const { state, dispatch } = useContext(EditorContext);
  const [iframeRef, setIframeRef] = useState(null as HTMLIFrameElement);
  const [consoleRef, setConsoleRef] = useState(null as HTMLTextAreaElement);
  const [currentProject, setCurrentProject] = useState(state.activeProject);
  const [selectedFile, setSelectedFile] = useState(null);
  const [codeText, setCodeText] = useState('');

  (window as any).moxiedit = true;

  const exampleProjects = examplesLibrary.map((project) => ({
    key: `examples-${project.name}`,
    label: project.name,
  })) as ItemType<MenuItemType>[];

  const items = [{
    label: 'File',
    key: 'file'
  }, {
    label: 'Examples',
    key: 'examples',
    children: exampleProjects,
  }] as ItemType<MenuItemType>[];

  useEffect(() => {
    const selectedFile = state.activeProject.files[state.activeProject.activeFile];
    setSelectedFile(selectedFile);
    setCodeText(selectedFile.value);
    setCurrentProject(state.activeProject);
  }, [state?.activeProject?.name]);

  useEffect(() => {
    if (!selectedFile) return;
    selectedFile.value = codeText;
    currentProject.files[currentProject.activeFile] = selectedFile;
    dispatch({ type: 'UpdateProject', payload: { activeProject: currentProject } });
  }, [codeText]);

  if(!currentProject) return(<div>Loading..</div>)
  const tabItems = Object.values(currentProject.files).map((file, i) => {
    return ({
      key: file.name,
      label: file.name,
      children: (
        <div style={{ height: '85vh', width: '100%' }}>
          <Code4Editor
            file={file}
            onCodeChange={(file, codeText) => setCodeText(codeText)}
            renderTarget={iframeRef}
            requireMap={{
              ...requireMap,
            }}
            // onMount={(editor, monaco, compilerOptions) => {

            // }}
            consoleTarget={consoleRef}
            extraLibsPlugin={(defaults) => {
              // const fileDef = `declare module './progress-bar-behavior' { ${file.value} }`
              // defaults.addExtraLib(fileDef, './progress-bar-behavior.tsx');
              extraLibLoader(defaults);
            }}
          />
        </div>
      )
    })
  }) as RcTabsProps[];

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Menu
          style={{ lineHeight: '32px' }}
          theme="dark"
          mode="horizontal"
          items={items}
          onClick={({ key }) => {
            if (key.startsWith('examples-')) {
              const example = examplesLibrary.find((p) => p.name === key.replace('examples-', ''));
              dispatch({ type: 'UpdateProject', payload: { activeProject: example } });
              return;
            }
          }}
        />
      </div>
      <Content>
        <Splitter>
          <Splitter.Panel>
            <Tabs
              tabBarStyle={{ display: currentProject.files.length > 1 ? 'block' : 'none' }}
              activeKey={currentProject.activeFile}
              defaultActiveKey={currentProject.activeFile}
              tabPosition="left"
              size="small"
              items={tabItems}
            />
          </Splitter.Panel>
          <Splitter.Panel>
            <div style={{ height: '85vh', width: '100%', overflow: 'hidden' }}>
              <iframe
                style={{ height: '100%', width: '100%', overflow: 'hidden' }}
                ref={r => { setIframeRef(r); }}
              />
            </div>
          </Splitter.Panel>
        </Splitter>
      </Content>
      <div style={{ height: '10vh', width: '100%' }}>
        <textarea
          readOnly={true}
          ref={r => setConsoleRef(r)}
          style={{
            height: '100%',
            width: '100%',
            backgroundColor: '#222',
            color: 'white',
          }}
          value={''}
        />
      </div>
    </Layout>
  );
};