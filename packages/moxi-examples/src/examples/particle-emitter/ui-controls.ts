import { Application, Texture } from 'pixi.js';
import { EmitterConfig } from './types';
import presets from './presets.json';

/**
 * UI Controls for Particle Emitter Sandbox
 */

const PANEL_STATE_KEY = 'particle-emitter-panel-states';

function loadPanelStates(): Record<string, boolean> {
  try {
    const saved = localStorage.getItem(PANEL_STATE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load panel states from localStorage', e);
  }
  return {};
}

function savePanelStates(states: Record<string, boolean>): void {
  try {
    localStorage.setItem(PANEL_STATE_KEY, JSON.stringify(states));
  } catch (e) {
    console.warn('Failed to save panel states to localStorage', e);
  }
}

export function createEnhancedControls(
  app: Application,
  emitter: any, // EnhancedParticleEmitter
  config: EmitterConfig,
  textures: Record<string, Texture>
): void {
  // Store app reference for preset positioning
  const appRef = app;
  
  // Store references to UI elements for updating
  const uiElements: Record<string, { slider?: HTMLInputElement; valueSpan?: HTMLSpanElement; checkbox?: HTMLInputElement; select?: HTMLSelectElement }> = {};
  
  // Load panel states from localStorage
  const panelStates = loadPanelStates();
  const controlPanel = document.createElement('div');
  controlPanel.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 20px;
    border-radius: 10px;
    font-family: 'Arial', sans-serif;
    font-size: 13px;
    min-width: 300px;
    max-width: 350px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  `;

  // Title
  const title = document.createElement('h2');
  title.textContent = '✨ Particle Emitter Sandbox';
  title.style.cssText = 'margin: 0 0 15px 0; font-size: 18px; color: #4a90e2;';
  controlPanel.appendChild(title);

  // Stats section
  const statsDiv = document.createElement('div');
  statsDiv.style.cssText = 'margin-bottom: 15px; padding: 10px; background: rgba(74, 144, 226, 0.1); border-radius: 5px;';
  controlPanel.appendChild(statsDiv);

  app.ticker.add(() => {
    statsDiv.innerHTML = `
      <div style="margin-bottom: 5px;"><strong>Active Particles:</strong> ${emitter.getActiveParticleCount()}</div>
      <div><strong>FPS:</strong> ${Math.round(app.ticker.FPS)}</div>
    `;
  });

  // Preset dropdown - placed directly in control panel (no collapsible section)
  const presetNames = Object.keys(presets) as (keyof typeof presets)[];
  const presetOptions = presetNames.map(name => name.charAt(0).toUpperCase() + name.slice(1));
  
  // Add a placeholder option
  const placeholder = 'Select preset...';
  presetOptions.unshift(placeholder);
  
  const presetDropdown = addDropdown(controlPanel, 'Preset', placeholder, presetOptions, (value) => {
    if (value !== placeholder) {
      // Find the preset name (case-insensitive)
      const presetName = presetNames.find(name => 
        name.charAt(0).toUpperCase() + name.slice(1) === value
      ) as keyof typeof presets;
      
      if (presetName) {
        applyPreset(appRef, emitter, config, presetName);
        updateUIFromConfig(config, uiElements, emitter);
        // Reset dropdown to placeholder after selection
        presetDropdown.select.value = placeholder;
      }
    }
  });
  
  // Make the placeholder option disabled
  presetDropdown.select.options[0].disabled = true;

  // Emitter settings
  addSection(controlPanel, 'Emitter Settings', true, (content) => {
    uiElements.emitterShape = addDropdown(content, 'Shape', config.emitterShape,
      ['point', 'line', 'lineVertical', 'rectangle', 'circle'],
      (value) => {
        config.emitterShape = value as any;
        emitter.updateConfig(config);
        }
    );

    uiElements.emitterWidth = addSlider(content, 'Width', config.emitterWidth, 0, 3400, 10, (value) => {
      config.emitterWidth = value;
      emitter.updateConfig(config);
    });
    sliderSteps.emitterWidth = 10;

    uiElements.emitterHeight = addSlider(content, 'Height', config.emitterHeight, 0, 3400, 10, (value) => {
      config.emitterHeight = value;
      emitter.updateConfig(config);
    });
    sliderSteps.emitterHeight = 10;

    uiElements.continuous = addCheckbox(content, 'Continuous', config.continuous, (checked) => {
      config.continuous = checked;
      if (checked) {
        emitter.play();
        // Clear repeat interval when continuous is enabled
        if (repeatIntervalId !== null) {
          clearInterval(repeatIntervalId);
          repeatIntervalId = null;
        }
      } else {
        emitter.stop();
        // Start repeat if enabled
        if (config.repeat) {
          startRepeatBursts(emitter, config);
        }
      }
    });

    uiElements.repeat = addCheckbox(content, 'Repeat', config.repeat, (checked) => {
      config.repeat = checked;
      if (checked && !config.continuous) {
        startRepeatBursts(emitter, config);
      } else {
        // Clear repeat interval when disabled or continuous is enabled
        if (repeatIntervalId !== null) {
          clearInterval(repeatIntervalId);
          repeatIntervalId = null;
        }
      }
    });

    // Start repeat interval if already enabled when controls are created
    if (config.repeat && !config.continuous) {
      startRepeatBursts(emitter, config);
    }
  }, panelStates);

  // Particle settings
  addSection(controlPanel, 'Particle Settings', false, (content) => {
    uiElements.rate = addSlider(content, 'Emission Rate', config.rate, 0, 200, 5, (value) => {
      config.rate = value;
      emitter.updateConfig(config);
    });
    sliderSteps.rate = 5;

    uiElements.burst = addSlider(content, 'Burst Count', config.burst, 1, 100, 1, (value) => {
      config.burst = value;
      // Restart repeat interval if active
      if (config.repeat && !config.continuous && repeatIntervalId !== null) {
        startRepeatBursts(emitter, config);
      }
    });
    sliderSteps.burst = 1;

    uiElements.lifetime = addSlider(content, 'Lifetime', config.lifetime, 0.1, 10, 0.1, (value) => {
      config.lifetime = value;
      emitter.updateConfig(config);
      // Restart repeat interval if active (timing changed)
      if (config.repeat && !config.continuous && repeatIntervalId !== null) {
        startRepeatBursts(emitter, config);
      }
    });
    sliderSteps.lifetime = 0.1;

    uiElements.lifetimeVariance = addSlider(content, 'Lifetime Variance', config.lifetimeVariance, 0, 3, 0.1, (value) => {
      config.lifetimeVariance = value;
      emitter.updateConfig(config);
      // Restart repeat interval if active (timing changed)
      if (config.repeat && !config.continuous && repeatIntervalId !== null) {
        startRepeatBursts(emitter, config);
      }
    });
    sliderSteps.lifetimeVariance = 0.1;
  }, panelStates);

  // Physics settings
  addSection(controlPanel, 'Physics', false, (content) => {
    uiElements.speed = addSlider(content, 'Speed', config.speed, 0, 400, 10, (value) => {
      config.speed = value;
      emitter.updateConfig(config);
    });
    sliderSteps.speed = 10;

    uiElements.speedVariance = addSlider(content, 'Speed Variance', config.speedVariance, 0, 200, 5, (value) => {
      config.speedVariance = value;
      emitter.updateConfig(config);
    });
    sliderSteps.speedVariance = 5;

    uiElements.angle = addSlider(content, 'Angle (deg)', config.angle, 0, 360, 1, (value) => {
      config.angle = value;
      emitter.updateConfig(config);
    });
    sliderSteps.angle = 1;

    uiElements.spread = addSlider(content, 'Spread (deg)', config.spread, 0, 360, 1, (value) => {
      config.spread = value;
      emitter.updateConfig(config);
    });
    sliderSteps.spread = 1;

    uiElements.gravity = addSlider(content, 'Gravity', config.gravity, -200, 500, 10, (value) => {
      config.gravity = value;
      emitter.updateConfig(config);
    });
    sliderSteps.gravity = 10;

    uiElements.damping = addSlider(content, 'Damping', config.damping, 0, 1, 0.01, (value) => {
      config.damping = value;
      emitter.updateConfig(config);
    });
    sliderSteps.damping = 0.01;
  }, panelStates);

  // Visual settings
  addSection(controlPanel, 'Visual', false, (content) => {
    // Get all available texture names from the textures object
    const textureNames = Object.keys(textures).sort((a, b) => {
      // Sort: procedural textures first (proc_*), then alphabetical
      const aIsProc = a.startsWith('proc_');
      const bIsProc = b.startsWith('proc_');
      if (aIsProc && !bIsProc) return -1;
      if (!aIsProc && bIsProc) return 1;
      return a.localeCompare(b);
    });

    // Texture selection - layer-based UI
    const textureLabel = document.createElement('div');
    textureLabel.textContent = 'Textures';
    textureLabel.style.cssText = 'margin-bottom: 8px; font-weight: bold; font-size: 12px;';
    content.appendChild(textureLabel);

    // Initialize textures array if not present or empty
    if (!config.textures || config.textures.length === 0) {
      if (config.texture) {
        config.textures = [config.texture];
      } else {
        config.textures = [];
      }
    }

    // Initialize texture weights if not present
    if (!config.textureWeights) {
      config.textureWeights = {};
    }

    // Store layer elements for updates
    const textureLayers: Array<{ texture: string; element: HTMLElement; weightInput?: HTMLInputElement }> = [];

    // Texture selector dropdown (defined early so renderLayers can use updateTextureSelector)
    const selectorWrapper = document.createElement('div');
    selectorWrapper.style.cssText = 'display: flex; gap: 8px; align-items: center; margin-bottom: 12px;';

    const textureSelect = document.createElement('select');
    textureSelect.style.cssText = `
      flex: 1;
      padding: 8px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    `;

    const updateTextureSelector = () => {
      // Clear and rebuild selector options
      textureSelect.innerHTML = '';
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Select texture...';
      placeholder.disabled = true;
      placeholder.selected = true;
      textureSelect.appendChild(placeholder);

      textureNames.forEach((textureName) => {
        if (!config.textures?.includes(textureName)) {
          const option = document.createElement('option');
          option.value = textureName;
          option.textContent = textureName;
          textureSelect.appendChild(option);
        }
      });
    };

    const renderLayers = () => {
      layersContainer.innerHTML = '';
      textureLayers.length = 0;

      // Ensure textures array exists
      if (!config.textures || config.textures.length === 0) {
        return;
      }

      config.textures?.forEach((textureName, index) => {
        const layerDiv = document.createElement('div');
        layerDiv.style.cssText = `
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          margin-bottom: 6px;
          background: rgba(74, 144, 226, 0.1);
          border: 1px solid rgba(74, 144, 226, 0.3);
          border-radius: 4px;
        `;

        const textureNameSpan = document.createElement('span');
        textureNameSpan.textContent = textureName;
        textureNameSpan.style.cssText = 'flex: 1; font-size: 12px;';

        // Weight input (only show if 2+ layers)
        let weightInput: HTMLInputElement | undefined;
        if (config.textures && config.textures.length >= 2) {
          const weightWrapper = document.createElement('div');
          weightWrapper.style.cssText = 'display: flex; align-items: center; gap: 4px;';

          const weightLabel = document.createElement('span');
          weightLabel.textContent = 'Weight:';
          weightLabel.style.cssText = 'font-size: 11px; color: rgba(255, 255, 255, 0.7);';

          weightInput = document.createElement('input');
          weightInput.type = 'number';
          weightInput.min = '0.1';
          weightInput.max = '10';
          weightInput.step = '0.1';
          weightInput.value = (config.textureWeights?.[textureName] || 1.0).toString();
          weightInput.style.cssText = `
            width: 50px;
            padding: 2px 4px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            font-size: 11px;
            text-align: right;
          `;

          weightInput.addEventListener('input', () => {
            const weight = parseFloat(weightInput!.value);
            if (!isNaN(weight) && weight > 0) {
              if (!config.textureWeights) {
                config.textureWeights = {};
              }
              config.textureWeights[textureName] = weight;
              emitter.updateConfig(config);
            }
          });

          weightWrapper.appendChild(weightLabel);
          weightWrapper.appendChild(weightInput);
          layerDiv.appendChild(weightWrapper);
        }

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '✕';
        removeBtn.style.cssText = `
          background: rgba(231, 76, 60, 0.7);
          color: white;
          border: none;
          border-radius: 3px;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s;
        `;
        removeBtn.addEventListener('mouseenter', () => {
          removeBtn.style.background = 'rgba(231, 76, 60, 1)';
        });
        removeBtn.addEventListener('mouseleave', () => {
          removeBtn.style.background = 'rgba(231, 76, 60, 0.7)';
        });
        removeBtn.addEventListener('click', () => {
          const index = config.textures?.indexOf(textureName);
          if (index !== undefined && index > -1) {
            config.textures!.splice(index, 1);
            if (config.textureWeights?.[textureName]) {
              delete config.textureWeights[textureName];
            }
            // Ensure at least one texture remains
            if (config.textures!.length === 0 && textureNames.length > 0) {
              config.textures = [textureNames[0]];
            }
            if (config.textures!.length > 0) {
              config.texture = config.textures![0];
            }
            emitter.updateConfig(config);
            renderLayers();
            updateTextureSelector();
          }
        });

        layerDiv.appendChild(textureNameSpan);
        layerDiv.appendChild(removeBtn);
        layersContainer.appendChild(layerDiv);

        textureLayers.push({ texture: textureName, element: layerDiv, weightInput });
      });
    };

    // Add change handler for texture selector
    textureSelect.addEventListener('change', () => {
      const selectedTexture = textureSelect.value;
      if (selectedTexture && !config.textures?.includes(selectedTexture)) {
        if (!config.textures) {
          config.textures = [];
        }
        config.textures.push(selectedTexture);
        
        // Initialize weight if not set
        if (!config.textureWeights) {
          config.textureWeights = {};
        }
        if (!config.textureWeights[selectedTexture]) {
          config.textureWeights[selectedTexture] = 1.0;
        }

        config.texture = config.textures[0];
        emitter.updateConfig(config);
        
        // Rebuild selector and layers
        renderLayers();
        updateTextureSelector();
      }
      
      // Reset selector
      textureSelect.value = '';
    });

    // Add selector above layers
    selectorWrapper.appendChild(textureSelect);
    content.appendChild(selectorWrapper);

    // Layers container
    const layersContainer = document.createElement('div');
    layersContainer.style.cssText = 'margin-bottom: 12px;';
    content.appendChild(layersContainer);

    // Initial setup
    updateTextureSelector();
    renderLayers();
    
    // Store references for updates
    (uiElements as any).textureLayers = textureLayers;
    (uiElements as any).textureSelect = textureSelect;
    (uiElements as any).renderTextureLayers = renderLayers;
    (uiElements as any).updateTextureSelector = updateTextureSelector;

    // Add spacing before blend mode
    const blendModeSpacer = document.createElement('div');
    blendModeSpacer.style.cssText = 'margin-top: 20px;';
    content.appendChild(blendModeSpacer);

    uiElements.blendMode = addDropdown(content, 'Blend Mode', config.blendMode,
      ['NORMAL', 'ADD', 'MULTIPLY', 'SCREEN'],
      (value) => {
        config.blendMode = value;
        emitter.updateConfig(config);
        }
    );

    uiElements.scale = addSlider(content, 'Scale', config.scale, 0.001, 5, 0.001, (value) => {
      config.scale = value;
      emitter.updateConfig(config);
    });
    sliderSteps.scale = 0.001;

    uiElements.scaleEnd = addSlider(content, 'Scale End', config.scaleEnd, 0.001, 5, 0.001, (value) => {
      config.scaleEnd = value;
      emitter.updateConfig(config);
    });
    sliderSteps.scaleEnd = 0.001;

    uiElements.rotation = addSlider(content, 'Rotation Speed', config.rotation, -10, 10, 0.1, (value) => {
      config.rotation = value;
      emitter.updateConfig(config);
    });
    sliderSteps.rotation = 0.1;

    uiElements.opacity = addSlider(content, 'Opacity', config.opacity, 0, 1, 0.01, (value) => {
      config.opacity = value;
      emitter.updateConfig(config);
    });
    sliderSteps.opacity = 0.01;

    uiElements.opacityEnd = addSlider(content, 'Opacity End', config.opacityEnd, 0, 1, 0.01, (value) => {
      config.opacityEnd = value;
      emitter.updateConfig(config);
    });
    sliderSteps.opacityEnd = 0.01;
  }, panelStates);

  // Color Gradient section
  let colorGradientContainer: HTMLElement | null = null;
  addSection(controlPanel, 'Color Gradient', false, (content) => {
    colorGradientContainer = content;
    createColorGradientEditor(content, config, emitter);
    // Store color gradient container reference for updates
    (uiElements as any).colorGradientContainer = colorGradientContainer;
  }, panelStates);

  // Export/Import section
  addSection(controlPanel, 'Export/Import', false, (content) => {
    createExportImportControls(content, config, emitter);
  }, panelStates);

  document.getElementById('canvas-container')?.appendChild(controlPanel);
}

function createColorGradientEditor(container: HTMLElement, config: EmitterConfig, emitter: any): void {
  const renderColorStops = () => {
    container.innerHTML = '';

    config.colorStops.forEach((stop, index) => {
      const stopDiv = document.createElement('div');
      stopDiv.style.cssText = 'margin-bottom: 10px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;';

      const header = document.createElement('div');
      header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;';

      const label = document.createElement('span');
      label.textContent = `Stop ${index + 1} (${stop.position}%)`;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '✕';
      removeBtn.style.cssText = 'background: #e74c3c; color: white; border: none; border-radius: 3px; padding: 2px 8px; cursor: pointer; font-size: 12px;';
      removeBtn.addEventListener('click', () => {
        if (config.colorStops.length > 1) {
          config.colorStops.splice(index, 1);
          emitter.updateConfig(config);
              renderColorStops();
        } else {
          alert('Must have at least one color stop!');
        }
      });

      header.appendChild(label);
      header.appendChild(removeBtn);

      const controls = document.createElement('div');
      controls.style.cssText = 'display: flex; gap: 10px; align-items: center;';

      // Position slider
      const posDiv = document.createElement('div');
      posDiv.style.cssText = 'flex: 1;';
      const posLabel = document.createElement('div');
      posLabel.textContent = 'Position:';
      posLabel.style.cssText = 'font-size: 11px; margin-bottom: 2px;';
      const posSlider = document.createElement('input');
      posSlider.type = 'range';
      posSlider.min = '0';
      posSlider.max = '100';
      posSlider.value = stop.position.toString();
      posSlider.style.cssText = 'width: 100%;';
      posSlider.addEventListener('input', () => {
        stop.position = parseInt(posSlider.value);
        emitter.updateConfig(config);
          label.textContent = `Stop ${index + 1} (${stop.position}%)`;
      });
      posDiv.appendChild(posLabel);
      posDiv.appendChild(posSlider);

      // Color picker
      const colorDiv = document.createElement('div');
      colorDiv.style.cssText = 'display: flex; flex-direction: column; align-items: center;';
      const colorLabel = document.createElement('div');
      colorLabel.textContent = 'Color:';
      colorLabel.style.cssText = 'font-size: 11px; margin-bottom: 2px;';
      const colorPicker = document.createElement('input');
      colorPicker.type = 'color';
      colorPicker.value = stop.color;
      colorPicker.style.cssText = 'width: 50px; height: 30px; cursor: pointer; border: none; border-radius: 3px;';
      colorPicker.addEventListener('input', () => {
        stop.color = colorPicker.value;
        emitter.updateConfig(config);
        });
      colorDiv.appendChild(colorLabel);
      colorDiv.appendChild(colorPicker);

      controls.appendChild(posDiv);
      controls.appendChild(colorDiv);

      stopDiv.appendChild(header);
      stopDiv.appendChild(controls);
      container.appendChild(stopDiv);
    });

    // Add color stop button
    const addBtn = document.createElement('button');
    addBtn.textContent = '+ Add Color Stop';
    addBtn.style.cssText = `
      width: 100%;
      padding: 8px;
      margin-top: 10px;
      background: #27ae60;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 12px;
    `;
    addBtn.addEventListener('click', () => {
      if (config.colorStops.length < 8) {
        const newPosition = config.colorStops.length > 0
          ? Math.round((config.colorStops[config.colorStops.length - 1].position + 100) / 2)
          : 50;
        config.colorStops.push({ position: newPosition, color: '#ffffff' });
        config.colorStops.sort((a, b) => a.position - b.position);
        emitter.updateConfig(config);
          renderColorStops();
      } else {
        alert('Maximum 8 color stops reached!');
      }
    });
    container.appendChild(addBtn);
  };

  renderColorStops();
}

function createExportImportControls(container: HTMLElement, config: EmitterConfig, emitter: any) {
  const buttonStyle = `
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 13px;
  `;

  const exportBtn = document.createElement('button');
  exportBtn.textContent = 'Export Config';
  exportBtn.style.cssText = buttonStyle;

  const importBtn = document.createElement('button');
  importBtn.textContent = 'Import Config';
  importBtn.style.cssText = buttonStyle;
  importBtn.style.marginBottom = '0';

  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset to Default';
  resetBtn.style.cssText = `
    width: 100%;
    padding: 10px;
    margin-top: 10px;
    background: #e67e22;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 13px;
  `;

  // Function to restore original buttons
  const restoreButtons = () => {
    container.innerHTML = '';
    container.appendChild(exportBtn);
    container.appendChild(importBtn);
    container.appendChild(resetBtn);
  };

  exportBtn.addEventListener('click', () => {
    const json = JSON.stringify(config, null, 2);
    const textarea = document.createElement('textarea');
    textarea.value = json;
    textarea.style.cssText = 'width: 100%; height: 150px; margin: 10px 0; padding: 8px; font-family: monospace; font-size: 11px;';

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy to Clipboard';
    copyBtn.style.cssText = buttonStyle;
    copyBtn.addEventListener('click', () => {
      textarea.select();
      document.execCommand('copy');
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy to Clipboard', 2000);
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = `
      width: 100%;
      padding: 10px;
      margin-top: 10px;
      background: #7f8c8d;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 13px;
    `;
    closeBtn.addEventListener('click', restoreButtons);

    container.innerHTML = '';
    container.appendChild(textarea);
    container.appendChild(copyBtn);
    container.appendChild(closeBtn);
  });

  importBtn.addEventListener('click', () => {
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Paste JSON config here...';
    textarea.style.cssText = 'width: 100%; height: 150px; margin: 10px 0; padding: 8px; font-family: monospace; font-size: 11px;';

    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply Config';
    applyBtn.style.cssText = buttonStyle;
    applyBtn.addEventListener('click', () => {
      try {
        const imported = JSON.parse(textarea.value);
        Object.assign(config, imported);
        emitter.updateConfig(config);
          alert('Config imported successfully!');
        location.reload();
      } catch (e) {
        alert('Invalid JSON: ' + (e as Error).message);
      }
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = `
      width: 100%;
      padding: 10px;
      margin-top: 10px;
      background: #7f8c8d;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 13px;
    `;
    closeBtn.addEventListener('click', restoreButtons);

    container.innerHTML = '';
    container.appendChild(textarea);
    container.appendChild(applyBtn);
    container.appendChild(closeBtn);
  });

  resetBtn.addEventListener('click', () => {
    if (confirm('Reset all settings to default? This will clear your current configuration.')) {
      location.reload();
    }
  });

  container.appendChild(exportBtn);
  container.appendChild(importBtn);
  container.appendChild(resetBtn);
}

function addSection(
  container: HTMLElement,
  title: string,
  defaultOpen: boolean,
  contentBuilder: (content: HTMLElement) => void,
  panelStates?: Record<string, boolean>
): void {
  // Check if we have a saved state for this panel, otherwise use default
  const isOpen = panelStates && panelStates.hasOwnProperty(title) 
    ? panelStates[title] 
    : defaultOpen;

  const section = document.createElement('div');
  section.style.cssText = 'margin-bottom: 15px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; overflow: hidden;';

  const header = document.createElement('div');
  header.style.cssText = `
    padding: 12px;
    background: rgba(74, 144, 226, 0.2);
    cursor: pointer;
    user-select: none;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  header.textContent = title;

  const icon = document.createElement('span');
  icon.textContent = isOpen ? '▼' : '▶';
  icon.style.cssText = 'font-size: 10px;';
  header.appendChild(icon);

  const content = document.createElement('div');
  content.style.cssText = `
    padding: 12px;
    background: rgba(0, 0, 0, 0.3);
    display: ${isOpen ? 'block' : 'none'};
  `;

  header.addEventListener('click', () => {
    const wasOpen = content.style.display === 'block';
    const nowOpen = !wasOpen;
    content.style.display = nowOpen ? 'block' : 'none';
    icon.textContent = nowOpen ? '▼' : '▶';
    
    // Save panel state to localStorage
    if (panelStates) {
      panelStates[title] = nowOpen;
      savePanelStates(panelStates);
    }
  });

  contentBuilder(content);

  section.appendChild(header);
  section.appendChild(content);
  container.appendChild(section);
}

function addSlider(
  container: HTMLElement,
  label: string,
  initialValue: number,
  min: number,
  max: number,
  step: number,
  onChange: (value: number) => void
): { slider: HTMLInputElement; valueSpan: HTMLSpanElement } {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'margin-bottom: 12px;';

  const labelDiv = document.createElement('div');
  labelDiv.style.cssText = 'margin-bottom: 6px; display: flex; justify-content: space-between;';

  const labelText = document.createElement('span');
  labelText.textContent = label;

  const valueSpan = document.createElement('span');
  valueSpan.contentEditable = 'true';
  valueSpan.style.cssText = 'color: #4a90e2; font-weight: bold; cursor: text; padding: 2px 4px; border-radius: 3px; min-width: 40px; display: inline-block; text-align: right;';
  valueSpan.textContent = initialValue.toFixed(step < 1 ? 2 : 0);
  
  // Store slider key for dynamic min/max tracking
  const sliderKey = label.toLowerCase().replace(/\s+/g, '');
  
  // Initialize dynamic min/max values
  if (!sliderMins[sliderKey]) {
    sliderMins[sliderKey] = min;
  }
  if (!sliderMaxs[sliderKey]) {
    sliderMaxs[sliderKey] = max;
  }
  
  // Get current dynamic min/max
  let currentMin = sliderMins[sliderKey];
  let currentMax = sliderMaxs[sliderKey];
  
  // Adjust min/max based on initial value
  if (initialValue < currentMin) {
    currentMin = initialValue;
    sliderMins[sliderKey] = currentMin;
  }
  if (initialValue > currentMax) {
    currentMax = initialValue;
    sliderMaxs[sliderKey] = currentMax;
  }
  
  // Add hover effect
  valueSpan.addEventListener('mouseenter', () => {
    valueSpan.style.backgroundColor = 'rgba(74, 144, 226, 0.2)';
  });
  valueSpan.addEventListener('mouseleave', () => {
    if (document.activeElement !== valueSpan) {
      valueSpan.style.backgroundColor = 'transparent';
    }
  });

  // Handle editing
  let isEditing = false;
  valueSpan.addEventListener('focus', () => {
    isEditing = true;
    valueSpan.style.backgroundColor = 'rgba(74, 144, 226, 0.3)';
    valueSpan.style.outline = '1px solid #4a90e2';
  });

  const updateSliderRange = (newMin: number, newMax: number) => {
    slider.min = newMin.toString();
    slider.max = newMax.toString();
    sliderMins[sliderKey] = newMin;
    sliderMaxs[sliderKey] = newMax;
  };

  const commitValue = () => {
    const text = valueSpan.textContent || '';
    const newValue = parseFloat(text);
    
    if (!isNaN(newValue)) {
      // Get current min/max from global state (may have been updated by presets)
      const currentMin = sliderMins[sliderKey] || min;
      const currentMax = sliderMaxs[sliderKey] || max;
      
      // Check if we need to expand min/max range
      let newMin = currentMin;
      let newMax = currentMax;
      let rangeChanged = false;
      
      if (newValue < currentMin) {
        newMin = newValue;
        rangeChanged = true;
      }
      if (newValue > currentMax) {
        newMax = newValue;
        rangeChanged = true;
      }
      
      if (rangeChanged) {
        updateSliderRange(newMin, newMax);
      }
      
      // Round to step precision
      const roundedValue = Math.round(newValue / step) * step;
      
      // Update slider and display
      slider.value = roundedValue.toString();
      valueSpan.textContent = roundedValue.toFixed(step < 1 ? 3 : 0);
      onChange(roundedValue);
    } else {
      // Restore original value if invalid
      valueSpan.textContent = parseFloat(slider.value).toFixed(step < 1 ? 3 : 0);
    }
    
    isEditing = false;
    valueSpan.style.backgroundColor = 'transparent';
    valueSpan.style.outline = 'none';
    valueSpan.blur();
  };

  valueSpan.addEventListener('blur', commitValue);
  valueSpan.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitValue();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      valueSpan.textContent = parseFloat(slider.value).toFixed(step < 1 ? 3 : 0);
      isEditing = false;
      valueSpan.style.backgroundColor = 'transparent';
      valueSpan.style.outline = 'none';
      valueSpan.blur();
    }
  });

  labelDiv.appendChild(labelText);
  labelDiv.appendChild(valueSpan);

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = currentMin.toString();
  slider.max = currentMax.toString();
  slider.step = step.toString();
  slider.value = initialValue.toString();
  slider.style.cssText = 'width: 100%; cursor: pointer;';

  slider.addEventListener('input', () => {
    const value = parseFloat(slider.value);
    if (!isEditing) {
      valueSpan.textContent = value.toFixed(step < 1 ? 3 : 0);
    }
    onChange(value);
  });

  wrapper.appendChild(labelDiv);
  wrapper.appendChild(slider);
  container.appendChild(wrapper);

  // Store slider element reference for dynamic range updates
  sliderElements[sliderKey] = { slider, valueSpan };

  return { slider, valueSpan };
}

function addDropdown(
  container: HTMLElement,
  label: string,
  initialValue: string,
  options: string[],
  onChange: (value: string) => void
): { select: HTMLSelectElement } {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'margin-bottom: 12px;';

  const labelDiv = document.createElement('div');
  labelDiv.style.cssText = 'margin-bottom: 6px;';
  labelDiv.textContent = label;

  const select = document.createElement('select');
  select.style.cssText = `
    width: 100%;
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    cursor: pointer;
  `;

  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    option.selected = opt === initialValue;
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    onChange(select.value);
  });

  wrapper.appendChild(labelDiv);
  wrapper.appendChild(select);
  container.appendChild(wrapper);

  return { select };
}

function addCheckbox(
  container: HTMLElement,
  label: string,
  initialValue: boolean,
  onChange: (checked: boolean) => void
): { checkbox: HTMLInputElement } {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'margin-bottom: 12px; display: flex; align-items: center;';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = initialValue;
  checkbox.style.cssText = 'margin-right: 8px; cursor: pointer;';

  const labelSpan = document.createElement('span');
  labelSpan.textContent = label;

  checkbox.addEventListener('change', () => {
    onChange(checkbox.checked);
  });

  wrapper.appendChild(checkbox);
  wrapper.appendChild(labelSpan);
  container.appendChild(wrapper);

  return { checkbox };
}

// Track burst interval for non-continuous effects
let burstIntervalId: number | null = null;
let repeatIntervalId: number | null = null;

// Store step values for sliders to format display correctly
const sliderSteps: Record<string, number> = {};
const sliderMins: Record<string, number> = {};
const sliderMaxs: Record<string, number> = {};
const sliderElements: Record<string, { slider: HTMLInputElement; valueSpan: HTMLSpanElement }> = {};

// Mapping from config property names to slider labels (for generating keys)
const configToSliderLabel: Record<string, string> = {
  emitterWidth: 'Width',
  emitterHeight: 'Height',
  rate: 'Emission Rate',
  burst: 'Burst Count',
  lifetime: 'Lifetime',
  lifetimeVariance: 'Lifetime Variance',
  speed: 'Speed',
  speedVariance: 'Speed Variance',
  angle: 'Angle (deg)',
  spread: 'Spread (deg)',
  gravity: 'Gravity',
  damping: 'Damping',
  scale: 'Scale',
  scaleEnd: 'Scale End',
  rotation: 'Rotation Speed',
  opacity: 'Opacity',
  opacityEnd: 'Opacity End'
};

function getSliderKey(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '');
}

function adjustSliderRange(sliderKey: string, value: number): void {
  if (!sliderMins[sliderKey] || !sliderMaxs[sliderKey]) {
    return; // Slider not initialized yet
  }
  
  let rangeChanged = false;
  let newMin = sliderMins[sliderKey];
  let newMax = sliderMaxs[sliderKey];
  
  if (value < sliderMins[sliderKey]) {
    newMin = value;
    rangeChanged = true;
  }
  if (value > sliderMaxs[sliderKey]) {
    newMax = value;
    rangeChanged = true;
  }
  
  if (rangeChanged) {
    sliderMins[sliderKey] = newMin;
    sliderMaxs[sliderKey] = newMax;
    
    // Update the slider element if it exists
    const element = sliderElements[sliderKey];
    if (element?.slider) {
      element.slider.min = newMin.toString();
      element.slider.max = newMax.toString();
    }
  }
}

function updateUIFromConfig(config: EmitterConfig, uiElements: Record<string, any>, emitter: any): void {
  // Update sliders - only update valueSpan if not currently being edited
  const updateSlider = (element: any, value: number, step: number, configKey?: string) => {
    if (element?.slider) {
      // Adjust range if needed
      if (configKey && configToSliderLabel[configKey]) {
        const sliderKey = getSliderKey(configToSliderLabel[configKey]);
        adjustSliderRange(sliderKey, value);
      }
      
      element.slider.value = value.toString();
      // Only update text if not being edited
      if (element.valueSpan && document.activeElement !== element.valueSpan) {
        element.valueSpan.textContent = value.toFixed(step < 1 ? 3 : 0);
      }
    }
  };

  updateSlider(uiElements.emitterWidth, config.emitterWidth, sliderSteps.emitterWidth || 10, 'emitterWidth');
  updateSlider(uiElements.emitterHeight, config.emitterHeight, sliderSteps.emitterHeight || 10, 'emitterHeight');
  updateSlider(uiElements.rate, config.rate, sliderSteps.rate || 5, 'rate');
  updateSlider(uiElements.burst, config.burst, sliderSteps.burst || 1, 'burst');
  updateSlider(uiElements.lifetime, config.lifetime, sliderSteps.lifetime || 0.1, 'lifetime');
  updateSlider(uiElements.lifetimeVariance, config.lifetimeVariance, sliderSteps.lifetimeVariance || 0.1, 'lifetimeVariance');
  updateSlider(uiElements.speed, config.speed, sliderSteps.speed || 10, 'speed');
  updateSlider(uiElements.speedVariance, config.speedVariance, sliderSteps.speedVariance || 5, 'speedVariance');
  updateSlider(uiElements.angle, config.angle, sliderSteps.angle || 1, 'angle');
  updateSlider(uiElements.spread, config.spread, sliderSteps.spread || 1, 'spread');
  updateSlider(uiElements.gravity, config.gravity, sliderSteps.gravity || 10, 'gravity');
  updateSlider(uiElements.damping, config.damping, sliderSteps.damping || 0.01, 'damping');
  updateSlider(uiElements.scale, config.scale, sliderSteps.scale || 0.001, 'scale');
  updateSlider(uiElements.scaleEnd, config.scaleEnd, sliderSteps.scaleEnd || 0.001, 'scaleEnd');
  updateSlider(uiElements.rotation, config.rotation, sliderSteps.rotation || 0.1, 'rotation');
  updateSlider(uiElements.opacity, config.opacity, sliderSteps.opacity || 0.01, 'opacity');
  updateSlider(uiElements.opacityEnd, config.opacityEnd, sliderSteps.opacityEnd || 0.01, 'opacityEnd');

  // Update checkboxes
  if (uiElements.continuous?.checkbox) {
    uiElements.continuous.checkbox.checked = config.continuous;
  }
  if (uiElements.repeat?.checkbox) {
    uiElements.repeat.checkbox.checked = config.repeat;
  }

  // Update dropdowns
  if (uiElements.emitterShape?.select) {
    uiElements.emitterShape.select.value = config.emitterShape;
  }
  if (uiElements.blendMode?.select) {
    uiElements.blendMode.select.value = config.blendMode;
  }

  // Update texture layers
  const renderTextureLayers = (uiElements as any).renderTextureLayers;
  const updateTextureSelector = (uiElements as any).updateTextureSelector;
  if (renderTextureLayers && updateTextureSelector) {
    // Ensure textures array is initialized
    if (!config.textures || config.textures.length === 0) {
      if (config.texture) {
        config.textures = [config.texture];
      }
    }

    // Initialize texture weights if not present
    if (!config.textureWeights) {
      config.textureWeights = {};
    }

    // Re-render layers and update selector
    renderTextureLayers();
    updateTextureSelector();
  }

  // Update color gradient editor (recreate it)
  if ((uiElements as any).colorGradientContainer) {
    createColorGradientEditor((uiElements as any).colorGradientContainer, config, emitter);
  }
}

function startRepeatBursts(emitter: any, config: EmitterConfig): void {
  // Clear any existing repeat interval
  if (repeatIntervalId !== null) {
    clearInterval(repeatIntervalId);
    repeatIntervalId = null;
  }

  // Trigger initial burst immediately
  emitter.burst(config.burst || 50);

  // Set up repeating bursts
  // Burst every (lifetime + variance + 0.5s) to allow previous burst to complete
  const burstInterval = (config.lifetime + config.lifetimeVariance + 0.5) * 1000;
  repeatIntervalId = window.setInterval(() => {
    emitter.burst(config.burst || 50);
  }, burstInterval);
}

export function applyPreset(
  app: Application,
  emitter: any,
  config: EmitterConfig,
  presetName: keyof typeof presets
): void {
  const preset = presets[presetName];
  Object.assign(config, preset);
  
  // Initialize textures array from single texture if preset doesn't have textures array
  if (!config.textures || config.textures.length === 0) {
    if (config.texture) {
      config.textures = [config.texture];
    }
  }
  
  // Adjust slider ranges based on preset values
  Object.keys(configToSliderLabel).forEach((configKey) => {
    const value = (config as any)[configKey];
    if (value !== undefined && typeof value === 'number') {
      const sliderKey = getSliderKey(configToSliderLabel[configKey]);
      adjustSliderRange(sliderKey, value);
    }
  });
  
  emitter.updateConfig(config);

  // Position emitter based on preset type
  if (presetName === 'rain' || presetName === 'snow') {
    // Position line emitters at the top of the viewport
    emitter.emitterX = app.screen.width / 2;
    emitter.emitterY = 50; // Near the top
    // Set emitter width to match viewport width
    config.emitterWidth = app.screen.width;
    emitter.updateConfig(config);
  } else {
    // Center other presets
    emitter.emitterX = app.screen.width / 2;
    emitter.emitterY = app.screen.height / 2;
  }

  // Clear any existing burst interval
  if (burstIntervalId !== null) {
    clearInterval(burstIntervalId);
    burstIntervalId = null;
  }

  if (config.continuous) {
    emitter.play();
    // Clear repeat interval when continuous is enabled
    if (repeatIntervalId !== null) {
      clearInterval(repeatIntervalId);
      repeatIntervalId = null;
    }
  } else {
    emitter.stop();

    // Trigger initial burst immediately
    emitter.burst(config.burst || 50);

    // Set up repeating bursts if repeat is enabled
    if (config.repeat) {
      startRepeatBursts(emitter, config);
    } else {
      // Clear any existing repeat interval
      if (repeatIntervalId !== null) {
        clearInterval(repeatIntervalId);
        repeatIntervalId = null;
      }
    }
  }
}

// localStorage functionality removed - will be added back later
