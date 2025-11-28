import { setupMoxi, FlexContainer, FlexDirection, FlexJustify, FlexAlign, EdgeInsets, UIBox, UILabel, UIPanel, UIButton } from 'moxijs';

export async function initUIComponents() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('Canvas container not found');

  const { scene, engine, renderer } = await setupMoxi({
    hostElement: root,
    showLoadingScene: true,
    renderOptions: {
      width: 1280,
      height: 720,
      backgroundColor: 0x1a1a2e
    }
  });

  // Main container with column layout
  const mainContainer = new FlexContainer({
    direction: FlexDirection.Column,
    justify: FlexJustify.Start,
    align: FlexAlign.Center,
    gap: 30,
    padding: EdgeInsets.all(40),
    width: 1280,
    height: 720
  });

  // Title section
  const titleLabel = new UILabel({
    text: 'UI Components Demo',
    fontSize: 32,
    fontFamily: 'Arial',
    color: 0xffffff,
    align: 'center'
  });
  mainContainer.addChild(titleLabel);

  // Panel demonstration
  const panelSection = new FlexContainer({
    direction: FlexDirection.Column,
    justify: FlexJustify.Start,
    align: FlexAlign.Center,
    gap: 10
  });

  const panelLabel = new UILabel({
    text: 'Panels with Different Colors',
    fontSize: 18,
    color: 0xaaaaaa,
    align: 'center'
  });
  panelSection.addChild(panelLabel);

  const panelRow = new FlexContainer({
    direction: FlexDirection.Row,
    justify: FlexJustify.Center,
    align: FlexAlign.Center,
    gap: 20
  });

  // Create panels with different colors
  const panelColors = [
    { color: 0x2c3e50, label: 'Dark Blue' },
    { color: 0x27ae60, label: 'Green' },
    { color: 0xe74c3c, label: 'Red' }
  ];

  panelColors.forEach(({ color, label }) => {
    const panelContainer = new FlexContainer({
      direction: FlexDirection.Column,
      justify: FlexJustify.Center,
      align: FlexAlign.Center,
      gap: 10
    });

    const panel = new UIPanel({
      backgroundColor: color,
      width: 120,
      height: 80,
      borderRadius: 8
    });
    panelContainer.addChild(panel);

    const panelText = new UILabel({
      text: label,
      fontSize: 14,
      color: 0xffffff,
      align: 'center'
    });
    panelContainer.addChild(panelText);

    panelRow.addChild(panelContainer);
  });

  panelSection.addChild(panelRow);
  mainContainer.addChild(panelSection);

  // Button demonstration
  const buttonSection = new FlexContainer({
    direction: FlexDirection.Column,
    justify: FlexJustify.Start,
    align: FlexAlign.Center,
    gap: 15
  });

  const buttonLabel = new UILabel({
    text: 'Interactive Buttons',
    fontSize: 18,
    color: 0xaaaaaa,
    align: 'center'
  });
  buttonSection.addChild(buttonLabel);

  const buttonRow = new FlexContainer({
    direction: FlexDirection.Row,
    justify: FlexJustify.Center,
    align: FlexAlign.Center,
    gap: 20
  });

  // Status label to show button clicks
  const statusLabel = new UILabel({
    text: 'Click a button!',
    fontSize: 16,
    color: 0xffe66d,
    align: 'center'
  });

  // Create interactive buttons
  const button1 = new UIButton({
    label: 'Primary',
    width: 120,
    height: 40,
    backgroundColor: 0x3498db,
    textColor: 0xffffff,
    fontSize: 16,
    borderRadius: 6,
    onClick: () => {
      statusLabel.setText('Primary button clicked!');
      statusLabel.setColor(0x3498db);
    }
  });
  buttonRow.addChild(button1);

  const button2 = new UIButton({
    label: 'Success',
    width: 120,
    height: 40,
    backgroundColor: 0x2ecc71,
    textColor: 0xffffff,
    fontSize: 16,
    borderRadius: 6,
    onClick: () => {
      statusLabel.setText('Success button clicked!');
      statusLabel.setColor(0x2ecc71);
    }
  });
  buttonRow.addChild(button2);

  const button3 = new UIButton({
    label: 'Danger',
    width: 120,
    height: 40,
    backgroundColor: 0xe74c3c,
    textColor: 0xffffff,
    fontSize: 16,
    borderRadius: 6,
    onClick: () => {
      statusLabel.setText('Danger button clicked!');
      statusLabel.setColor(0xe74c3c);
    }
  });
  buttonRow.addChild(button3);

  const disabledButton = new UIButton({
    label: 'Disabled',
    width: 120,
    height: 40,
    backgroundColor: 0x95a5a6,
    textColor: 0xffffff,
    fontSize: 16,
    borderRadius: 6,
    enabled: false
  });
  buttonRow.addChild(disabledButton);

  buttonSection.addChild(buttonRow);
  buttonSection.addChild(statusLabel);
  mainContainer.addChild(buttonSection);

  // Complex panel with nested content
  const complexSection = new FlexContainer({
    direction: FlexDirection.Column,
    justify: FlexJustify.Start,
    align: FlexAlign.Center,
    gap: 10
  });

  const complexLabel = new UILabel({
    text: 'Complex Panel Example',
    fontSize: 18,
    color: 0xaaaaaa,
    align: 'center'
  });
  complexSection.addChild(complexLabel);

  // Create a card-like panel
  const card = new UIPanel({
    backgroundColor: 0x2c3e50,
    width: 400,
    height: 120,
    borderRadius: 12
  }, {
    padding: EdgeInsets.all(20)
  });

  const cardContent = new FlexContainer({
    direction: FlexDirection.Column,
    justify: FlexJustify.SpaceBetween,
    align: FlexAlign.Start,
    gap: 10
  });

  const cardTitle = new UILabel({
    text: 'Card Title',
    fontSize: 20,
    color: 0xffffff,
    fontWeight: 'bold'
  });
  cardContent.addChild(cardTitle);

  const cardDescription = new UILabel({
    text: 'This is a panel with nested labels demonstrating complex layouts.',
    fontSize: 14,
    color: 0xbdc3c7,
    wordWrap: true,
    wordWrapWidth: 360
  });
  cardContent.addChild(cardDescription);

  // We need to add the cardContent to the card, but UIPanel doesn't support children yet
  // For now, we'll add it to the complexSection instead
  complexSection.addChild(card);
  complexSection.addChild(cardContent);

  mainContainer.addChild(complexSection);

  // Perform layout and add to scene
  mainContainer.layout(1280, 720);
  scene.addChild(mainContainer.container);

  // Initialize and start
  scene.init();
  engine.start();

  console.log('✅ UI Components example loaded');
}
