import PIXI from 'pixi.js';
import { Container, Graphics, Text } from 'pixi.js';
import { FallingSquaresAnimation, FallingSquaresOptions } from './falling-squares-animation';

// Re-export for convenience
export { FallingSquaresAnimation };
export type { FallingSquaresOptions };

/**
 * Interface for custom loading animations.
 * Implement this to create your own loading animation plugin.
 *
 * @example
 * ```ts
 * class SpinnerAnimation implements LoadingAnimation {
 *   private spinner: Graphics;
 *   private rotation = 0;
 *
 *   init(container: Container) {
 *     this.spinner = new Graphics();
 *     this.spinner.arc(0, 0, 30, 0, Math.PI * 1.5);
 *     this.spinner.stroke({ width: 4, color: 0xffffff });
 *     container.addChild(this.spinner);
 *   }
 *
 *   update(context: LoadingAnimationContext) {
 *     this.rotation += context.deltaTime * 5;
 *     this.spinner.rotation = this.rotation;
 *     this.spinner.x = context.width / 2;
 *     this.spinner.y = context.height / 2 - 20;
 *   }
 *
 *   reset() { this.rotation = 0; }
 *   destroy() { this.spinner?.destroy(); }
 * }
 * ```
 */
export interface LoadingAnimation {
  /**
   * Initialize the animation. Add your display objects to the container.
   * @param container - Parent container to add animation elements to
   */
  init(container: Container): void;

  /**
   * Update animation each frame.
   * @param context - Current animation context with timing and dimensions
   */
  update(context: LoadingAnimationContext): void;

  /**
   * Reset animation state when loading starts.
   */
  reset(): void;

  /**
   * Clean up animation resources.
   */
  destroy(): void;
}

/**
 * Context passed to LoadingAnimation.update() each frame.
 */
export interface LoadingAnimationContext {
  /** Total elapsed time in seconds since loading started */
  time: number;
  /** Delta time in seconds since last frame */
  deltaTime: number;
  /** Screen width in pixels */
  width: number;
  /** Screen height in pixels */
  height: number;
  /** Loading text element (for positioning relative to text) */
  textElement: Text;
}

/**
 * Loading scene options.
 */
export interface LoadingSceneOptions {
  /** Background color (default: 0x1a1a1a) */
  backgroundColor?: number;
  /** Loading text (default: 'LOADING...') */
  text?: string;
  /** Text style overrides */
  textStyle?: Partial<PIXI.TextStyle>;
  /**
   * Custom loading animation plugin.
   * If not provided, uses FallingSquaresAnimation.
   *
   * @example
   * ```ts
   * // Custom animation
   * const options: LoadingSceneOptions = {
   *   animation: new MyCustomAnimation()
   * };
   *
   * // Or customize the default
   * const options: LoadingSceneOptions = {
   *   animation: new FallingSquaresAnimation({
   *     squareSize: 16,
   *     palette: [0xff0000, 0x00ff00]
   *   })
   * };
   * ```
   */
  animation?: LoadingAnimation;
  /** Options for default FallingSquaresAnimation (ignored if custom animation provided) */
  fallingSquaresOptions?: FallingSquaresOptions;
}

/**
 * Loading scene component for Moxi.
 * Shows an animated loading screen during asset loading.
 *
 * @example
 * ```ts
 * // Via setupMoxi (recommended)
 * const { loadingScene } = await setupMoxi({
 *   showLoadingScene: true,
 *   loadingSceneOptions: {
 *     backgroundColor: 0x222222,
 *     text: 'Please wait...',
 *     animation: new FallingSquaresAnimation({ squareSize: 16 })
 *   }
 * });
 *
 * // Manual control
 * loadingScene.show();
 * await loadAssets([...]);
 * loadingScene.hide();
 * ```
 */
export class LoadingScene extends Container {
  private text: Text;
  private background: Graphics;
  private animationContainer: Container;
  private animation: LoadingAnimation;
  private ticker: PIXI.Ticker;
  private renderer: PIXI.Renderer | null = null;
  private time: number = 0;
  private backgroundColor: number;

  constructor(options: LoadingSceneOptions = {}) {
    super();

    const {
      backgroundColor = 0x1a1a1a,
      text = 'LOADING...',
      textStyle = {},
      animation,
      fallingSquaresOptions
    } = options;

    this.backgroundColor = backgroundColor;

    // Use provided animation or create default
    this.animation = animation ?? new FallingSquaresAnimation(fallingSquaresOptions);

    // Background
    this.background = new Graphics();
    this.addChild(this.background);

    // Animation container (between background and text)
    this.animationContainer = new Container();
    this.addChild(this.animationContainer);

    // Text
    this.text = new Text({
      text,
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 16,
        fill: 0xffffff,
        fontWeight: 'bold',
        ...textStyle
      }
    });
    this.text.anchor.set(0.5);
    this.addChild(this.text);

    // Initialize animation
    this.animation.init(this.animationContainer);

    // Ticker
    this.ticker = new PIXI.Ticker();
    this.ticker.autoStart = false;
    this.ticker.add(() => {
      if (this.visible && this.renderer) {
        const deltaTime = this.ticker.deltaTime / 60;
        this.time += deltaTime;
        this.update(this.renderer.width, this.renderer.height, deltaTime);
        this.renderer.render(this);
      }
    });
  }

  private update(width: number, height: number, deltaTime: number): void {
    // Background
    this.background.clear();
    this.background.rect(0, 0, width, height);
    this.background.fill({ color: this.backgroundColor });

    // Text position
    this.text.x = width / 2 - 4;
    this.text.y = height / 2 + 60;

    // Update animation
    this.animation.update({
      time: this.time,
      deltaTime,
      width,
      height,
      textElement: this.text
    });
  }

  /**
   * Initialize with renderer reference.
   * @param renderer - PIXI renderer
   */
  init(renderer: PIXI.Renderer): void {
    this.renderer = renderer;
  }

  /**
   * Show the loading scene and start animation.
   */
  show(): void {
    this.visible = true;
    this.time = 0;
    this.animation.reset();
    if (!this.ticker.started) {
      this.ticker.start();
    }
  }

  /**
   * Hide the loading scene and stop animation.
   */
  hide(): void {
    this.visible = false;
    if (this.ticker.started) {
      this.ticker.stop();
    }
  }

  /**
   * Clean up resources.
   */
  destroy(): void {
    if (this.ticker.started) {
      this.ticker.stop();
    }
    this.ticker.destroy();
    this.animation.destroy();
    super.destroy();
  }
}
