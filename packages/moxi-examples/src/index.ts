/**
 * Moxi Examples - Main Entry Point
 * Provides a simple UI to select and run different examples
 */
import { initBasicSprite } from './examples/01-basic-sprite';
import { initRotatingSprite } from './examples/02-rotating-sprite';
import { initPixiOnly } from './examples/03-pixi-only';
import { initAnimatedCharacter } from './examples/04-animated-character';
import { initProgressBar } from './examples/05-progress-bar';
import { initBunnyAdventure } from './examples/06-bunny-adventure';

// Example registry
interface Example {
  name: string;
  description: string;
  init: () => Promise<void>;
}

const examples: Record<string, Example> = {
  'basic-sprite': {
    name: '01 - Basic Sprite',
    description: 'The simplest example - displays a single sprite',
    init: initBasicSprite
  },
  'rotating-sprite': {
    name: '02 - Rotating Sprite',
    description: 'A sprite that rotates with a label showing the angle',
    init: initRotatingSprite
  },
  'pixi-only': {
    name: '03 - PIXI.js Only',
    description: 'Pure PIXI.js example without Moxi - rotating bunny grid',
    init: initPixiOnly
  },
  'animated-character': {
    name: '04 - Animated Character',
    description: 'Sprite animation with camera following',
    init: initAnimatedCharacter
  },
  'progress-bar': {
    name: '05 - Progress Bar',
    description: 'Custom Logic component creating an animated progress bar',
    init: initProgressBar
  },
  'bunny-adventure': {
    name: '06 - Bunny Adventure',
    description: 'Player movement with arrow keys, tile world, and camera',
    init: initBunnyAdventure
  }
};

let currentExample: string | null = null;

// Load an example
async function loadExample(exampleKey: string, updateHash: boolean = true) {
  const app = document.getElementById('app');
  if (!app) return;

  // Check if example exists
  if (!examples[exampleKey]) {
    console.error(`Example "${exampleKey}" not found`);
    return;
  }

  // Clear previous example
  app.innerHTML = '';
  currentExample = exampleKey;

  // Update URL hash
  if (updateHash) {
    window.location.hash = exampleKey;
  }

  // Update UI
  document.querySelectorAll('.example-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-example="${exampleKey}"]`)?.classList.add('active');

  // Run the example
  try {
    await examples[exampleKey].init();
  } catch (error) {
    console.error('Error loading example:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    app.innerHTML = `<div class="error">Error loading example: ${errorMessage}</div>`;
  }
}

// Get example key from URL hash
function getExampleFromHash(): string | null {
  const hash = window.location.hash.slice(1); // Remove the '#'
  return hash && examples[hash] ? hash : null;
}

// Initialize UI
function initUI() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  // Create example buttons
  Object.entries(examples).forEach(([key, example]) => {
    const button = document.createElement('button');
    button.className = 'example-btn';
    button.dataset.example = key;
    button.innerHTML = `
      <div class="example-title">${example.name}</div>
      <div class="example-desc">${example.description}</div>
    `;
    button.addEventListener('click', () => loadExample(key));
    sidebar.appendChild(button);
  });

  // Load example from hash or default to first
  const hashExample = getExampleFromHash();
  const exampleToLoad = hashExample || Object.keys(examples)[0];
  loadExample(exampleToLoad, !hashExample); // Only update hash if we're loading default
}

// Handle hash changes (browser back/forward)
function handleHashChange() {
  const hashExample = getExampleFromHash();
  if (hashExample && hashExample !== currentExample) {
    loadExample(hashExample, false); // Don't update hash since it already changed
  }
}

// Start the app
document.addEventListener('DOMContentLoaded', () => {
  initUI();
  window.addEventListener('hashchange', handleHashChange);
});

