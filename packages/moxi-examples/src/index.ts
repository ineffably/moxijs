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
import { initParallaxSpaceShooter } from './examples/07-parallax-space-shooter';

// CodeMirror imports
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

// Import example source code using Vite's ?raw loader
import basicSpriteSource from './examples/01-basic-sprite.ts?raw';
import rotatingSpriteSource from './examples/02-rotating-sprite.ts?raw';
import pixiOnlySource from './examples/03-pixi-only.ts?raw';
import animatedCharacterSource from './examples/04-animated-character.ts?raw';
import progressBarSource from './examples/05-progress-bar.ts?raw';
import bunnyAdventureSource from './examples/06-bunny-adventure.ts?raw';
import parallaxSpaceShooterSource from './examples/07-parallax-space-shooter.ts?raw';

// Example registry
interface Example {
  name: string;
  description: string;
  init: () => Promise<void>;
  source: string; // Source code as string (from ?raw import)
}

const examples: Record<string, Example> = {
  'basic-sprite': {
    name: '01 - Basic Sprite',
    description: 'The simplest example - displays a single sprite',
    init: initBasicSprite,
    source: basicSpriteSource
  },
  'rotating-sprite': {
    name: '02 - Rotating Sprite',
    description: 'A sprite that rotates with a label showing the angle',
    init: initRotatingSprite,
    source: rotatingSpriteSource
  },
  'pixi-only': {
    name: '03 - PIXI.js Only',
    description: 'Pure PIXI.js example without Moxi - rotating bunny grid',
    init: initPixiOnly,
    source: pixiOnlySource
  },
  'animated-character': {
    name: '04 - Animated Character',
    description: 'Sprite animation with camera following',
    init: initAnimatedCharacter,
    source: animatedCharacterSource
  },
  'progress-bar': {
    name: '05 - Progress Bar',
    description: 'Custom Logic component creating an animated progress bar',
    init: initProgressBar,
    source: progressBarSource
  },
  'bunny-adventure': {
    name: '06 - Bunny Adventure',
    description: 'Player movement with arrow keys, tile world, and camera',
    init: initBunnyAdventure,
    source: bunnyAdventureSource
  },
  'parallax-space-shooter': {
    name: '07 - Parallax Space Shooter',
    description: 'Parallax scrolling with multiple background layers at different speeds',
    init: initParallaxSpaceShooter,
    source: parallaxSpaceShooterSource
  }
};

let currentExample: string | null = null;

// Global CodeMirror instance
let codeEditor: EditorView | null = null;

// Initialize CodeMirror editor
function initCodeEditor(container: HTMLElement, sourceCode: string) {
  // Destroy previous instance if exists
  if (codeEditor) {
    codeEditor.destroy();
  }

  // Create new CodeMirror instance
  codeEditor = new EditorView({
    doc: sourceCode,
    extensions: [
      basicSetup, // Line numbers, syntax highlighting, etc.
      javascript({ typescript: true }), // TypeScript support
      oneDark, // VS Code-like dark theme
      EditorView.editable.of(false), // Read-only mode
      EditorView.lineWrapping // Wrap long lines
    ],
    parent: container
  });
}

// Load and display source code
function loadSourceCode(exampleKey: string) {
  const example = examples[exampleKey];
  if (!example) return;

  const codeContainer = document.getElementById('code-container');
  if (!codeContainer) return;

  // Source code is already bundled via ?raw imports
  initCodeEditor(codeContainer, example.source);
}

// Tab switching
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const app = document.getElementById('app');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Update active states
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Toggle split view based on which tab is active
      if (targetTab === 'code') {
        // Show both canvas and code in split view
        app?.classList.add('split-view');
      } else {
        // Show only canvas (full screen)
        app?.classList.remove('split-view');
      }
    });
  });
}

// Load an example
async function loadExample(exampleKey: string, updateHash: boolean = true) {
  const canvasContainer = document.getElementById('canvas-container');
  if (!canvasContainer) return;

  // Check if example exists
  if (!examples[exampleKey]) {
    console.error(`Example "${exampleKey}" not found`);
    return;
  }

  // Clear previous example from canvas container
  canvasContainer.innerHTML = '';
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

  // Load source code
  loadSourceCode(exampleKey);

  // Run the example
  try {
    await examples[exampleKey].init();
  } catch (error) {
    console.error('Error loading example:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    canvasContainer.innerHTML = `<div class="error">Error loading example: ${errorMessage}</div>`;
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
  initTabs();
  window.addEventListener('hashchange', handleHashChange);
});

