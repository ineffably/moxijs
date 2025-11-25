import PIXI from 'pixi.js';
import { Asset } from '..';
import { EventEmitter } from './event-system';

export interface AssetLoaderEvents extends Record<string, (...args: any[]) => void> {
  'loading:start': () => void;
  'loading:end': () => void;
}

export class AssetLoader {
  PIXIAssets: PIXI.AssetsClass = PIXI.Assets;
  textures: PIXI.Texture[] = [];
  isLoading: boolean = false;
  private events: EventEmitter<AssetLoaderEvents> = new EventEmitter<AssetLoaderEvents>();

  /**
   * Subscribe to loading events
   */
  on<K extends keyof AssetLoaderEvents>(event: K, listener: AssetLoaderEvents[K]): void {
    this.events.on(event, listener);
  }

  /**
   * Unsubscribe from loading events
   */
  off<K extends keyof AssetLoaderEvents>(event: K, listener: AssetLoaderEvents[K]): void {
    this.events.off(event, listener);
  }

  loadAssets = async (assets: Asset[]) => {
    const { PIXIAssets } = this;
    const failedAssets: string[] = [];

    // Emit loading start event
    this.isLoading = true;
    this.events.emit('loading:start');

    try {
      for (let i = 0; i < assets.length; i++) {
        const { src, alias } = assets[i];

        try {
          if (alias) {
            if (!PIXIAssets.cache.has(alias)) {
              const texture = await PIXIAssets.load({ alias, src });
              this.textures.push(texture);
            }
          } else {
            const texture = await PIXIAssets.load(src);
            this.textures.push(texture);
          }
        } catch (error) {
          console.error(`Failed to load asset: ${src}`, error);
          failedAssets.push(src);
        }
      }

      if (failedAssets.length > 0) {
        console.warn(`${failedAssets.length} asset(s) failed to load:`, failedAssets);
      }

      return this;
    } finally {
      // Emit loading end event
      this.isLoading = false;
      this.events.emit('loading:end');
    }
  };
}