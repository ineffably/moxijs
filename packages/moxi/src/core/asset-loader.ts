import PIXI from 'pixi.js';
import { Asset } from '..';
import { EventEmitter } from './event-system';

/** Events emitted by AssetLoader. */
export interface AssetLoaderEvents extends Record<string, (...args: any[]) => void> {
  'loading:start': () => void;
  'loading:end': () => void;
}

/**
 * Wrapper around PIXI.Assets with loading events.
 *
 * @example
 * ```ts
 * const { loadAssets, PIXIAssets } = await setupMoxi({...});
 *
 * await loadAssets([
 *   { src: './player.png', alias: 'player' },
 *   { src: './enemy.png', alias: 'enemy' }
 * ]);
 *
 * const texture = PIXIAssets.get('player');
 * ```
 */
export class AssetLoader {
  /** PIXI.Assets instance. Use .get(alias) to retrieve loaded textures. */
  PIXIAssets: PIXI.AssetsClass = PIXI.Assets;

  /** All loaded textures. */
  textures: PIXI.Texture[] = [];

  /** True while loading in progress. */
  isLoading: boolean = false;

  private events: EventEmitter<AssetLoaderEvents> = new EventEmitter<AssetLoaderEvents>();

  /** Subscribe to 'loading:start' or 'loading:end' events. */
  on<K extends keyof AssetLoaderEvents>(event: K, listener: AssetLoaderEvents[K]): void {
    this.events.on(event, listener);
  }

  /** Unsubscribe from events. */
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