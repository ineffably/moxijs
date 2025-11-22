import PIXI from 'pixi.js';
import {
  UIComponent,
  FlexContainer,
  FlexDirection,
  FlexJustify,
  FlexAlign,
  UITextInput,
  UITextArea,
  UILabel,
  UIScrollContainer,
  EdgeInsets
} from 'moxi';

/**
 * Text Inputs Showcase
 * Demonstrates various text input components including:
 * - Single-line text inputs with labels
 * - Multi-line textareas
 * - Grid layout of label-input pairs
 * - Tab focus navigation
 */
export async function createTextInputsShowcase(): Promise<UIComponent> {
  // Create scroll container
  const scrollContainer = new UIScrollContainer({
    width: 1280,
    height: 800,
    backgroundColor: 0x1a1a2e,
    padding: EdgeInsets.all(20),
    scrollbarWidth: 14,
    scrollbarTrackColor: 0x2d2d44,
    scrollbarThumbColor: 0x4a4a6a,
    scrollbarThumbHoverColor: 0x6a6a8a
  });

  // Main container with vertical layout (content inside scroll container)
  const mainContainer = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 30,
    padding: EdgeInsets.all(20)
  });

  // Section 1: Basic Text Inputs with Labels
  const section1Title = new UILabel({
    text: 'Basic Text Inputs',
    fontSize: 24,
    fontWeight: 'bold',
    color: 0xffffff
  });

  const section1Container = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 20
  });

  // Example 1: Name input
  const nameLabel = new UILabel({
    text: 'Full Name:',
    fontSize: 16,
    color: 0xffffff
  });

  const nameInput = new UITextInput({
    placeholder: 'Enter your full name...',
    width: 400,
    height: 40,
    fontSize: 16,
    onChange: (value) => console.log('Name:', value)
  });
  nameInput.tabIndex = 0;

  const nameGroup = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  nameGroup.addChild(nameLabel);
  nameGroup.addChild(nameInput);

  // Example 2: Email input
  const emailLabel = new UILabel({
    text: 'Email Address:',
    fontSize: 16,
    color: 0xffffff
  });

  const emailInput = new UITextInput({
    placeholder: 'your.email@example.com',
    width: 400,
    height: 40,
    fontSize: 16,
    onChange: (value) => console.log('Email:', value)
  });
  emailInput.tabIndex = 1;

  const emailGroup = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  emailGroup.addChild(emailLabel);
  emailGroup.addChild(emailInput);

  // Example 3: Number input
  const ageLabel = new UILabel({
    text: 'Age:',
    fontSize: 16,
    color: 0xffffff
  });

  const ageInput = new UITextInput({
    placeholder: 'Enter age',
    width: 200,
    height: 40,
    fontSize: 16,
    type: 'number',
    onChange: (value) => console.log('Age:', value)
  });
  ageInput.tabIndex = 2;
  

  const ageGroup = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  ageGroup.addChild(ageLabel);
  ageGroup.addChild(ageInput);

  section1Container.addChild(section1Title);
  section1Container.addChild(nameGroup);
  section1Container.addChild(emailGroup);
  section1Container.addChild(ageGroup);

  // Section 2: Input Variations
  const section2Title = new UILabel({
    text: 'Input Variations',
    fontSize: 24,
    fontWeight: 'bold',
    color: 0xffffff
  });

  const section2Container = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 20
  });

  // Small input
  const smallInput = new UITextInput({
    placeholder: 'Small (200x32)',
    width: 200,
    height: 32,
    fontSize: 12
  });
  smallInput.tabIndex = 3;
  

  // Medium input
  const mediumInput = new UITextInput({
    placeholder: 'Medium (300x40)',
    width: 300,
    height: 40,
    fontSize: 14
  });
  mediumInput.tabIndex = 4;
  

  // Large input
  const largeInput = new UITextInput({
    placeholder: 'Large (400x48)',
    width: 400,
    height: 48,
    fontSize: 16
  });
  largeInput.tabIndex = 5;
  

  section2Container.addChild(smallInput);
  section2Container.addChild(mediumInput);
  section2Container.addChild(largeInput);

  // Section 3: Form Grid (2x2 label-input pairs)
  const section3Title = new UILabel({
    text: 'Form Grid',
    fontSize: 24,
    fontWeight: 'bold',
    color: 0xffffff
  });

  const gridContainer = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 16
  });

  // Row 1: First Name and Last Name
  const row1 = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 20
  });

  const firstNameGroup = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  const firstNameLabel = new UILabel({
    text: 'First Name:',
    fontSize: 14,
    color: 0xffffff
  });
  const firstNameInput = new UITextInput({
    placeholder: 'John',
    width: 250,
    height: 36,
    fontSize: 14
  });
  firstNameInput.tabIndex = 6; // First row, left
  
  firstNameGroup.addChild(firstNameLabel);
  firstNameGroup.addChild(firstNameInput);

  const lastNameGroup = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  const lastNameLabel = new UILabel({
    text: 'Last Name:',
    fontSize: 14,
    color: 0xffffff
  });
  const lastNameInput = new UITextInput({
    placeholder: 'Doe',
    width: 250,
    height: 36,
    fontSize: 14
  });
  lastNameInput.tabIndex = 7; // First row, right
  
  lastNameGroup.addChild(lastNameLabel);
  lastNameGroup.addChild(lastNameInput);

  row1.addChild(firstNameGroup);
  row1.addChild(lastNameGroup);

  // Row 2: Phone and City
  const row2 = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 20
  });

  const phoneGroup = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  const phoneLabel = new UILabel({
    text: 'Phone:',
    fontSize: 14,
    color: 0xffffff
  });
  const phoneInput = new UITextInput({
    placeholder: '(555) 123-4567',
    width: 250,
    height: 36,
    fontSize: 14
  });
  phoneInput.tabIndex = 8; // Second row, left
  
  phoneGroup.addChild(phoneLabel);
  phoneGroup.addChild(phoneInput);

  const cityGroup = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  const cityLabel = new UILabel({
    text: 'City:',
    fontSize: 14,
    color: 0xffffff
  });
  const cityInput = new UITextInput({
    placeholder: 'San Francisco',
    width: 250,
    height: 36,
    fontSize: 14
  });
  cityInput.tabIndex = 9; // Second row, right
  
  cityGroup.addChild(cityLabel);
  cityGroup.addChild(cityInput);

  row2.addChild(phoneGroup);
  row2.addChild(cityGroup);

  gridContainer.addChild(row1);
  gridContainer.addChild(row2);

  // Section 4: Multi-line Text Areas
  const section4Title = new UILabel({
    text: 'Multi-line Text Areas',
    fontSize: 24,
    fontWeight: 'bold',
    color: 0xffffff
  });

  const section4Container = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 20
  });

  // Small textarea
  const smallTextareaGroup = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  const smallTextareaLabel = new UILabel({
    text: 'Comments (3 rows):',
    fontSize: 14,
    color: 0xffffff
  });
  const smallTextarea = new UITextArea({
    placeholder: 'Enter your comments here...',
    width: 300,
    rows: 3,
    fontSize: 14,
    onChange: (value) => console.log('Comments:', value)
  });
  smallTextarea.tabIndex = 10;
  
  smallTextareaGroup.addChild(smallTextareaLabel);
  smallTextareaGroup.addChild(smallTextarea);

  // Large textarea
  const largeTextareaGroup = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  const largeTextareaLabel = new UILabel({
    text: 'Description (6 rows):',
    fontSize: 14,
    color: 0xffffff
  });
  const largeTextarea = new UITextArea({
    placeholder: 'Enter a detailed description...\nSupports multiple lines.\nPress Enter to add new lines.\nPress Escape to unfocus.',
    width: 500,
    rows: 6,
    fontSize: 14,
    maxLength: 500,
    onChange: (value) => console.log('Description:', value)
  });
  largeTextarea.tabIndex = 11;
  
  largeTextareaGroup.addChild(largeTextareaLabel);
  largeTextareaGroup.addChild(largeTextarea);

  section4Container.addChild(smallTextareaGroup);
  section4Container.addChild(largeTextareaGroup);

  // Add all sections to main container
  mainContainer.addChild(section1Container);
  mainContainer.addChild(section2Title);
  mainContainer.addChild(section2Container);
  mainContainer.addChild(section3Title);
  mainContainer.addChild(gridContainer);
  mainContainer.addChild(section4Title);
  mainContainer.addChild(section4Container);

  // Add main container to scroll container
  scrollContainer.addChild(mainContainer);

  // Note: Focus manager is now created and managed at the top level (ui-showcase.ts)
  // It will auto-discover and register all focusable components when the tab is activated

  return scrollContainer;
}
