/**
 * Mini-GUI Basics Example
 *
 * Demonstrates the basic usage of @moxijs/mini-gui for creating
 * debug control panels in MoxiJS applications.
 */

import { Application, Graphics, Ticker } from 'pixi.js';
import FontFaceObserver from 'fontfaceobserver';
import { GUI } from '@moxijs/mini-gui';

/** Sample game object to control */
const gameObject = {
  x: 300,
  y: 200,
  rotation: 0,
  scale: 1,
  speed: 2,
  autoRotate: true,
  name: 'Player',
  shape: 'square',
};

/** Stats that update every frame */
const stats = {
  fps: 0,
  elapsed: 0,
  frames: 0,
};

export async function initGUIBasics(): Promise<void> {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  // Create PIXI application
  const app = new Application();
  await app.init({
    background: 0x1a1a2e,
    resizeTo: container,
    antialias: false,
    roundPixels: true,
  });
  container.appendChild(app.canvas);

  // Wait for PixelOperator8 font to load (defined in index.css @font-face)
  const fontObserver = new FontFaceObserver('PixelOperator8');
  await fontObserver.load().catch(() => {
    console.warn('PixelOperator8 font failed to load, falling back to default');
  });

  // Create a simple shape to control
  const shape = new Graphics();
  const drawShape = () => {
    shape.clear();
    if (gameObject.shape === 'circle') {
      shape.circle(0, 0, 30);
    } else {
      shape.rect(-30, -30, 60, 60);
    }
    shape.fill(0x00d4ff);
  };
  drawShape();
  shape.x = gameObject.x;
  shape.y = gameObject.y;
  app.stage.addChild(shape);

  // Create the mini-gui panel
  const gui = new GUI({
    title: 'Game Object',
    x: 10,
    y: 10,
  });
  app.stage.addChild(gui.container);

  // Position controls with sliders
  const positionFolder = gui.addFolder('Position');
  positionFolder.add(gameObject, 'x', 50, 550);
  positionFolder.add(gameObject, 'y', 50, 350);

  // Appearance controls
  const appearanceFolder = gui.addFolder('Appearance');
  appearanceFolder.add(gameObject, 'scale', 0.5, 3, 0.1);
  appearanceFolder.add(gameObject, 'rotation', 0, Math.PI * 2, 0.1);
  appearanceFolder.add(gameObject, 'shape', ['square', 'circle'])
    .onChange(() => drawShape());

  // Behavior controls
  const behaviorFolder = gui.addFolder('Behavior');
  behaviorFolder.add(gameObject, 'autoRotate');
  behaviorFolder.add(gameObject, 'speed', 0, 10, 0.5);

  // Info controls
  const infoFolder = gui.addFolder('Info');
  infoFolder.add(gameObject, 'name');

  // Stats folder - demonstrates .listen() for read-only display values
  const statsFolder = gui.addFolder('Stats');
  statsFolder.add(stats, 'fps').listen().disable();
  statsFolder.add(stats, 'elapsed').listen().disable();
  statsFolder.add(stats, 'frames').listen().disable();

  // Update loop to sync shape with game object
  app.ticker.add((ticker: Ticker) => {
    // Update stats
    stats.fps = Math.round(ticker.FPS);
    stats.elapsed = Math.round(performance.now() / 1000);
    stats.frames++;

    if (gameObject.autoRotate) {
      gameObject.rotation += gameObject.speed * 0.01 * ticker.deltaTime;
    }

    shape.x = gameObject.x;
    shape.y = gameObject.y;
    shape.rotation = gameObject.rotation;
    shape.scale.set(gameObject.scale);
  });

  // Handle window resize
  const handleResize = () => {
    app.renderer.resize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', handleResize);
}

export default initGUIBasics;
