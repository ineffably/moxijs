import { prepMoxi } from 'moxi';
import { useEffect, useRef, useState } from 'react';
import spaceAssets from '../../../assets/space-assets.json';
import type { Texture } from 'pixi.js';
import { EditorLayout } from './editor-layout';

import './scene-editor.css';
import 'rc-dock/dist/rc-dock.css';

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


  return (
    <div>
      <EditorLayout />
    </div>
  );
};