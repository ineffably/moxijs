import type { Texture } from 'pixi.js';

export const TextureViewer = ({ assets }: {assets: Texture[]}) => {

  return <div className="texture-viewer">
    <h1>Texture Viewer</h1>
    <div style={{ display: 'flex', flexWrap: 'nowrap', flexDirection: 'row', overflowX: 'scroll' }}>
    {assets.map((texture) => {
      return <div key={texture.label} className="texture-item">
        <img src={texture.label} alt={texture.label} />
      </div>;
    })}
    </div>
  </div>;
};

