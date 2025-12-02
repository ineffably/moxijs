/**
 * Panels Showcase Tab
 * Demonstrates color and textured 9-slice panels with interactive form controls
 */
import * as PIXI from 'pixi.js';
import {
  EdgeInsets,
  FlexContainer,
  FlexDirection,
  FlexJustify,
  FlexAlign,
  UILabel,
  UITextInput,
  UISelect,
  UIPanel,
  UIComponent
} from '@moxijs/core';
import { ASSETS } from '../../assets-config';

interface PanelConfig {
  backgroundColor?: number;
  backgroundAlpha?: number;
  borderRadius?: number;
  textureName?: string;
  width?: number;
  height?: number;
}

export async function createPanelsShowcase(): Promise<UIComponent> {
  // Load the spritesheet with pixel-perfect settings
  await PIXI.Assets.load({
    alias: 'uipackSpace',
    src: ASSETS.UIPACK_SPACE_JSON,
    data: {
      scaleMode: PIXI.SCALE_MODES.NEAREST
    }
  });

  const sheet = PIXI.Assets.get('uipackSpace') as PIXI.Spritesheet;
  if (sheet?.textureSource) {
    sheet.textureSource.scaleMode = 'nearest';
  }

  // Panel configuration state
  const colorConfig: PanelConfig = {
    backgroundColor: 0x2c3e50,
    backgroundAlpha: 0.9,
    borderRadius: 8,
    width: 350,
    height: 250
  };

  const texturedConfig: PanelConfig = {
    textureName: 'glassPanel',
    backgroundAlpha: 1,
    width: 350,
    height: 250
  };

  // Available panel textures
  const panelTextures = [
    { name: 'glassPanel', label: 'Glass Panel' },
    { name: 'metalPanel', label: 'Metal Panel' },
    { name: 'metalPanel_blue', label: 'Blue Metal' },
    { name: 'metalPanel_green', label: 'Green Metal' },
    { name: 'metalPanel_red', label: 'Red Metal' },
    { name: 'metalPanel_yellow', label: 'Yellow Metal' }
  ];

  // Demo panel containers
  let colorDemoContainer: FlexContainer;
  let texturedDemoContainer: FlexContainer;

  // Function to create color demo panel
  const createColorDemoPanel = (config: PanelConfig): UIPanel => {
    const w = config.width ?? 350;
    const h = config.height ?? 250;
    const contentWidth = w - 40; // Account for padding

    const panel = new UIPanel({
      backgroundColor: config.backgroundColor ?? 0x2c3e50,
      backgroundAlpha: config.backgroundAlpha ?? 0.9,
      borderRadius: config.borderRadius ?? 8,
      width: w,
      height: h
    });

    // Add content inside panel
    const content = new FlexContainer({
      direction: FlexDirection.Column,
      gap: 10,
      padding: EdgeInsets.all(20)
    });

    const title = new UILabel({
      text: 'Color Panel',
      fontSize: 18,
      color: 0xffffff,
      fontWeight: 'bold'
    });
    content.addChild(title);

    const desc = new UILabel({
      text: 'Solid color background with optional rounded corners.',
      fontSize: 12,
      color: 0xcccccc,
      wordWrap: true,
      wordWrapWidth: contentWidth,
      lineHeight: 2.0
    });
    content.addChild(desc);

    // Layout content
    title.layout(contentWidth, 24);
    desc.layout(contentWidth, 40);
    content.layout(w, h);

    panel.container.addChild(content.container);
    panel.layout(w, h);

    return panel;
  };

  // Function to create textured demo panel
  const createTexturedDemoPanel = (config: PanelConfig): UIPanel => {
    const w = config.width ?? 350;
    const h = config.height ?? 250;
    const contentWidth = w - 40; // Account for padding

    const texture = sheet.textures[`${config.textureName ?? 'glassPanel'}.png`];
    
    let panel: UIPanel;
    if (texture) {
      panel = new UIPanel({
        texture,
        nineSlice: {
          leftWidth: 20,
          topHeight: 20,
          rightWidth: 20,
          bottomHeight: 20
        },
        width: w,
        height: h,
        backgroundAlpha: config.backgroundAlpha ?? 1
      });
    } else {
      // Fallback
      panel = new UIPanel({
        backgroundColor: 0x2c3e50,
        backgroundAlpha: 0.9,
        borderRadius: 8,
        width: w,
        height: h
      });
    }

    // Add content inside panel
    const content = new FlexContainer({
      direction: FlexDirection.Column,
      gap: 10,
      padding: EdgeInsets.all(20)
    });

    const title = new UILabel({
      text: 'Textured Panel',
      fontSize: 18,
      color: 0xffffff,
      fontWeight: 'bold'
    });
    content.addChild(title);

    const desc = new UILabel({
      text: '9-slice texture that scales without distorting corners or edges.',
      fontSize: 12,
      color: 0xcccccc,
      wordWrap: true,
      wordWrapWidth: contentWidth,
      lineHeight: 2.0
    });
    content.addChild(desc);

    // Layout content
    title.layout(contentWidth, 24);
    desc.layout(contentWidth, 40);
    content.layout(w, h);

    panel.container.addChild(content.container);
    panel.layout(w, h);

    return panel;
  };

  // Function to update color demo
  const updateColorDemo = () => {
    colorDemoContainer.container.removeChildren();
    colorDemoContainer.children = [];
    const panel = createColorDemoPanel(colorConfig);
    colorDemoContainer.addChild(panel);
    colorDemoContainer.layout(400, 300);
  };

  // Function to update textured demo
  const updateTexturedDemo = () => {
    texturedDemoContainer.container.removeChildren();
    texturedDemoContainer.children = [];
    const panel = createTexturedDemoPanel(texturedConfig);
    texturedDemoContainer.addChild(panel);
    texturedDemoContainer.layout(400, 300);
  };

  // Create main container
  const mainContainer = new FlexContainer({
    direction: FlexDirection.Row,
    justify: FlexJustify.Start,
    align: FlexAlign.Start,
    gap: 60,
    padding: EdgeInsets.all(30)
  });

  // === LEFT COLUMN: Color Panels ===
  const colorColumn = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 20
  });

  const colorTitle = new UILabel({
    text: 'Color Panels',
    fontSize: 24,
    color: 0xffffff,
    fontWeight: 'bold'
  });
  colorColumn.addChild(colorTitle);

  // Color demo panel container
  colorDemoContainer = new FlexContainer({
    direction: FlexDirection.Column
  });
  colorColumn.addChild(colorDemoContainer);

  // Color settings form
  const colorForm = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 15,
    padding: EdgeInsets.all(20)
  });

  // Background color input
  const colorLabel = new UILabel({ text: 'Background Color:', fontSize: 14, color: 0xffffff });
  colorForm.addChild(colorLabel);
  
  const colorInput = new UITextInput({
    value: '#2c3e50',
    width: 150,
    placeholder: '#2c3e50',
    onChange: (value) => {
      const hex = value.replace('#', '');
      const color = parseInt(hex, 16);
      if (!isNaN(color)) {
        colorConfig.backgroundColor = color;
        updateColorDemo();
      }
    }
  });
  colorForm.addChild(colorInput);

  // Alpha input
  const alphaLabel = new UILabel({ text: 'Alpha (0-100):', fontSize: 14, color: 0xffffff });
  colorForm.addChild(alphaLabel);
  
  const alphaInput = new UITextInput({
    value: '90',
    width: 100,
    type: 'number',
    onChange: (value) => {
      const alpha = parseFloat(value) / 100;
      if (!isNaN(alpha) && alpha >= 0 && alpha <= 1) {
        colorConfig.backgroundAlpha = alpha;
        updateColorDemo();
      }
    }
  });
  colorForm.addChild(alphaInput);

  // Border radius input
  const radiusLabel = new UILabel({ text: 'Border Radius:', fontSize: 14, color: 0xffffff });
  colorForm.addChild(radiusLabel);
  
  const radiusInput = new UITextInput({
    value: '8',
    width: 100,
    type: 'number',
    onChange: (value) => {
      const radius = parseInt(value, 10);
      if (!isNaN(radius) && radius >= 0) {
        colorConfig.borderRadius = radius;
        updateColorDemo();
      }
    }
  });
  colorForm.addChild(radiusInput);

  // Width input
  const widthLabel = new UILabel({ text: 'Width:', fontSize: 14, color: 0xffffff });
  colorForm.addChild(widthLabel);
  
  const widthInput = new UITextInput({
    value: '350',
    width: 100,
    type: 'number',
    onChange: (value) => {
      const w = parseInt(value, 10);
      if (!isNaN(w) && w > 0) {
        colorConfig.width = w;
        updateColorDemo();
      }
    }
  });
  colorForm.addChild(widthInput);

  // Height input
  const heightLabel = new UILabel({ text: 'Height:', fontSize: 14, color: 0xffffff });
  colorForm.addChild(heightLabel);
  
  const heightInput = new UITextInput({
    value: '250',
    width: 100,
    type: 'number',
    onChange: (value) => {
      const h = parseInt(value, 10);
      if (!isNaN(h) && h > 0) {
        colorConfig.height = h;
        updateColorDemo();
      }
    }
  });
  colorForm.addChild(heightInput);

  colorColumn.addChild(colorForm);

  // Layout color form elements
  colorLabel.layout(200, 20);
  colorInput.layout(150, 30);
  alphaLabel.layout(200, 20);
  alphaInput.layout(100, 30);
  radiusLabel.layout(200, 20);
  radiusInput.layout(100, 30);
  widthLabel.layout(200, 20);
  widthInput.layout(100, 30);
  heightLabel.layout(200, 20);
  heightInput.layout(100, 30);
  colorForm.layout(300, 400);

  mainContainer.addChild(colorColumn);

  // === RIGHT COLUMN: Textured Panels ===
  const texturedColumn = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 20
  });

  const texturedTitle = new UILabel({
    text: 'Textured Panels',
    fontSize: 24,
    color: 0xffffff,
    fontWeight: 'bold'
  });
  texturedColumn.addChild(texturedTitle);

  // Textured demo panel container
  texturedDemoContainer = new FlexContainer({
    direction: FlexDirection.Column
  });
  texturedColumn.addChild(texturedDemoContainer);

  // Textured settings form
  const texturedForm = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 15,
    padding: EdgeInsets.all(20)
  });

  // Texture select
  const textureLabel = new UILabel({ text: 'Panel Texture:', fontSize: 14, color: 0xffffff });
  texturedForm.addChild(textureLabel);
  
  const textureSelect = new UISelect({
    options: panelTextures.map(t => ({ label: t.label, value: t.name })),
    value: 'glassPanel',
    width: 200,
    onChange: (value) => {
      texturedConfig.textureName = value as string;
      updateTexturedDemo();
    }
  });
  texturedForm.addChild(textureSelect);

  // Alpha input
  const texAlphaLabel = new UILabel({ text: 'Alpha (0-100):', fontSize: 14, color: 0xffffff });
  texturedForm.addChild(texAlphaLabel);
  
  const texAlphaInput = new UITextInput({
    value: '100',
    width: 100,
    type: 'number',
    onChange: (value) => {
      const alpha = parseFloat(value) / 100;
      if (!isNaN(alpha) && alpha >= 0 && alpha <= 1) {
        texturedConfig.backgroundAlpha = alpha;
        updateTexturedDemo();
      }
    }
  });
  texturedForm.addChild(texAlphaInput);

  // Width input
  const texWidthLabel = new UILabel({ text: 'Width:', fontSize: 14, color: 0xffffff });
  texturedForm.addChild(texWidthLabel);
  
  const texWidthInput = new UITextInput({
    value: '350',
    width: 100,
    type: 'number',
    onChange: (value) => {
      const w = parseInt(value, 10);
      if (!isNaN(w) && w > 0) {
        texturedConfig.width = w;
        updateTexturedDemo();
      }
    }
  });
  texturedForm.addChild(texWidthInput);

  // Height input
  const texHeightLabel = new UILabel({ text: 'Height:', fontSize: 14, color: 0xffffff });
  texturedForm.addChild(texHeightLabel);
  
  const texHeightInput = new UITextInput({
    value: '250',
    width: 100,
    type: 'number',
    onChange: (value) => {
      const h = parseInt(value, 10);
      if (!isNaN(h) && h > 0) {
        texturedConfig.height = h;
        updateTexturedDemo();
      }
    }
  });
  texturedForm.addChild(texHeightInput);

  texturedColumn.addChild(texturedForm);

  // Layout textured form elements
  textureLabel.layout(200, 20);
  textureSelect.layout(200, 30);
  texAlphaLabel.layout(200, 20);
  texAlphaInput.layout(100, 30);
  texWidthLabel.layout(200, 20);
  texWidthInput.layout(100, 30);
  texHeightLabel.layout(200, 20);
  texHeightInput.layout(100, 30);
  texturedForm.layout(300, 350);

  mainContainer.addChild(texturedColumn);

  // Layout columns
  colorTitle.layout(400, 30);
  texturedTitle.layout(400, 30);
  colorColumn.layout(450, 800);
  texturedColumn.layout(450, 800);
  mainContainer.layout(1200, 900);

  // Create initial demo panels
  updateColorDemo();
  updateTexturedDemo();

  return mainContainer;
}
