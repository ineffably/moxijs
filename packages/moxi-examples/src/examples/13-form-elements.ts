import {
  setupMoxi,
  FlexContainer,
  FlexDirection,
  FlexJustify,
  FlexAlign,
  EdgeInsets,
  UILabel,
  UIPanel,
  UISelect,
  UITextInput,
  SelectOption
} from 'moxi-kit';

/**
 * Example 13: Form Elements
 *
 * Demonstrates:
 * - UISelect with options array (Ant Design pattern)
 * - UITextInput with controlled/uncontrolled modes
 * - Form-like layouts with labels and inputs
 * - Various input configurations
 */
export async function initFormElements() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('Canvas container not found');

  const { scene, engine } = await setupMoxi({
    hostElement: root,
    showLoadingScene: true,
    renderOptions: {
      width: 1280,
      height: 720,
      backgroundColor: 0x1a1a2e
    }
  });

  // Main container
  const mainContainer = new FlexContainer({
    direction: FlexDirection.Column,
    justify: FlexJustify.Start,
    align: FlexAlign.Center,
    gap: 30,
    padding: EdgeInsets.all(40),
    width: 1280,
    height: 720
  });

  // Title
  const titleLabel = new UILabel({
    text: 'Form Elements Demo',
    fontSize: 32,
    color: 0xffffff
  });
  mainContainer.addChild(titleLabel);

  // Description
  const descLabel = new UILabel({
    text: 'Text inputs and select dropdowns following Ant Design patterns',
    fontSize: 16,
    color: 0xaaaaaa
  });
  mainContainer.addChild(descLabel);

  // Form panel
  const formPanel = new UIPanel({
    backgroundColor: 0x2d2d44,
    width: 600,
    height: 500,
    borderRadius: 8
  });

  const formContainer = new FlexContainer({
    direction: FlexDirection.Column,
    justify: FlexJustify.Start,
    align: FlexAlign.Start,
    gap: 20,
    padding: EdgeInsets.all(30),
    width: 600,
    height: 500
  });

  // === Text Input - Username ===
  const usernameLabel = new UILabel({
    text: 'Username:',
    fontSize: 14,
    color: 0xffffff
  });
  formContainer.addChild(usernameLabel);

  const usernameInput = new UITextInput({
    placeholder: 'Enter username...',
    width: 540,
    height: 40,
    onChange: (value) => {
      console.log('Username:', value);
    }
  });
  formContainer.addChild(usernameInput);

  // === Text Input - Email ===
  const emailLabel = new UILabel({
    text: 'Email:',
    fontSize: 14,
    color: 0xffffff
  });
  formContainer.addChild(emailLabel);

  const emailInput = new UITextInput({
    placeholder: 'user@example.com',
    width: 540,
    height: 40,
    onChange: (value) => {
      console.log('Email:', value);
    }
  });
  formContainer.addChild(emailInput);

  // === Select - Character Class ===
  const classLabel = new UILabel({
    text: 'Character Class:',
    fontSize: 14,
    color: 0xffffff
  });
  formContainer.addChild(classLabel);

  const classOptions: SelectOption[] = [
    { label: 'Warrior', value: 'warrior' },
    { label: 'Mage', value: 'mage' },
    { label: 'Rogue', value: 'rogue' },
    { label: 'Cleric', value: 'cleric' },
    { label: 'Ranger', value: 'ranger' }
  ];

  const classSelect = new UISelect({
    options: classOptions,
    placeholder: 'Choose a class...',
    width: 540,
    height: 40,
    onChange: (value) => {
      console.log('Selected class:', value);
    }
  });
  formContainer.addChild(classSelect);

  // === Number Input - Level ===
  const levelLabel = new UILabel({
    text: 'Level:',
    fontSize: 14,
    color: 0xffffff
  });
  formContainer.addChild(levelLabel);

  const levelInput = new UITextInput({
    placeholder: '1',
    width: 540,
    height: 40,
    type: 'number',
    onChange: (value) => {
      console.log('Level:', value);
    }
  });
  formContainer.addChild(levelInput);

  // === Select - Difficulty ===
  const difficultyLabel = new UILabel({
    text: 'Difficulty:',
    fontSize: 14,
    color: 0xffffff
  });
  formContainer.addChild(difficultyLabel);

  const difficultyOptions: SelectOption[] = [
    { label: 'Easy', value: 'easy' },
    { label: 'Normal', value: 'normal' },
    { label: 'Hard', value: 'hard' },
    { label: 'Expert', value: 'expert', disabled: true },
    { label: 'Nightmare', value: 'nightmare', disabled: true }
  ];

  const difficultySelect = new UISelect({
    options: difficultyOptions,
    defaultValue: 'normal',
    width: 540,
    height: 40,
    onChange: (value) => {
      console.log('Selected difficulty:', value);
    }
  });
  formContainer.addChild(difficultySelect);

  // Layout the form container before adding it
  formContainer.layout(600, 500);

  // Add form to panel and panel to main container
  formPanel.container.addChild(formContainer.container);
  mainContainer.addChild(formPanel);

  // Info panel showing current values
  const infoPanel = new UIPanel({
    backgroundColor: 0x3d3d54,
    width: 600,
    height: 100,
    borderRadius: 8
  });

  const infoContainer = new FlexContainer({
    direction: FlexDirection.Column,
    justify: FlexJustify.Center,
    align: FlexAlign.Center,
    gap: 10,
    padding: EdgeInsets.all(20),
    width: 600,
    height: 100
  });

  const infoLabel = new UILabel({
    text: 'Open console (F12) to see form values as you type and select',
    fontSize: 14,
    color: 0xcccccc,
    align: 'center'
  });
  infoContainer.addChild(infoLabel);

  // Layout the info container before adding it
  infoContainer.layout(600, 100);

  infoPanel.container.addChild(infoContainer.container);
  mainContainer.addChild(infoPanel);

  // Layout and add to scene
  mainContainer.layout(1280, 720);
  scene.addChild(mainContainer.container);

  // Initialize and start
  scene.init();
  engine.start();
}
