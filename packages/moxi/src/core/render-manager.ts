import PIXI from 'pixi.js';

export class RenderManager {
  static getRenderer: (
    options: Partial<PIXI.AutoDetectOptions>
  ) => Promise<PIXI.Renderer>;

  static create: (
      htmlRoot: HTMLElement, 
      options: Partial<PIXI.AutoDetectOptions>) => Promise<RenderManager>;

  htmlRoot: HTMLElement;
  renderer: PIXI.Renderer;
  fitToWindow = false;

  constructor(htmlRoot: HTMLElement, renderer: PIXI.Renderer) {
    this.htmlRoot = htmlRoot;
    this.renderer = renderer;

    htmlRoot.appendChild(this.renderer.canvas);
    window.addEventListener('resize', () => this.onResize());
    this.onResize();
  }

  render(stage: PIXI.Container) {
    this.renderer.render(stage);
  }

  onResize = () => {
    const { renderer, htmlRoot: root } = this;
    const canvas = renderer.canvas;
    
    // Get the parent dimensions
    const parentWidth = root.clientWidth;
    const parentHeight = root.clientHeight;
    
    // Get the canvas's intended dimensions
    const canvasWidth = renderer.width;
    const canvasHeight = renderer.height;
    
    // Calculate the scale to fit while maintaining aspect ratio
    const scale = Math.min(
      parentWidth / canvasWidth,
      parentHeight / canvasHeight
    );
    
    // Set CSS dimensions to scale the canvas
    canvas.style.width = `${Math.floor(canvasWidth * scale)}px`;
    canvas.style.height = `${Math.floor(canvasHeight * scale)}px`;
  };
}

RenderManager.getRenderer = async (options: Partial<PIXI.AutoDetectOptions>) => (
  await PIXI.autoDetectRenderer(options)
);

RenderManager.create = async (htmlRoot: HTMLElement, options: Partial<PIXI.AutoDetectOptions>) => (
  new RenderManager(htmlRoot, await RenderManager.getRenderer(options))
);
