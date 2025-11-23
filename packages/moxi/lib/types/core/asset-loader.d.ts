import PIXI from 'pixi.js';
import { Asset } from '..';
export interface AssetLoaderEvents extends Record<string, (...args: any[]) => void> {
    'loading:start': () => void;
    'loading:end': () => void;
}
export declare class AssetLoader {
    PIXIAssets: PIXI.AssetsClass;
    textures: PIXI.Texture[];
    isLoading: boolean;
    private events;
    on<K extends keyof AssetLoaderEvents>(event: K, listener: AssetLoaderEvents[K]): void;
    off<K extends keyof AssetLoaderEvents>(event: K, listener: AssetLoaderEvents[K]): void;
    loadAssets: (assets: Asset[]) => Promise<this>;
}
