import PIXI from 'pixi.js';
import { Asset } from '..';
export declare class AssetLoader {
    PIXIAssets: PIXI.AssetsClass;
    textures: PIXI.Texture[];
    loadAssets: (assets: Asset[]) => Promise<this>;
}
