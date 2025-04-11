import { DockLayout, type LayoutData } from 'rc-dock';
import { EditorMenu } from './editor-menu';

const SceneView = () => {
  return (
    <div style={{ backgroundColor: 'cornflowerblue', width: '100%', height: '100%' }}>Scene Display</div>
  );
};

const SceneGraphView = () => {
  return (
    <div style={{ backgroundColor: 'lightgreen', width: '100%', height: '100%' }}>Scene Graph</div>
  );
};

const AssetLibrary = () => {
  return (
    <div style={{ backgroundColor: 'orange', width: '100%', height: '100%' }}>Asset Library</div>
  );
};

const EntityProperties = () => {
  return (
    <div style={{ backgroundColor: 'lightpink', width: '100%', height: '100%' }}>Entity Properties</div>
  );
};

const assetLibraryTab = {
  id: 'assetLibraryTab',
  title: 'Asset Library',
  content: (<AssetLibrary />),
  closable: false,
};

const sceneEditorGraphTab = {
  id: 'sceneGraphTab',
  title: 'Scene Graph',
  content: (<SceneGraphView />),
  closable: false
};

const sceneTab = {
  id: 'sceneTab',
  title: 'Scene View',
  content: (<SceneView />),
  closable: false,
};

const entityInspector = {
  id: 'entityInspectorTab',
  title: 'Inspector',
  content: (<EntityProperties />),
  closable: false,
};


const layoutData = {
  dockbox: {
    size: 200,
    mode: 'vertical',
    children: [{
      mode: 'horizontal',
      size: 848,
      children: [
        {
          size: 230,
          tabs: [sceneEditorGraphTab],
        },
        {
          size: 2002,
          tabs: [sceneTab],
        },
        {
          size: 230,
          tabs: [entityInspector],
        }
      ]
    },
    {
      size: 146,
      tabs: [assetLibraryTab],
    },
    ]
  }
} as LayoutData;


// if (window.innerWidth < 600) {
//   // remove a column for mobile
//   layout.dockbox.children.pop();
// }

export const EditorLayout = () => {

  // const onDragNewTab = (e) => {
  //   const content = `New Tab ${count++}`;
  //   DragStore.dragStart(DockContextType, {
  //     tab: {
  //       id: content,
  //       content: <div style={{padding: 20}}>{content}</div>,
  //       title: content,
  //       closable: true,
  //     }
  //   }, e.nativeEvent);
  // };

  return (
    <div>
      <EditorMenu />
      <DockLayout
        onLayoutChange={(layout) => console.log('layout changed', layout)}
        defaultLayout={layoutData}
        style={{ position: 'absolute', left: 4, top: 48, right: 4, bottom: 4 }} />
    </div>
  );
};

