/**
 * Example: Flex Layout with Tabs and Address Form
 *
 * Demonstrates the CSS-lite Flexbox layout system with:
 * - Tab control for navigation
 * - Address form with labeled inputs
 * - Submit button
 * - Proper flex layout for form fields
 * - RESIZABLE container with real-time layout updates
 */
import { setupMoxi } from '@moxijs/core';
import {
  EdgeInsets,
  FlexContainer,
  FlexDirection,
  FlexJustify,
  FlexAlign,
  UIPanel,
  UILabel,
  UITabs,
  UITextInput,
  UIButton,
  UIFocusManager,
  TabItem,
  CardPanel
} from '@moxijs/ui';

/**
 * Creates a form field with label above the input
 * Returns both the container and the input for focus management
 */
function createFormField(
  labelText: string,
  placeholder: string,
  flexGrow: number = 0,
  width?: number
): { container: FlexContainer; input: UITextInput } {
  const field = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 6,
    padding: EdgeInsets.zero()
  });

  if (flexGrow > 0) {
    field.setFlexGrow(flexGrow);
  }
  if (width) {
    field.getBoxModel().width = width;
  }

  // Label
  const label = new UILabel({
    text: labelText,
    fontSize: 13,
    color: 0xaaaaaa,
    fontFamily: 'Arial'
  });
  field.addChild(label);

  // Input
  const input = new UITextInput({
    placeholder,
    width: width ?? 200,
    height: 36,
    fontSize: 14,
    borderRadius: 4
  });

  // If flex grow, make input stretch
  if (flexGrow > 0) {
    input.setAlignSelf('stretch');
  }

  field.addChild(input);

  return { container: field, input };
}

/**
 * Creates the Address Form panel content
 * Focusable inputs are automatically registered with the global focus manager
 * when added to the FlexContainer.
 */
function createAddressForm(): FlexContainer {
  const form = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 20,
    padding: EdgeInsets.all(24),
    width: 'fill',
    height: 'fill'
  });

  // Form title
  const title = new UILabel({
    text: 'Shipping Address',
    fontSize: 20,
    fontWeight: 'bold',
    color: 0xffffff,
    fontFamily: 'Arial'
  });
  form.addChild(title);

  // Subtitle
  const subtitle = new UILabel({
    text: 'Please enter your shipping information below.',
    fontSize: 14,
    color: 0x888888,
    fontFamily: 'Arial'
  });
  form.addChild(subtitle);

  // --- Name Row (First Name + Last Name) ---
  const nameRow = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 16,
    width: 'fill'
  });

  const firstName = createFormField('First Name', 'John', 1);
  const lastName = createFormField('Last Name', 'Doe', 1);

  nameRow.addChild(firstName.container);
  nameRow.addChild(lastName.container);
  form.addChild(nameRow);

  // --- Address Line 1 ---
  const address1 = createFormField('Street Address', '123 Main Street', 1);
  address1.container.setAlignSelf('stretch');
  form.addChild(address1.container);

  // --- Address Line 2 ---
  const address2 = createFormField('Apartment, suite, etc. (optional)', 'Apt 4B', 1);
  address2.container.setAlignSelf('stretch');
  form.addChild(address2.container);

  // --- City / State / Zip Row ---
  const cityStateRow = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 16,
    width: 'fill'
  });

  const city = createFormField('City', 'New York', 2);
  const state = createFormField('State', 'NY', 1);
  const zip = createFormField('ZIP Code', '10001', 1);

  cityStateRow.addChild(city.container);
  cityStateRow.addChild(state.container);
  cityStateRow.addChild(zip.container);
  form.addChild(cityStateRow);

  // --- Country ---
  const country = createFormField('Country', 'United States', 1);
  country.container.setAlignSelf('stretch');
  form.addChild(country.container);

  // Note: Inputs are automatically registered with UIFocusManager
  // when added to FlexContainer (if a focus manager instance exists)

  // --- Spacer to push button to bottom ---
  const spacer = new UIPanel({
    width: 10,
    height: 10,
    backgroundColor: 0x000000,
    backgroundAlpha: 0
  });
  spacer.setFlexGrow(1);
  form.addChild(spacer);

  // --- Button Row ---
  const buttonRow = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 12,
    justify: FlexJustify.End,
    width: 'fill'
  });

  const cancelButton = new UIButton({
    label: 'Cancel',
    width: 100,
    height: 40,
    backgroundColor: 0x444455,
    textColor: 0xdddddd,
    borderRadius: 6,
    onClick: () => console.log('Cancel clicked')
  });

  const submitButton = new UIButton({
    label: 'Submit',
    width: 120,
    height: 40,
    backgroundColor: 0x1890ff,
    textColor: 0xffffff,
    borderRadius: 6,
    onClick: () => {
      console.log('Submit clicked - Form would be submitted');
      alert('Address submitted! (Check console)');
    }
  });

  buttonRow.addChild(cancelButton);
  buttonRow.addChild(submitButton);
  form.addChild(buttonRow);

  return form;
}

/**
 * Creates a placeholder panel for other tabs
 */
function createPlaceholderPanel(title: string, description: string): FlexContainer {
  const panel = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 16,
    padding: EdgeInsets.all(24),
    width: 'fill',
    height: 'fill',
    align: FlexAlign.Center,
    justify: FlexJustify.Center
  });

  const titleLabel = new UILabel({
    text: title,
    fontSize: 24,
    fontWeight: 'bold',
    color: 0xffffff,
    fontFamily: 'Arial'
  });
  titleLabel.setAlignSelf('center');
  panel.addChild(titleLabel);

  const descLabel = new UILabel({
    text: description,
    fontSize: 14,
    color: 0x888888,
    fontFamily: 'Arial'
  });
  descLabel.setAlignSelf('center');
  panel.addChild(descLabel);

  return panel;
}

export async function initFlexArchitecture() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('Canvas container not found');

  const { scene, engine } = await setupMoxi({
    hostElement: root,
    showLoadingScene: true,
    renderOptions: {
      width: 900,
      height: 650,
      backgroundColor: 0x1a1a2e
    }
  });

  // =============================================================================
  // Main Container
  // =============================================================================
  const main = new FlexContainer({
    direction: FlexDirection.Column,
    width: 'fill',
    height: 'fill',
    padding: EdgeInsets.only({ top: 10, left: 20, right: 20, bottom: 20 }),
    gap: 0
  });

  // =============================================================================
  // Header
  // =============================================================================
  const header = new FlexContainer({
    direction: FlexDirection.Row,
    width: 'fill',
    height: 50,
    padding: EdgeInsets.symmetric(0, 10),
    align: FlexAlign.Center,
    justify: FlexJustify.SpaceBetween
  });

  const logo = new UILabel({
    text: '📦 ShipFast',
    fontSize: 22,
    fontWeight: 'bold',
    color: 0xffffff,
    fontFamily: 'Arial'
  });
  header.addChild(logo);

  const userInfo = new UILabel({
    text: 'Welcome, User',
    fontSize: 14,
    color: 0x888888,
    fontFamily: 'Arial'
  });
  header.addChild(userInfo);

  main.addChild(header);

  // =============================================================================
  // Focus Manager for Tab Navigation
  // Create this BEFORE building the form so auto-registration works
  // =============================================================================
  new UIFocusManager();

  // =============================================================================
  // Create Tab Items
  // =============================================================================
  const addressForm = createAddressForm();
  const paymentPanel = createPlaceholderPanel('Payment Method', 'Add your payment details here.');
  const reviewPanel = createPlaceholderPanel('Review Order', 'Review your order before checkout.');

  const tabItems: TabItem[] = [
    {
      key: 'address',
      label: 'Address',
      content: addressForm
    },
    {
      key: 'payment',
      label: 'Payment',
      content: paymentPanel
    },
    {
      key: 'review',
      label: 'Review',
      content: reviewPanel
    }
  ];

  // Initial dimensions for tabs
  let tabWidth = 856;
  let tabHeight = 490;

  // =============================================================================
  // Tabs Component
  // =============================================================================
  const tabs = new UITabs({
    items: tabItems,
    defaultActiveKey: 'address',
    type: 'line',
    width: tabWidth,
    height: tabHeight,
    tabBarBackgroundColor: 0x252540,
    activeTabColor: 0x1890ff,
    inactiveTabColor: 0x3d3d54,
    textColor: 0x888888,
    activeTextColor: 0xffffff,
    tabBarHeight: 50,
    onChange: (key) => {
      console.log(`Tab changed to: ${key}`);
    }
  });

  // =============================================================================
  // RESIZABLE Card Panel containing the Tabs
  // Drag edges or corners to resize - layout updates in real-time!
  // =============================================================================
  const contentCard = new CardPanel({
    title: { text: 'Shipping Checkout', fontSize: 16 },
    bodyWidth: tabWidth,
    bodyHeight: tabHeight,
    resizable: true,  // Enable resize handles (e, s, se by default)
    minWidth: 400,
    minHeight: 300,
    colors: {
      background: 0x252540,
      border: 0x3d3d54,
      titleBar: 0x1e1e32,
      titleText: 0xffffff
    },
    onResize: (width, height) => {
      // Real-time layout update when card is resized!
      console.log(`Resizing to ${width}x${height}`);
      tabs.layout(width, height);
    }
  });

  // Add tabs to the card body
  contentCard.getBodyContainer().addChild(tabs.container);

  // Position the card in the main area
  contentCard.container.x = 20;
  contentCard.container.y = 60;
  scene.addChild(contentCard.container);

  // =============================================================================
  // Footer (positioned at bottom)
  // =============================================================================
  const footerText = new UILabel({
    text: 'Flex Layout Demo • DRAG EDGES TO RESIZE • Form reflows in real-time',
    fontSize: 12,
    color: 0x888888,
    fontFamily: 'Arial'
  });
  footerText.container.x = 20;
  footerText.container.y = 620;
  scene.addChild(footerText.container);

  // =============================================================================
  // Add header to Scene and Layout
  // =============================================================================
  scene.addChild(main.container);

  // Initial layout pass for header
  main.layout(900, 60);

  // Initial layout for tabs
  tabs.layout(tabWidth, tabHeight);

  scene.init();
  engine.start();

  console.log('Flex Architecture Demo - Resizable Tabs with Address Form');
  console.log('Features:');
  console.log('  • Tab navigation (Address, Payment, Review)');
  console.log('  • Address form with flex layout');
  console.log('  • Form fields use flex-grow for responsive widths');
  console.log('  • RESIZABLE: Drag right edge, bottom edge, or corner to resize');
  console.log('  • Real-time layout updates as you resize');
}
