import { useRef } from 'react';

export const SceneRender = () => {
  const sceneRef = useRef(null);

  return(
    <div ref={sceneRef}></div>
  );
}