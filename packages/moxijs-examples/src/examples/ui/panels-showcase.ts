/**
 * Panels Showcase Tab
 * Demonstrates color panels, textured 9-slice panels, and the new CardPanel component
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
  UIBox,
  UIComponent,
  UICheckbox,
  CardPanel,
  FlatCardStyle,
  CardStyle
} from '@moxijs/ui';
import { ASSETS } from '../../assets-config';
import { PixelCardStyle, createPixelCardColors } from '@moxijs/pikcell/src/styles/pixel-card-style';

// Layout constants for consistent styling
const FORM_STYLES = {
  labelFontSize: 16,
  titleFontSize: 24,
  inputWidth: 180,
  inputHeight: 30,
  checkboxSize: 18,
  labelColor: 0xffffff,
  gap: 12,
  columnGap: 60,
  padding: 30
} as const;

interface PanelConfig {
  backgroundColor?: number;
  backgroundAlpha?: number;
  borderRadius?: number;
  textureName?: string;
  width?: number;
  height?: number;
}

interface CardPanelConfig {
  title: string;
  hasTitle: boolean;
  draggable: boolean;
  hasFooter: boolean;
  styleType: 'flat' | 'pixel';
  bodyWidth: number;
  bodyHeight: number;
  borderRadius: number;
}

import { UIFontConfig } from '@moxijs/ui';

export async function createPanelsShowcase(fontConfig?: UIFontConfig): Promise<UIComponent> {
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

  // CardPanel configuration state (16:9 ratio, scaled to match other panels)
  const cardPanelConfig: CardPanelConfig = {
    title: 'Card Title',
    hasTitle: true,
    draggable: true,
    hasFooter: true,
    styleType: 'flat',
    bodyWidth: 320,
    bodyHeight: 180,
    borderRadius: 0
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
  let cardDemoContainer: PIXI.Container;
  let currentCardPanel: CardPanel | null = null;

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
      fontWeight: 'bold',
      msdfFontFamily: fontConfig?.msdfFontFamily
    });
    content.addChild(title);

    const desc = new UILabel({
      text: 'Solid color background with optional rounded corners.',
      fontSize: 12,
      color: 0xcccccc,
      wordWrap: true,
      wordWrapWidth: contentWidth,
      lineHeight: 2.0
      // No MSDF for word-wrapped text
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
      fontWeight: 'bold',
      msdfFontFamily: fontConfig?.msdfFontFamily
    });
    content.addChild(title);

    const desc = new UILabel({
      text: '9-slice texture that scales without distorting corners or edges.',
      fontSize: 12,
      color: 0xcccccc,
      wordWrap: true,
      wordWrapWidth: contentWidth,
      lineHeight: 2.0
      // No MSDF for word-wrapped text
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

  // Function to create CardPanel demo
  const createCardDemoPanel = (config: CardPanelConfig): CardPanel => {
    // Choose style based on config
    let style: CardStyle;
    let colors;

    if (config.styleType === 'pixel') {
      style = new PixelCardStyle();
      colors = createPixelCardColors();
    } else {
      style = new FlatCardStyle({
        borderRadius: config.borderRadius,
        showShadow: true,
        titleBarHeight: 28,
        footerHeight: 28,
        contentPadding: 0
      });
      colors = {
        background: 0x2a2a2a,
        border: 0x404040,
        titleBar: 0x333333,
        titleText: 0xffffff
      };
    }

    const panel = new CardPanel({
      style,
      colors,
      title: config.hasTitle ? { text: config.title, fontFamily: 'PixelOperator8', fontSize: 18 } : undefined,
      bodyWidth: config.bodyWidth,
      bodyHeight: config.bodyHeight,
      draggable: config.draggable,
      footer: config.hasFooter ? { height: 28 } : undefined
    });

    // Add some content to the body (no margin - fills entire body area)
    const bodyContent = new PIXI.Graphics();
    bodyContent.rect(0, 0, config.bodyWidth, config.bodyHeight);
    bodyContent.fill({ color: 0x3a3a3a, alpha: 0.5 });

    const contentLabel = new UILabel({
      text: 'Body Content',
      fontSize: 18,
      color: 0x888888,
      msdfFontFamily: fontConfig?.msdfFontFamily
    });
    contentLabel.layout(config.bodyWidth, 20);
    contentLabel.container.position.set(
      (config.bodyWidth - contentLabel.container.width) / 2,
      (config.bodyHeight - contentLabel.container.height) / 2
    );

    panel.getBodyContainer().addChild(bodyContent);
    panel.getBodyContainer().addChild(contentLabel.container);

    // Add footer content if present
    if (config.hasFooter) {
      const footerLabel = new UILabel({
        text: 'Footer',
        fontSize: 12,
        color: 0x666666,
        msdfFontFamily: fontConfig?.msdfFontFamily
      });
      footerLabel.layout(100, 20);
      footerLabel.container.position.set(8, 4);
      panel.getFooterContainer().addChild(footerLabel.container);
    }

    return panel;
  };

  // Function to update CardPanel demo
  const updateCardDemo = () => {
    try {
      // Remove existing card safely
      if (currentCardPanel) {
        if (currentCardPanel.container.parent) {
          currentCardPanel.container.parent.removeChild(currentCardPanel.container);
        }
        currentCardPanel.destroy();
        currentCardPanel = null;
      }

      // Create new card
      currentCardPanel = createCardDemoPanel(cardPanelConfig);
      currentCardPanel.container.position.set(0, 0);
      cardDemoContainer.addChild(currentCardPanel.container);
    } catch (err) {
      console.error('Error updating CardPanel demo:', err);
    }
  };

  // Create main container
  const mainContainer = new FlexContainer({
    direction: FlexDirection.Row,
    justify: FlexJustify.Start,
    align: FlexAlign.Start,
    gap: FORM_STYLES.columnGap,
    padding: EdgeInsets.all(FORM_STYLES.padding)
  });

  // === LEFT COLUMN: Color Panels ===
  const colorColumn = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 20
  });

  const colorTitle = new UILabel({
    text: 'Color Panels',
    fontSize: FORM_STYLES.titleFontSize,
    color: FORM_STYLES.labelColor,
    fontWeight: 'bold',
    msdfFontFamily: fontConfig?.msdfFontFamily
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
  const colorLabel = new UILabel({ text: 'Background Color:', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
  colorForm.addChild(colorLabel);
  
  const colorInput = new UITextInput({
    defaultValue: '#2c3e50',
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
  const alphaLabel = new UILabel({ text: 'Alpha (0-100):', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
  colorForm.addChild(alphaLabel);
  
  const alphaInput = new UITextInput({
    defaultValue: '90',
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
  const radiusLabel = new UILabel({ text: 'Border Radius:', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
  colorForm.addChild(radiusLabel);
  
  const radiusInput = new UITextInput({
    defaultValue: '8',
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
  const widthLabel = new UILabel({ text: 'Width:', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
  colorForm.addChild(widthLabel);
  
  const widthInput = new UITextInput({
    defaultValue: '350',
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
  const heightLabel = new UILabel({ text: 'Height:', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
  colorForm.addChild(heightLabel);
  
  const heightInput = new UITextInput({
    defaultValue: '250',
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
    fontSize: FORM_STYLES.titleFontSize,
    color: FORM_STYLES.labelColor,
    fontWeight: 'bold',
    msdfFontFamily: fontConfig?.msdfFontFamily
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
  const textureLabel = new UILabel({ text: 'Panel Texture:', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
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
  const texAlphaLabel = new UILabel({ text: 'Alpha (0-100):', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
  texturedForm.addChild(texAlphaLabel);
  
  const texAlphaInput = new UITextInput({
    defaultValue: '100',
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
  const texWidthLabel = new UILabel({ text: 'Width:', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
  texturedForm.addChild(texWidthLabel);
  
  const texWidthInput = new UITextInput({
    defaultValue: '350',
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
  const texHeightLabel = new UILabel({ text: 'Height:', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
  texturedForm.addChild(texHeightLabel);
  
  const texHeightInput = new UITextInput({
    defaultValue: '250',
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

  // === THIRD COLUMN: CardPanel ===
  const cardColumn = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 20
  });

  const cardTitle = new UILabel({
    text: 'CardPanel',
    fontSize: FORM_STYLES.titleFontSize,
    color: FORM_STYLES.labelColor,
    fontWeight: 'bold',
    msdfFontFamily: fontConfig?.msdfFontFamily
  });
  cardColumn.addChild(cardTitle);

  // CardPanel demo - use UIBox as a spacer to reserve space for the card
  // Card size: body (320x180) + title (28) + footer (28) + borders (2) + shadow (4) = ~330x246
  const cardDemoSpacer = new UIBox({
    width: 330,
    height: 246
  });
  cardDemoSpacer.layout(330, 246);
  cardDemoContainer = new PIXI.Container();
  cardDemoSpacer.container.addChild(cardDemoContainer);
  cardColumn.addChild(cardDemoSpacer);

  // CardPanel settings form
  const cardForm = new FlexContainer({
    direction: FlexDirection.Column,
    gap: FORM_STYLES.gap,
    padding: EdgeInsets.all(15)
  });

  // Style select
  const styleLabel = new UILabel({ text: 'Style:', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
  cardForm.addChild(styleLabel);

  const styleSelect = new UISelect({
    options: [
      { label: 'Flat', value: 'flat' },
      { label: 'Pixel', value: 'pixel' }
    ],
    value: 'flat',
    width: 180,
    onChange: (value) => {
      cardPanelConfig.styleType = value as 'flat' | 'pixel';
      updateCardDemo();
    }
  });
  cardForm.addChild(styleSelect);

  // Border radius (flat style only)
  const borderRadiusLabel = new UILabel({ text: 'Border Radius:', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
  cardForm.addChild(borderRadiusLabel);

  const borderRadiusInput = new UITextInput({
    defaultValue: '0',
    width: 100,
    type: 'number',
    onChange: (value) => {
      const r = parseInt(value, 10);
      if (!isNaN(r) && r >= 0) {
        cardPanelConfig.borderRadius = r;
        updateCardDemo();
      }
    }
  });
  cardForm.addChild(borderRadiusInput);

  // Title text input
  const titleLabel = new UILabel({ text: 'Title Text:', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
  cardForm.addChild(titleLabel);

  const titleInput = new UITextInput({
    defaultValue: 'Card Title',
    width: 180,
    placeholder: 'Card Title',
    onChange: (value) => {
      cardPanelConfig.title = value;
      if (cardPanelConfig.hasTitle) {
        updateCardDemo();
      }
    }
  });
  cardForm.addChild(titleInput);

  // Has title checkbox
  const hasTitleRow = new FlexContainer({
    direction: FlexDirection.Row,
    align: FlexAlign.Center,
    gap: 10
  });
  const hasTitleCheckbox = new UICheckbox({
    defaultChecked: true,
    size: FORM_STYLES.checkboxSize,
    onChange: (checked) => {
      cardPanelConfig.hasTitle = checked;
      updateCardDemo();
    }
  });
  const hasTitleLabel = new UILabel({ text: 'Has Title', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
  hasTitleRow.addChild(hasTitleCheckbox);
  hasTitleRow.addChild(hasTitleLabel);
  cardForm.addChild(hasTitleRow);

  // Draggable checkbox
  const draggableRow = new FlexContainer({
    direction: FlexDirection.Row,
    align: FlexAlign.Center,
    gap: 10
  });
  const draggableCheckbox = new UICheckbox({
    defaultChecked: true,
    size: FORM_STYLES.checkboxSize,
    onChange: (checked) => {
      cardPanelConfig.draggable = checked;
      updateCardDemo();
    }
  });
  const draggableLabel = new UILabel({ text: 'Draggable', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
  draggableRow.addChild(draggableCheckbox);
  draggableRow.addChild(draggableLabel);
  cardForm.addChild(draggableRow);

  // Has footer checkbox
  const hasFooterRow = new FlexContainer({
    direction: FlexDirection.Row,
    align: FlexAlign.Center,
    gap: 10
  });
  const hasFooterCheckbox = new UICheckbox({
    defaultChecked: true,
    size: FORM_STYLES.checkboxSize,
    onChange: (checked) => {
      cardPanelConfig.hasFooter = checked;
      updateCardDemo();
    }
  });
  const hasFooterLabel = new UILabel({ text: 'Has Footer', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
  hasFooterRow.addChild(hasFooterCheckbox);
  hasFooterRow.addChild(hasFooterLabel);
  cardForm.addChild(hasFooterRow);

  // Body width input
  const bodyWidthLabel = new UILabel({ text: 'Body Width:', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
  cardForm.addChild(bodyWidthLabel);

  const bodyWidthInput = new UITextInput({
    defaultValue: '320',
    width: 100,
    type: 'number',
    onChange: (value) => {
      const w = parseInt(value, 10);
      if (!isNaN(w) && w > 50) {
        cardPanelConfig.bodyWidth = w;
        updateCardDemo();
      }
    }
  });
  cardForm.addChild(bodyWidthInput);

  // Body height input
  const bodyHeightLabel = new UILabel({ text: 'Body Height:', fontSize: FORM_STYLES.labelFontSize, color: FORM_STYLES.labelColor, msdfFontFamily: fontConfig?.msdfFontFamily });
  cardForm.addChild(bodyHeightLabel);

  const bodyHeightInput = new UITextInput({
    defaultValue: '180',
    width: 100,
    type: 'number',
    onChange: (value) => {
      const h = parseInt(value, 10);
      if (!isNaN(h) && h > 50) {
        cardPanelConfig.bodyHeight = h;
        updateCardDemo();
      }
    }
  });
  cardForm.addChild(bodyHeightInput);

  cardColumn.addChild(cardForm);

  // Layout card form elements
  styleLabel.layout(180, 20);
  styleSelect.layout(180, 30);
  borderRadiusLabel.layout(180, 20);
  borderRadiusInput.layout(100, 30);
  titleLabel.layout(180, 20);
  titleInput.layout(180, 30);
  hasTitleCheckbox.layout(18, 18);
  hasTitleLabel.layout(100, 20);
  hasTitleRow.layout(200, 24);
  draggableCheckbox.layout(18, 18);
  draggableLabel.layout(100, 20);
  draggableRow.layout(200, 24);
  hasFooterCheckbox.layout(18, 18);
  hasFooterLabel.layout(100, 20);
  hasFooterRow.layout(200, 24);
  bodyWidthLabel.layout(180, 20);
  bodyWidthInput.layout(100, 30);
  bodyHeightLabel.layout(180, 20);
  bodyHeightInput.layout(100, 30);
  cardForm.layout(250, 400);

  mainContainer.addChild(cardColumn);

  // Layout columns
  colorTitle.layout(400, 30);
  texturedTitle.layout(400, 30);
  cardTitle.layout(380, 30);
  colorColumn.layout(450, 800);
  texturedColumn.layout(450, 800);
  cardColumn.layout(420, 800);
  mainContainer.layout(1400, 900);

  // Create initial demo panels
  updateColorDemo();
  updateTexturedDemo();
  updateCardDemo();

  return mainContainer;
}
