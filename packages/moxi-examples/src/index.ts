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
import { initPhysicsBasic } from './examples/08-physics-basic';
import { initDinoAIBehaviors } from './examples/09-dino-ai-behaviors';
import { initTextRendering } from './examples/10-text-rendering';
import { initUIShowcase } from './examples/14-ui-showcase';
import { initFontRenderingComparison } from './examples/12-font-rendering-comparison';
import { initParticleEmitterSandbox } from './examples/15-particle-emitter-sandbox';
import { initSpriteLibrary } from './examples/16-sprite-library';
import { initSpriteEditor } from './examples/17-sprite-editor';

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
import physicsBasicSource from './examples/08-physics-basic.ts?raw';
import dinoAIBehaviorsSource from './examples/09-dino-ai-behaviors.ts?raw';
import textRenderingSource from './examples/10-text-rendering.ts?raw';
import uiShowcaseSource from './examples/14-ui-showcase.ts?raw';
import fontRenderingComparisonSource from './examples/12-font-rendering-comparison.ts?raw';
import particleEmitterSandboxSource from './examples/15-particle-emitter-sandbox.ts?raw';
import spriteLibrarySource from './examples/16-sprite-library.ts?raw';
import spriteEditorSource from './examples/17-sprite-editor.ts?raw';

// Example registry
interface Example {
  name: string;
  description: string;
  init: () => Promise<void>;
  source: string; // Source code as string (from ?raw import)
}

const examples: Record<string, Example> = {
  'basic-sprite': {
    name: '01 - Sprites!',
    description: 'Moxi sprite entities with a pooling example',
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
  'progress-bar': {
    name: '04 - Progress Bar',
    description: 'Custom Logic component creating an animated progress bar',
    init: initProgressBar,
    source: progressBarSource
  },
  'animated-character': {
    name: '05 - Animated Character',
    description: 'Sprite animation with camera following',
    init: initAnimatedCharacter,
    source: animatedCharacterSource
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
  },
  'physics-basic': {
    name: '08 - Physics Basic',
    description: 'Physics system with Planck.js - falling boxes, bouncing balls',
    init: initPhysicsBasic,
    source: physicsBasicSource
  },
  'dino-ai-behaviors': {
    name: '09 - Dino AI Behaviors',
    description: 'AI behaviors using FSM and Logic: Follow, Flee, Patrol, Wander',
    init: initDinoAIBehaviors,
    source: dinoAIBehaviorsSource
  },
  'text-rendering': {
    name: '10 - Text Rendering',
    description: 'Mechanical scrolling counter, BitmapText, and text styles',
    init: initTextRendering,
    source: textRenderingSource
  },
  'ui-showcase': {
    name: '11 - UI Showcase',
    description: 'Tabbed interface showcasing all UI components',
    init: initUIShowcase,
    source: uiShowcaseSource
  },
  'font-rendering-comparison': {
    name: '12 - Font Rendering Comparison',
    description: 'Side-by-side comparison of Text, BitmapText, and HTMLText',
    init: initFontRenderingComparison,
    source: fontRenderingComparisonSource
  },
  'particle-emitter-sandbox': {
    name: '15 - Particle Emitter Sandbox',
    description: 'Advanced particle system with presets, color gradients, and export/import',
    init: initParticleEmitterSandbox,
    source: particleEmitterSandboxSource
  },
  'sprite-library': {
    name: '16 - Sprite Library',
    description: 'Browse all available sprites and textures loaded in the examples app',
    init: initSpriteLibrary,
    source: spriteLibrarySource
  }
  // 'sprite-editor': {
  //   name: '17 - Sprite Editor',
  //   description: 'Edit and manipulate sprites',
  //   init: initSpriteEditor,
  //   source: spriteEditorSource
  // }
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
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = sourceCode;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
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
    } catch (fallbackErr) {
      console.error('Fallback copy also failed:', fallbackErr);
    }
    document.body.removeChild(textArea);
  }
}

// Load and display source code
function loadSourceCode(exampleKey: string) {
  const example = examples[exampleKey];
  if (!example) return;

  const codeEditorWrapper = document.getElementById('code-editor-wrapper');
  if (!codeEditorWrapper) return;

  // Clear previous editor
  codeEditorWrapper.innerHTML = '';

  // Source code is already bundled via ?raw imports
  initCodeEditor(codeEditorWrapper, example.source);

  // Update copy button handler
  const copyBtn = document.getElementById('copy-btn');
  if (copyBtn) {
    copyBtn.onclick = () => copyCodeToClipboard(example.source);
  }
}

// Initialize copy button
function initCopyButton() {
  const copyBtn = document.getElementById('copy-btn');
  if (copyBtn && currentExample) {
    const example = examples[currentExample];
    if (example) {
      copyBtn.onclick = () => copyCodeToClipboard(example.source);
    }
  }
}

// Trigger canvas resize
function triggerCanvasResize() {
  // Trigger a resize event to update canvas sizing
  // This ensures the canvas recalculates its size when container dimensions change
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

      // Update active states
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update app class to show/hide appropriate views
      if (targetTab === 'code') {
        app.classList.remove('code-hidden');
        app.classList.add('code-view');
      } else {
        app.classList.remove('code-view');
        app.classList.add('code-hidden');
      }

      // Trigger canvas resize after tab switch
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
    
    // Use absolute pixel values - more direct and responsive
    const minHeight = 200;
    const maxHeight = appHeight - minHeight;
    
    // Constrain mouse position to valid range
    const canvasHeight = Math.max(minHeight, Math.min(maxHeight, mouseY));
    const codeHeight = appHeight - canvasHeight;
    
    // Set absolute pixel heights
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

  // Reset to game view when loading a new example
  const app = document.getElementById('app');
  const gameTab = document.getElementById('game-tab');
  const codeTab = document.getElementById('code-tab');
  const codeContainer = document.getElementById('code-container');
  
  if (app) {
    app.classList.remove('code-view');
    app.classList.add('code-hidden');
  }
  
  // Reset container heights to default (remove explicit pixel heights)
  if (canvasContainer && codeContainer) {
    canvasContainer.style.height = '';
    canvasContainer.style.flex = '';
    codeContainer.style.height = '';
    codeContainer.style.flex = '';
  }
  
  // Update tab states
  if (gameTab && codeTab) {
    gameTab.classList.add('active');
    codeTab.classList.remove('active');
  }

  // Load source code
  loadSourceCode(exampleKey);

  // Initialize copy button
  initCopyButton();

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
  const exampleKey = hash.split('/')[0]; // Take first segment before any slash (for sub-paths like ui-showcase/basics)
  return exampleKey && examples[exampleKey] ? exampleKey : null;
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
  // Hide code panel by default
  const app = document.getElementById('app');
  if (app) {
    app.classList.add('code-hidden');
  }

  initUI();
  initResizeHandle();
  initTabs();
  window.addEventListener('hashchange', handleHashChange);
});

