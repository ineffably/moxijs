import { Application, Assets, Container, Sprite } from 'pixi.js';

/**
 * Basic PIXI.js example without Moxi
 * Shows how to use PIXI.js directly for comparison
 */

export async function initPixiOnly() {
  const root = document.getElementById('app');
  if (!root) throw new Error('App element not found');

  // Clear any existing content
  root.innerHTML = '';

  // Create a new PIXI application
  const app = new Application();

  // Initialize the application
  await app.init({ 
    background: '#1099bb',
    resizeTo: root
  });

  // Append the application canvas to the root element
  root.appendChild(app.canvas);
  
  // Create and add a container to the stage
  const container = new Container();
  app.stage.addChild(container);

  // Load the bunny texture from PIXI.js examples
  const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

  // Create a 5x5 grid of bunnies in the container
  for (let i = 0; i < 25; i++) {
    const bunny = new Sprite(texture);
    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    container.addChild(bunny);
  }
  
  // Move the container to the center
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  // Center the bunny sprites in local container coordinates
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;
  
  // Listen for animate update
  app.ticker.add((time) => {
    // Continuously rotate the container!
    container.rotation -= 0.01 * time.deltaTime;
  });

  console.log('✅ PIXI-only (no Moxi) example loaded');
}

