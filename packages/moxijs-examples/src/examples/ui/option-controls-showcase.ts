/**
 * Option Controls Showcase Tab
 * Demonstrates checkboxes, toggles, radio groups, and select boxes
 */
import {
  EdgeInsets,
  FlexContainer,
  FlexDirection,
  FlexJustify,
  FlexAlign,
  UILabel,
  UICheckbox,
  UICheckboxWithLabel,
  UIRadioGroup,
  RadioOption,
  UISelect,
  SelectOption,
  UIComponent,
  UIScrollContainer
} from '@moxijs/core';

export async function createOptionControlsShowcase(): Promise<UIComponent> {
  // Create scroll container with dark neutral theme
  const scrollContainer = new UIScrollContainer({
    width: 1280,
    height: 800,
    backgroundColor: 0x1e1e1e, // Dark neutral gray
    padding: EdgeInsets.all(20),
    scrollbarWidth: 14,
    scrollbarTrackColor: 0x2a2a2a,
    scrollbarThumbColor: 0x404040,
    scrollbarThumbHoverColor: 0x505050
  });

  // Main container with two columns
  const mainContainer = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 40,
    padding: EdgeInsets.all(20),
    align: FlexAlign.Start
  });

  // Left column container
  const leftColumn = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 30,
    width: 600
  });

  // Right column container
  const rightColumn = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 30,
    width: 600
  });

  // Section 1: Basic Checkboxes
  const section1Title = new UILabel({
    text: 'Basic Checkboxes',
    fontSize: 24,
    fontWeight: 'bold',
    color: 0xffffff
  });

  const section1Container = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 20,
    padding: EdgeInsets.symmetric(10, 0)
  });

  // Unchecked checkbox
  const uncheckedCheckbox = new UICheckbox({
    defaultChecked: false,
    onChange: (checked) => console.log('Unchecked checkbox:', checked),
    size: 20
  });
  uncheckedCheckbox.tabIndex = 0;

  // Checked checkbox
  const checkedCheckbox = new UICheckbox({
    defaultChecked: true,
    onChange: (checked) => console.log('Checked checkbox:', checked),
    size: 20
  });
  checkedCheckbox.tabIndex = 1;

  // Disabled unchecked
  const disabledUnchecked = new UICheckbox({
    defaultChecked: false,
    disabled: true,
    size: 20
  });

  // Disabled checked
  const disabledChecked = new UICheckbox({
    defaultChecked: true,
    disabled: true,
    size: 20
  });

  section1Container.addChild(uncheckedCheckbox);
  section1Container.addChild(checkedCheckbox);
  section1Container.addChild(disabledUnchecked);
  section1Container.addChild(disabledChecked);

  // Section 2: Checkbox Sizes
  const section2Title = new UILabel({
    text: 'Checkbox Sizes',
    fontSize: 24,
    fontWeight: 'bold',
    color: 0xffffff
  });

  const section2Container = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 20,
    align: FlexAlign.Center,
    padding: EdgeInsets.symmetric(10, 0)
  });

  const smallCheckbox = new UICheckbox({
    defaultChecked: true,
    size: 16,
    onChange: (checked) => console.log('Small:', checked)
  });
  smallCheckbox.tabIndex = 2;

  const mediumCheckbox = new UICheckbox({
    defaultChecked: true,
    size: 20,
    onChange: (checked) => console.log('Medium:', checked)
  });
  mediumCheckbox.tabIndex = 3;

  const largeCheckbox = new UICheckbox({
    defaultChecked: true,
    size: 24,
    onChange: (checked) => console.log('Large:', checked)
  });
  largeCheckbox.tabIndex = 4;

  section2Container.addChild(smallCheckbox);
  section2Container.addChild(mediumCheckbox);
  section2Container.addChild(largeCheckbox);

  // Section 3: Custom Colors
  const section3Title = new UILabel({
    text: 'Custom Colors',
    fontSize: 24,
    fontWeight: 'bold',
    color: 0xffffff
  });

  const section3Container = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 20,
    padding: EdgeInsets.symmetric(10, 0)
  });

  const greenCheckbox = new UICheckbox({
    defaultChecked: true,
    checkedBackgroundColor: 0x28a745,
    checkColor: 0xffffff,
    size: 20,
    onChange: (checked) => console.log('Green:', checked)
  });
  greenCheckbox.tabIndex = 5;

  const redCheckbox = new UICheckbox({
    defaultChecked: true,
    checkedBackgroundColor: 0xdc3545,
    checkColor: 0xffffff,
    size: 20,
    onChange: (checked) => console.log('Red:', checked)
  });
  redCheckbox.tabIndex = 6;

  const purpleCheckbox = new UICheckbox({
    defaultChecked: true,
    checkedBackgroundColor: 0x9b59b6,
    checkColor: 0xffffff,
    size: 20,
    onChange: (checked) => console.log('Purple:', checked)
  });
  purpleCheckbox.tabIndex = 7;

  section3Container.addChild(greenCheckbox);
  section3Container.addChild(redCheckbox);
  section3Container.addChild(purpleCheckbox);

  // Section 4: Checkboxes with Labels
  const section4Title = new UILabel({
    text: 'Checkboxes with Labels',
    fontSize: 24,
    fontWeight: 'bold',
    color: 0xffffff
  });

  const section4Container = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 12,
    padding: EdgeInsets.symmetric(10, 0)
  });

  // Use uncontrolled mode (no checked prop) so checkboxes manage their own state
  const checkbox1 = new UICheckboxWithLabel({
    label: 'Enable notifications',
    defaultChecked: false,
    onChange: (checked) => console.log('Notifications:', checked)
  });
  checkbox1.tabIndex = 8;

  const checkbox2 = new UICheckboxWithLabel({
    label: 'Auto-save changes',
    defaultChecked: true,
    onChange: (checked) => console.log('Auto-save:', checked)
  });
  checkbox2.tabIndex = 9;

  const checkbox3 = new UICheckboxWithLabel({
    label: 'Dark mode',
    defaultChecked: false,
    disabled: false,
    onChange: (checked) => console.log('Dark mode:', checked)
  });
  checkbox3.tabIndex = 10;

  const checkbox4 = new UICheckboxWithLabel({
    label: 'Disabled option',
    defaultChecked: true,
    disabled: true
  });

  const checkbox5 = new UICheckboxWithLabel({
    label: 'Label on left',
    labelPosition: 'left',
    defaultChecked: false,
    onChange: (checked) => console.log('Left label:', checked)
  });
  checkbox5.tabIndex = 11;

  section4Container.addChild(checkbox1);
  section4Container.addChild(checkbox2);
  section4Container.addChild(checkbox3);
  section4Container.addChild(checkbox4);
  section4Container.addChild(checkbox5);

  // Section 5: Radio Groups
  const section5Title = new UILabel({
    text: 'Radio Groups',
    fontSize: 24,
    fontWeight: 'bold',
    color: 0xffffff
  });

  const section5Container = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 20,
    padding: EdgeInsets.symmetric(10, 0)
  });

  // Basic radio group
  const basicRadioLabel = new UILabel({
    text: 'Basic Radio Group',
    fontSize: 14,
    color: 0xcccccc,
    fontWeight: 'normal'
  });
  const basicRadioGroup = new UIRadioGroup({
    options: [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' }
    ],
    defaultValue: 'opt1',
    onChange: (value) => console.log('Radio selected:', value)
  });
  basicRadioGroup.tabIndex = 15;

  const basicRadioGroupContainer = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  basicRadioGroupContainer.addChild(basicRadioLabel);
  basicRadioGroupContainer.addChild(basicRadioGroup);

  // Horizontal radio group
  const horizontalRadioLabel = new UILabel({
    text: 'Horizontal Radio Group',
    fontSize: 14,
    color: 0xcccccc,
    fontWeight: 'normal'
  });
  const horizontalRadioGroup = new UIRadioGroup({
    options: [
      { label: 'Small', value: 'small' },
      { label: 'Medium', value: 'medium' },
      { label: 'Large', value: 'large' }
    ],
    defaultValue: 'medium',
    direction: 'horizontal',
    gap: 20,
    onChange: (value) => console.log('Size selected:', value)
  });
  horizontalRadioGroup.tabIndex = 16;

  const horizontalRadioGroupContainer = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  horizontalRadioGroupContainer.addChild(horizontalRadioLabel);
  horizontalRadioGroupContainer.addChild(horizontalRadioGroup);

  // Radio group with disabled options
  const disabledRadioLabel = new UILabel({
    text: 'Radio Group with Disabled Options',
    fontSize: 14,
    color: 0xcccccc,
    fontWeight: 'normal'
  });
  const disabledRadioGroup = new UIRadioGroup({
    options: [
      { label: 'Available Option 1', value: 'opt1' },
      { label: 'Disabled Option', value: 'opt2', disabled: true },
      { label: 'Available Option 2', value: 'opt3' },
      { label: 'Another Disabled', value: 'opt4', disabled: true }
    ],
    defaultValue: 'opt1',
    onChange: (value) => console.log('Selected:', value)
  });
  disabledRadioGroup.tabIndex = 17;

  const disabledRadioGroupContainer = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  disabledRadioGroupContainer.addChild(disabledRadioLabel);
  disabledRadioGroupContainer.addChild(disabledRadioGroup);

  // Disabled radio group
  const disabledGroupLabel = new UILabel({
    text: 'Disabled Radio Group',
    fontSize: 14,
    color: 0xcccccc,
    fontWeight: 'normal'
  });
  const disabledGroup = new UIRadioGroup({
    options: [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' }
    ],
    defaultValue: 'opt2',
    disabled: true
  });

  const disabledGroupContainer = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  disabledGroupContainer.addChild(disabledGroupLabel);
  disabledGroupContainer.addChild(disabledGroup);

  section5Container.addChild(basicRadioGroupContainer);
  section5Container.addChild(horizontalRadioGroupContainer);
  section5Container.addChild(disabledRadioGroupContainer);
  section5Container.addChild(disabledGroupContainer);

  // Section 6: Select Boxes (Right Column)
  const section6Title = new UILabel({
    text: 'Select Boxes',
    fontSize: 24,
    fontWeight: 'bold',
    color: 0xffffff
  });

  const section6Container = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 15,
    padding: EdgeInsets.symmetric(10, 0)
  });

  // Basic select
  const basicSelectLabel = new UILabel({
    text: 'Basic Select',
    fontSize: 14,
    color: 0xcccccc,
    fontWeight: 'normal'
  });
  const basicSelect = new UISelect({
    options: [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' },
      { label: 'Option 4', value: 'opt4' }
    ],
    placeholder: 'Choose an option...',
    width: 300,
    height: 40,
    backgroundColor: 0x2a2a2a,
    textColor: 0xffffff,
    borderRadius: 6,
    onChange: (value) => console.log('Selected:', value)
  });
  basicSelect.tabIndex = 12;

  const basicSelectGroup = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  basicSelectGroup.addChild(basicSelectLabel);
  basicSelectGroup.addChild(basicSelect);

  // Select with default value
  const defaultSelectLabel = new UILabel({
    text: 'Select with Default Value',
    fontSize: 14,
    color: 0xcccccc,
    fontWeight: 'normal'
  });
  const defaultSelect = new UISelect({
    options: [
      { label: 'Red', value: 'red' },
      { label: 'Green', value: 'green' },
      { label: 'Blue', value: 'blue' },
      { label: 'Yellow', value: 'yellow' }
    ],
    defaultValue: 'green',
    width: 300,
    height: 40,
    backgroundColor: 0x2a2a2a,
    textColor: 0xffffff,
    borderRadius: 6,
    onChange: (value) => console.log('Color selected:', value)
  });
  defaultSelect.tabIndex = 13;

  const defaultSelectGroup = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  defaultSelectGroup.addChild(defaultSelectLabel);
  defaultSelectGroup.addChild(defaultSelect);

  // Select with disabled options
  const disabledSelectLabel = new UILabel({
    text: 'Select with Disabled Options',
    fontSize: 14,
    color: 0xcccccc,
    fontWeight: 'normal'
  });
  const disabledSelect = new UISelect({
    options: [
      { label: 'Available Option 1', value: 'opt1' },
      { label: 'Disabled Option', value: 'opt2', disabled: true },
      { label: 'Available Option 2', value: 'opt3' },
      { label: 'Another Disabled', value: 'opt4', disabled: true }
    ],
    placeholder: 'Select...',
    width: 300,
    height: 40,
    backgroundColor: 0x2a2a2a,
    textColor: 0xffffff,
    borderRadius: 6,
    onChange: (value) => console.log('Selected:', value)
  });
  disabledSelect.tabIndex = 14;

  const disabledSelectGroup = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  disabledSelectGroup.addChild(disabledSelectLabel);
  disabledSelectGroup.addChild(disabledSelect);

  // Disabled select
  const disabledSelectBoxLabel = new UILabel({
    text: 'Disabled Select',
    fontSize: 14,
    color: 0xcccccc,
    fontWeight: 'normal'
  });
  const disabledSelectBox = new UISelect({
    options: [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' }
    ],
    defaultValue: 'opt1',
    disabled: true,
    width: 300,
    height: 40,
    backgroundColor: 0x2a2a2a,
    textColor: 0xffffff,
    borderRadius: 6
  });

  const disabledSelectBoxGroup = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 8
  });
  disabledSelectBoxGroup.addChild(disabledSelectBoxLabel);
  disabledSelectBoxGroup.addChild(disabledSelectBox);

  section6Container.addChild(basicSelectGroup);
  section6Container.addChild(defaultSelectGroup);
  section6Container.addChild(disabledSelectGroup);
  section6Container.addChild(disabledSelectBoxGroup);

  // Add sections to left column
  leftColumn.addChild(section1Title);
  leftColumn.addChild(section1Container);
  leftColumn.addChild(section2Title);
  leftColumn.addChild(section2Container);
  leftColumn.addChild(section3Title);
  leftColumn.addChild(section3Container);
  leftColumn.addChild(section4Title);
  leftColumn.addChild(section4Container);

  // Add sections to right column
  rightColumn.addChild(section6Title);
  rightColumn.addChild(section6Container);
  rightColumn.addChild(section5Title);
  rightColumn.addChild(section5Container);

  // Add columns to main container
  mainContainer.addChild(leftColumn);
  mainContainer.addChild(rightColumn);

  // Add main container to scroll container
  scrollContainer.addChild(mainContainer);

  return scrollContainer;
}

