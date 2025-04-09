import { prepMoxi } from 'moxi';
import { useEffect, useRef, useState } from 'react';
import { PixiCanvasInsights } from '../pixi-canvas-insights';
import { Splitter } from 'antd';
import spaceAssets from '../../../assets/space-assets.json';
import { TextureViewer } from './texture-viewer';
import type { Texture } from 'pixi.js';

import './scene-editor.css';


const editorAssets = spaceAssets as string[];

// TODO: ideally we load a sample project;
// organically arriving at that project object model.
// examples have a current model, not sure I'll stick to it.

export const SceneEditor = () => {
  const sceneRef = useRef(null);
  const [scene, setScene] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [textures, setTextures] = useState<Texture[]>([]);

  useEffect(() => {
    (async () => {
      const { scene: initScene, loadAssets } = await prepMoxi({ hostElement: sceneRef.current });
      
      // TODO: eventually these will be in a sprite sheet once a sprite sheet "loader" is added.
      const initialAssets = await loadAssets(editorAssets.map(path => ({ src: path })));
      
      setTextures(initialAssets.textures);
      setScene(initScene);
      setIsLoaded(true);
    })();
  }, []);

  useEffect(() => {
  }, [isLoaded]);

  // console.log('SceneEditor', isLoaded, textures);

  return (
    <div>
      <Splitter layout="vertical" style={{ height: '100vh' }}>
        <Splitter.Panel defaultSize="730">
          <Splitter>
            <Splitter.Panel defaultSize="1290">
              <div ref={sceneRef}></div>
            </Splitter.Panel>
            <Splitter.Panel defaultSize="300">
              <PixiCanvasInsights scene={scene} />
            </Splitter.Panel>
          </Splitter>
        </Splitter.Panel>
        <Splitter.Panel defaultSize="300">
          <div style={{ height: '300px' }}>
            {isLoaded && <TextureViewer assets={textures}/>}
          </div>
        </Splitter.Panel>
      </Splitter>
    </div>
  );
};