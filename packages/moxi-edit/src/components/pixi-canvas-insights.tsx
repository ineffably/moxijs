import { Scene } from 'moxi';

export interface PixiCanvasInsightsProps {
    scene: Scene;
}

export const PixiCanvasInsights = ({ scene }: PixiCanvasInsightsProps) => {
  if (!scene) return null;
  
  return (
    <div>
      <p>Children</p>
      <pre>{JSON.stringify(scene.children, null, 2)}</pre>
    </div>
  )  
};