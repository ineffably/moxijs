/**
 * Moxi Examples - Main Entry Point
 * Provides a categorized UI with accordion navigation to select and run examples
 */

// === BASICS ===
import { initBasicSprite } from './examples/01-basics/basic-sprite';
import { initRotatingSprite } from './examples/01-basics/rotating-sprite';
import { initPixiOnly } from './examples/01-basics/pixi-integration';
import { initAnimatedCharacter } from './examples/01-basics/animated-character';
import { initProgressBar } from './examples/01-basics/progress-bar';

// === UI & TEXT ===
import { initTextRendering } from './examples/02-ui/text-rendering';
import { initFontRenderingComparison } from './examples/02-ui/font-rendering-comparison';
import { initUIShowcase } from './examples/02-ui/ui-showcase';

// === GAMEPLAY ===
import { initBunnyAdventure } from './examples/03-gameplay/bunny-adventure';
import { initParallaxSpaceShooter } from './examples/03-gameplay/parallax-shooter';

// === NPC BEHAVIORS ===
import { initDinoAIBehaviors } from './examples/04-npc-behaviors/dino-behaviors';

// === PHYSICS ===
import { initPhysicsBasic } from './examples/06-physics/physics-basic';
import { initStackingTower } from './examples/06-physics/stacking-tower';
import { initNewtonsCradle } from './examples/06-physics/newtons-cradle';

// === TOOLS ===
import { initSpriteLibrary } from './examples/05-tools/sprite-library';
import { initSpriteEditor } from './examples/05-tools/sprite-editor';
import { initParticleEmitterSandbox } from './examples/05-tools/particle-sandbox';

// CodeMirror imports
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

// Import example source code using Vite's ?raw loader
// === BASICS ===
import basicSpriteSource from './examples/01-basics/basic-sprite.ts?raw';
import rotatingSpriteSource from './examples/01-basics/rotating-sprite.ts?raw';
import pixiIntegrationSource from './examples/01-basics/pixi-integration.ts?raw';
import animatedCharacterSource from './examples/01-basics/animated-character.ts?raw';
import progressBarSource from './examples/01-basics/progress-bar.ts?raw';

// === UI & TEXT ===
import textRenderingSource from './examples/02-ui/text-rendering.ts?raw';
import fontRenderingComparisonSource from './examples/02-ui/font-rendering-comparison.ts?raw';
import uiShowcaseSource from './examples/02-ui/ui-showcase.ts?raw';

// === GAMEPLAY ===
import bunnyAdventureSource from './examples/03-gameplay/bunny-adventure.ts?raw';
import parallaxShooterSource from './examples/03-gameplay/parallax-shooter.ts?raw';

// === NPC BEHAVIORS ===
import dinoBehaviorsSource from './examples/04-npc-behaviors/dino-behaviors.ts?raw';

// === PHYSICS ===
import physicsBasicSource from './examples/06-physics/physics-basic.ts?raw';
import stackingTowerSource from './examples/06-physics/stacking-tower.ts?raw';
import newtonsCradleSource from './examples/06-physics/newtons-cradle.ts?raw';

// === TOOLS ===
import spriteLibrarySource from './examples/05-tools/sprite-library.ts?raw';
import spriteEditorSource from './examples/05-tools/sprite-editor.ts?raw';
import particleSandboxSource from './examples/05-tools/particle-sandbox.ts?raw';

// Cleanup function type - examples can return this to clean up resources
type CleanupFunction = () => void;

// Example interface
interface Example {
  name: string;
  description: string;
  init: () => Promise<CleanupFunction | void>;
  source: string;
}

// Track current example's cleanup function
let currentCleanup: CleanupFunction | null = null;

// Category interface
interface Category {
  name: string;
  collapsed: boolean;
  examples: Record<string, Example>;
}

// Categorized examples registry
const categories: Record<string, Category> = {
  'basics': {
    name: 'Basics',
    collapsed: false,
    examples: {
      'basic-sprite': {
        name: 'Sprites',
        description: 'Loading and displaying sprite entities',
        init: initBasicSprite,
        source: basicSpriteSource
      },
      'rotating-sprite': {
        name: 'Rotating Sprite',
        description: 'Simple animation with Logic component',
        init: initRotatingSprite,
        source: rotatingSpriteSource
      },
      'pixi-integration': {
        name: 'PIXI.js Integration',
        description: 'Pure PIXI.js without Moxi wrapper',
        init: initPixiOnly,
        source: pixiIntegrationSource
      },
      'animated-character': {
        name: 'Animated Character',
        description: 'Spritesheet animations with camera follow',
        init: initAnimatedCharacter,
        source: animatedCharacterSource
      },
      'progress-bar': {
        name: 'Progress Bar',
        description: 'Animated progress bar Logic component',
        init: initProgressBar,
        source: progressBarSource
      }
    }
  },
  'ui': {
    name: 'UI & Text',
    collapsed: true,
    examples: {
      'text-rendering': {
        name: 'Text Rendering',
        description: 'Text display options and styles',
        init: initTextRendering,
        source: textRenderingSource
      },
      'font-rendering-comparison': {
        name: 'Font Comparison',
        description: 'Text vs BitmapText vs HTMLText',
        init: initFontRenderingComparison,
        source: fontRenderingComparisonSource
      },
      'ui-showcase': {
        name: 'UI Showcase',
        description: 'Tabbed interface with all UI components',
        init: initUIShowcase,
        source: uiShowcaseSource
      }
    }
  },
  'gameplay': {
    name: 'Gameplay',
    collapsed: true,
    examples: {
      'bunny-adventure': {
        name: 'Bunny Adventure',
        description: 'Player movement, tile world, camera',
        init: initBunnyAdventure,
        source: bunnyAdventureSource
      },
      'parallax-shooter': {
        name: 'Parallax Shooter',
        description: 'Asteroids-style space shooter with parallax',
        init: initParallaxSpaceShooter,
        source: parallaxShooterSource
      }
    }
  },
  'npc-behaviors': {
    name: 'NPC Behaviors',
    collapsed: true,
    examples: {
      'dino-behaviors': {
        name: 'Dino NPC Behaviors',
        description: 'FSM behaviors: Follow, Flee, Patrol, Wander',
        init: initDinoAIBehaviors,
        source: dinoBehaviorsSource
      }
    }
  },
  'physics': {
    name: 'Physics',
    collapsed: true,
    examples: {
      'physics-basic': {
        name: 'Physics Basics',
        description: 'Planck.js physics with boxes and balls',
        init: initPhysicsBasic,
        source: physicsBasicSource
      },
      'stacking-tower': {
        name: 'Stacking Tower',
        description: 'Drop shapes to build the tallest tower',
        init: initStackingTower,
        source: stackingTowerSource
      },
      'newtons-cradle': {
        name: "Newton's Cradle",
        description: 'Classic momentum transfer pendulum',
        init: initNewtonsCradle,
        source: newtonsCradleSource
      }
    }
  },
  'tools': {
    name: 'Tools & Editors',
    collapsed: true,
    examples: {
      'sprite-library': {
        name: 'Sprite Library',
        description: 'Browse all available sprites and textures',
        init: initSpriteLibrary,
        source: spriteLibrarySource
      },
      'sprite-editor': {
        name: 'Sprite Editor',
        description: 'Edit sprites with pixel-perfect rendering',
        init: initSpriteEditor,
        source: spriteEditorSource
      },
      'particle-sandbox': {
        name: 'Particle Sandbox',
        description: 'Particle system editor with presets',
        init: initParticleEmitterSandbox,
        source: particleSandboxSource
      }
    }
  }
};

let currentExample: string | null = null;
let currentCategory: string | null = null;

// Global CodeMirror instance
let codeEditor: EditorView | null = null;

// Initialize CodeMirror editor
function initCodeEditor(container: HTMLElement, sourceCode: string) {
  if (codeEditor) {
    codeEditor.destroy();
  }

  codeEditor = new EditorView({
    doc: sourceCode,
    extensions: [
      basicSetup,
      javascript({ typescript: true }),
      oneDark,
      EditorView.editable.of(false),
      EditorView.lineWrapping
    ],
    parent: container
  });
}

// Copy code to clipboard
async function copyCodeToClipboard(sourceCode: string) {
  try {
    await navigator.clipboard.writeText(sourceCode);
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
      const originalText = copyBtn.innerHTML;
      copyBtn.classList.add('copied');
      copyBtn.innerHTML = `
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
        </svg>
        Copied!
      `;
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = originalText;
      }, 2000);
    }
  } catch (err) {
    console.error('Failed to copy code:', err);
  }
}

// Find example by key across all categories
function findExample(exampleKey: string): { category: string; example: Example } | null {
  for (const [catKey, category] of Object.entries(categories)) {
    if (category.examples[exampleKey]) {
      return { category: catKey, example: category.examples[exampleKey] };
    }
  }
  return null;
}

// Load and display source code
function loadSourceCode(exampleKey: string) {
  const found = findExample(exampleKey);
  if (!found) return;

  const codeEditorWrapper = document.getElementById('code-editor-wrapper');
  if (!codeEditorWrapper) return;

  codeEditorWrapper.innerHTML = '';
  initCodeEditor(codeEditorWrapper, found.example.source);

  const copyBtn = document.getElementById('copy-btn');
  if (copyBtn) {
    copyBtn.onclick = () => copyCodeToClipboard(found.example.source);
  }
}

// Trigger canvas resize
function triggerCanvasResize() {
  window.dispatchEvent(new Event('resize'));
}

// Tab switching
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const app = document.getElementById('app');
  if (!app) return;

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (targetTab === 'code') {
        app.classList.remove('code-hidden');
        app.classList.add('code-view');
      } else {
        app.classList.remove('code-view');
        app.classList.add('code-hidden');
      }

      setTimeout(() => {
        triggerCanvasResize();
      }, 100);
    });
  });
}

// Initialize resize handle for split pane
function initResizeHandle() {
  const resizeHandle = document.getElementById('resize-handle');
  const canvasContainer = document.getElementById('canvas-container');
  const codeContainer = document.getElementById('code-container');
  const app = document.getElementById('app');

  if (!resizeHandle || !canvasContainer || !codeContainer || !app) return;

  let isResizing = false;

  const startResize = (e: MouseEvent) => {
    isResizing = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  const doResize = (e: MouseEvent) => {
    if (!isResizing) return;

    const appRect = app.getBoundingClientRect();
    const mouseY = e.clientY - appRect.top;
    const appHeight = appRect.height;

    const minHeight = 200;
    const maxHeight = appHeight - minHeight;

    const canvasHeight = Math.max(minHeight, Math.min(maxHeight, mouseY));
    const codeHeight = appHeight - canvasHeight;

    canvasContainer.style.flex = 'none';
    canvasContainer.style.height = `${canvasHeight}px`;
    codeContainer.style.flex = 'none';
    codeContainer.style.height = `${codeHeight}px`;
  };

  const stopResize = () => {
    if (!isResizing) return;
    isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    triggerCanvasResize();
  };

  resizeHandle.addEventListener('mousedown', startResize);
  document.addEventListener('mousemove', doResize);
  document.addEventListener('mouseup', stopResize);
}

// Toggle category accordion
function toggleCategory(categoryKey: string) {
  const category = categories[categoryKey];
  if (!category) return;

  category.collapsed = !category.collapsed;

  const categoryEl = document.querySelector(`[data-category="${categoryKey}"]`);
  const examplesEl = document.querySelector(`[data-category-examples="${categoryKey}"]`);
  const chevron = categoryEl?.querySelector('.category-chevron');

  if (categoryEl && examplesEl && chevron) {
    if (category.collapsed) {
      categoryEl.classList.add('collapsed');
      examplesEl.classList.add('collapsed');
      chevron.textContent = '\u25B6'; // Right arrow
    } else {
      categoryEl.classList.remove('collapsed');
      examplesEl.classList.remove('collapsed');
      chevron.textContent = '\u25BC'; // Down arrow
    }
  }
}

// Load an example
async function loadExample(exampleKey: string, updateHash: boolean = true) {
  const canvasContainer = document.getElementById('canvas-container');
  if (!canvasContainer) return;

  const found = findExample(exampleKey);
  if (!found) {
    console.error(`Example "${exampleKey}" not found`);
    return;
  }

  // Clean up previous example if it has a cleanup function
  if (currentCleanup) {
    try {
      currentCleanup();
    } catch (err) {
      console.warn('Error during example cleanup:', err);
    }
    currentCleanup = null;
  }

  // Clear previous example
  canvasContainer.innerHTML = '';
  currentExample = exampleKey;
  currentCategory = found.category;

  // Update URL hash
  if (updateHash) {
    window.location.hash = exampleKey;
  }

  // Update UI - remove active from all, add to current
  document.querySelectorAll('.example-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-example="${exampleKey}"]`)?.classList.add('active');

  // Collapse other categories, expand the one containing this example
  Object.keys(categories).forEach(catKey => {
    if (catKey === found.category) {
      // Expand target category if collapsed
      if (categories[catKey].collapsed) {
        toggleCategory(catKey);
      }
    } else {
      // Collapse other categories if expanded
      if (!categories[catKey].collapsed) {
        toggleCategory(catKey);
      }
    }
  });

  // Reset to game view
  const app = document.getElementById('app');
  const gameTab = document.getElementById('game-tab');
  const codeTab = document.getElementById('code-tab');
  const codeContainer = document.getElementById('code-container');

  if (app) {
    app.classList.remove('code-view');
    app.classList.add('code-hidden');
  }

  if (canvasContainer && codeContainer) {
    canvasContainer.style.height = '';
    canvasContainer.style.flex = '';
    codeContainer.style.height = '';
    codeContainer.style.flex = '';
  }

  if (gameTab && codeTab) {
    gameTab.classList.add('active');
    codeTab.classList.remove('active');
  }

  // Load source code
  loadSourceCode(exampleKey);

  // Run the example
  try {
    const cleanup = await found.example.init();
    if (typeof cleanup === 'function') {
      currentCleanup = cleanup;
    }
  } catch (error) {
    console.error('Error loading example:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    canvasContainer.innerHTML = `<div class="error">Error loading example: ${errorMessage}</div>`;
  }
}

// Get example key from URL hash
function getExampleFromHash(): string | null {
  const hash = window.location.hash.slice(1);
  const exampleKey = hash.split('/')[0];
  return exampleKey && findExample(exampleKey) ? exampleKey : null;
}

// Create shared header HTML
function createHeader(): HTMLElement {
  const header = document.createElement('div');
  header.className = 'header';
  header.innerHTML = `
    <h1>MOXIJS EXAMPLES</h1>
  `;
  return header;
}

// Initialize UI with accordion categories
function initUI() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  // Clear existing content and create fresh header
  sidebar.innerHTML = '';
  sidebar.appendChild(createHeader());

  // Create accordion categories
  Object.entries(categories).forEach(([catKey, category]) => {
    // Category header
    const categoryHeader = document.createElement('div');
    categoryHeader.className = `category-header ${category.collapsed ? 'collapsed' : ''}`;
    categoryHeader.dataset.category = catKey;
    categoryHeader.innerHTML = `
      <span class="category-chevron">${category.collapsed ? '\u25B6' : '\u25BC'}</span>
      <span class="category-name">${category.name}</span>
      <span class="category-count">${Object.keys(category.examples).length}</span>
    `;
    categoryHeader.addEventListener('click', () => toggleCategory(catKey));
    sidebar.appendChild(categoryHeader);

    // Examples container
    const examplesContainer = document.createElement('div');
    examplesContainer.className = `category-examples ${category.collapsed ? 'collapsed' : ''}`;
    examplesContainer.dataset.categoryExamples = catKey;

    // Create example buttons
    Object.entries(category.examples).forEach(([key, example]) => {
      const button = document.createElement('button');
      button.className = 'example-btn';
      button.dataset.example = key;
      button.innerHTML = `
        <div class="example-title">${example.name}</div>
        <div class="example-desc">${example.description}</div>
      `;
      button.addEventListener('click', () => loadExample(key));
      examplesContainer.appendChild(button);
    });

    sidebar.appendChild(examplesContainer);
  });

  // Load example from hash or default to first
  const hashExample = getExampleFromHash();
  const defaultExample = Object.keys(Object.values(categories)[0].examples)[0];
  const exampleToLoad = hashExample || defaultExample;
  loadExample(exampleToLoad, !hashExample);
}

// Handle hash changes (browser back/forward)
function handleHashChange() {
  const hashExample = getExampleFromHash();
  if (hashExample && hashExample !== currentExample) {
    loadExample(hashExample, false);
  }
}

// Start the app
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    app.classList.add('code-hidden');
  }

  initUI();
  initResizeHandle();
  initTabs();
  window.addEventListener('hashchange', handleHashChange);
});
