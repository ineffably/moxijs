/**
 * Theming Showcase Tab
 * Demonstrates the theming system with theme switching and real-world form elements
 *
 * Uses MSDF (Multi-channel Signed Distance Field) text rendering
 * for crisp text at any scale.
 */
import {
  EdgeInsets,
  FlexContainer,
  FlexDirection,
  UILabel,
  UIButton,
  UITextInput,
  UITextArea,
  UICheckboxWithLabel,
  UIComponent,
  UIScrollContainer,
  ThemeManager,
  DefaultUITheme,
  createDefaultDarkTheme,
  createDefaultLightTheme
} from '@moxijs/ui';
import { MSDF_FONT } from '../02-ui/ui-showcase';

let globalThemeManager: ThemeManager<DefaultUITheme> | null = null;

export async function createThemingShowcase(): Promise<UIComponent> {
  // Create theme manager
  const themeManager = new ThemeManager<DefaultUITheme>('ui-showcase-theme', 'Dark');
  globalThemeManager = themeManager;

  // Register default themes
  themeManager.registerTheme({
    name: 'Dark',
    variant: 'dark',
    theme: createDefaultDarkTheme(),
    description: 'Default dark theme'
  });

  themeManager.registerTheme({
    name: 'Light',
    variant: 'light',
    theme: createDefaultLightTheme(),
    description: 'Default light theme'
  });

  // Register custom themes (using new simplified theme structure)
  themeManager.registerTheme({
    name: 'Blue Dark',
    variant: 'dark',
    theme: {
      background: 0x1a1a2e,
      panelBackground: 0x2d2d44,
      surfaceBackground: 0x3a3a5a,
      border: 0x4a4a6a,
      text: 0xffffff,
      textSecondary: 0xcccccc,
      // Generic control colors (used by all controls)
      controlBackground: 0x2d2d44,
      controlBorder: 0x4a4a6a,
      controlText: 0xffffff,
      controlSelected: 0x4a90e2,
      controlHover: 0x3a3a5a,
      controlFocus: 0x3a3a5a,
      controlDisabled: 0x2d2d44,
      controlDisabledText: 0x666666,
      // Control-specific overrides
      checkboxCheckmark: 0xffffff,
      textInputPlaceholder: 0x999999,
      selectDropdown: 0x2d2d44,
      // Accent & status
      accent: 0x4a90e2,
      accentSecondary: 0x6a9ae2,
      error: 0xdc3545,
      success: 0x28a745
    },
    description: 'Dark theme with blue accents'
  });

  themeManager.registerTheme({
    name: 'Green Dark',
    variant: 'dark',
    theme: {
      background: 0x1e2e1e,
      panelBackground: 0x2d442d,
      surfaceBackground: 0x3a5a3a,
      border: 0x4a6a4a,
      text: 0xffffff,
      textSecondary: 0xcccccc,
      // Generic control colors (used by all controls)
      controlBackground: 0x2d442d,
      controlBorder: 0x4a6a4a,
      controlText: 0xffffff,
      controlSelected: 0x4ae24a,
      controlHover: 0x3a5a3a,
      controlFocus: 0x3a5a3a,
      controlDisabled: 0x2d442d,
      controlDisabledText: 0x666666,
      // Control-specific overrides
      checkboxCheckmark: 0xffffff,
      textInputPlaceholder: 0x999999,
      selectDropdown: 0x2d442d,
      // Accent & status
      accent: 0x4ae24a,
      accentSecondary: 0x6ae26a,
      error: 0xdc3545,
      success: 0x28a745
    },
    description: 'Dark theme with green accents'
  });

  // Get initial theme
  const initialTheme = themeManager.getTheme();

  // Create scroll container with theme colors
  const scrollContainer = new UIScrollContainer({
    width: 1280,
    height: 800,
    backgroundColor: initialTheme.background,
    padding: EdgeInsets.all(20),
    scrollbarWidth: 14,
    scrollbarTrackColor: initialTheme.panelBackground,
    scrollbarThumbColor: initialTheme.border,
    scrollbarThumbHoverColor: initialTheme.accent
  });

  // Main container
  const mainContainer = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 30,
    padding: EdgeInsets.all(20)
  });

  // Section 1: Theme Selector
  const section1Title = new UILabel({
    text: 'Theme Selector',
    fontSize: 24,
    fontWeight: 'bold',
    color: initialTheme.text,
    msdfFontFamily: MSDF_FONT.family
  });

  const themeSelectorContainer = new FlexContainer({
    direction: FlexDirection.Row,
    gap: 15,
    padding: EdgeInsets.symmetric(10, 0)
  });

  // Create theme buttons
  const themes = themeManager.getAllThemes();
  const themeButtons: UIButton[] = [];

  themes.forEach((themeInfo, index) => {
    const button = new UIButton({
      label: themeInfo.name,
      width: 140,
      height: 40,
      backgroundColor: themeInfo.theme.accent,
      textColor: themeInfo.theme.text,
      borderRadius: 6,
      msdfFontFamily: MSDF_FONT.family,
      onClick: () => {
        themeManager.setTheme(themeInfo.name);
      }
    });
    button.tabIndex = index;
    themeButtons.push(button);
    themeSelectorContainer.addChild(button);
  });

  // Section 2: Form Elements Preview
  const section2Title = new UILabel({
    text: 'Form Elements Preview',
    fontSize: 24,
    fontWeight: 'bold',
    color: initialTheme.text,
    msdfFontFamily: MSDF_FONT.family
  });

  const formContainer = new FlexContainer({
    direction: FlexDirection.Column,
    gap: 30,
    padding: EdgeInsets.all(20)
  });

  // Store form elements for theme updates
  let profileTitle: UILabel | null = null;
  let nameLabel: UILabel | null = null;
  let nameInput: UITextInput | null = null;
  let emailLabel: UILabel | null = null;
  let emailInput: UITextInput | null = null;
  let bioLabel: UILabel | null = null;
  let bioInput: UITextArea | null = null;
  let preferencesLabel: UILabel | null = null;
  let notifyCheckbox: UICheckboxWithLabel | null = null;
  let marketingCheckbox: UICheckboxWithLabel | null = null;
  let darkModeCheckbox: UICheckboxWithLabel | null = null;
  let submitButton: UIButton | null = null;
  let profileForm: FlexContainer | null = null;

  // Create form elements once
  function createFormElements(currentTheme: DefaultUITheme, container: FlexContainer): void {
    // User Profile Form Section
    profileTitle = new UILabel({
      text: 'User Profile Form',
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.text,
      msdfFontFamily: MSDF_FONT.family
    });
    container.addChild(profileTitle);

    profileForm = new FlexContainer({
      direction: FlexDirection.Column,
      gap: 20,
      padding: EdgeInsets.all(20)
    });

    // Full Name
    nameLabel = new UILabel({
      text: 'Full Name',
      fontSize: 14,
      color: currentTheme.textSecondary,
      fontWeight: 'normal',
      msdfFontFamily: MSDF_FONT.family
    });
    nameInput = new UITextInput({
      placeholder: 'Enter your full name',
      width: 400,
      height: 40,
      fontSize: 16,
      backgroundColor: currentTheme.panelBackground,
      textColor: currentTheme.text,
      placeholderColor: currentTheme.textSecondary,
      borderRadius: 6,
      onChange: (value) => console.log('Name:', value)
    });
    nameInput.tabIndex = 0;

    const nameGroup = new FlexContainer({
      direction: FlexDirection.Column,
      gap: 8
    });
    nameGroup.addChild(nameLabel);
    nameGroup.addChild(nameInput);
    profileForm.addChild(nameGroup);

    // Email
    emailLabel = new UILabel({
      text: 'Email Address',
      fontSize: 14,
      color: currentTheme.textSecondary,
      fontWeight: 'normal',
      msdfFontFamily: MSDF_FONT.family
    });
    emailInput = new UITextInput({
      placeholder: 'your.email@example.com',
      width: 400,
      height: 40,
      fontSize: 16,
      backgroundColor: currentTheme.panelBackground,
      textColor: currentTheme.text,
      placeholderColor: currentTheme.textSecondary,
      borderRadius: 6,
      onChange: (value) => console.log('Email:', value)
    });
    emailInput.tabIndex = 1;

    const emailGroup = new FlexContainer({
      direction: FlexDirection.Column,
      gap: 8
    });
    emailGroup.addChild(emailLabel);
    emailGroup.addChild(emailInput);
    profileForm.addChild(emailGroup);

    // Bio
    bioLabel = new UILabel({
      text: 'Bio',
      fontSize: 14,
      color: currentTheme.textSecondary,
      fontWeight: 'normal',
      msdfFontFamily: MSDF_FONT.family
    });
    bioInput = new UITextArea({
      placeholder: 'Tell us about yourself...',
      width: 400,
      rows: 4,
      fontSize: 14,
      backgroundColor: currentTheme.panelBackground,
      textColor: currentTheme.text,
      placeholderColor: currentTheme.textSecondary,
      borderRadius: 6,
      onChange: (value) => console.log('Bio:', value)
    });
    bioInput.tabIndex = 2;

    const bioGroup = new FlexContainer({
      direction: FlexDirection.Column,
      gap: 8
    });
    bioGroup.addChild(bioLabel);
    bioGroup.addChild(bioInput);
    profileForm.addChild(bioGroup);

    // Preferences Section
    preferencesLabel = new UILabel({
      text: 'Preferences',
      fontSize: 16,
      fontWeight: 'bold',
      color: currentTheme.text,
      msdfFontFamily: MSDF_FONT.family
    });
    profileForm.addChild(preferencesLabel);

    const preferencesContainer = new FlexContainer({
      direction: FlexDirection.Column,
      gap: 12
    });

    notifyCheckbox = new UICheckboxWithLabel({
      label: 'Email notifications',
      checked: true,
      checkedBackgroundColor: currentTheme.accent,
      textColor: currentTheme.text,
      onChange: (checked) => console.log('Email notifications:', checked)
    });
    notifyCheckbox.tabIndex = 3;

    marketingCheckbox = new UICheckboxWithLabel({
      label: 'Marketing emails',
      checked: false,
      checkedBackgroundColor: currentTheme.accent,
      textColor: currentTheme.text,
      onChange: (checked) => console.log('Marketing emails:', checked)
    });
    marketingCheckbox.tabIndex = 4;

    darkModeCheckbox = new UICheckboxWithLabel({
      label: 'Dark mode',
      checked: true,
      checkedBackgroundColor: currentTheme.accent,
      textColor: currentTheme.text,
      onChange: (checked) => console.log('Dark mode:', checked)
    });
    darkModeCheckbox.tabIndex = 5;

    preferencesContainer.addChild(notifyCheckbox);
    preferencesContainer.addChild(marketingCheckbox);
    preferencesContainer.addChild(darkModeCheckbox);
    profileForm.addChild(preferencesContainer);

    // Submit Button
    submitButton = new UIButton({
      label: 'Save Profile',
      width: 200,
      height: 44,
      backgroundColor: currentTheme.accent,
      textColor: currentTheme.text,
      fontSize: 16,
      borderRadius: 6,
      msdfFontFamily: MSDF_FONT.family,
      onClick: () => {
        console.log('Profile saved!');
        console.log('Name:', nameInput?.getValue());
        console.log('Email:', emailInput?.getValue());
        console.log('Bio:', bioInput?.getValue());
        console.log('Email notifications:', notifyCheckbox?.getChecked());
        console.log('Marketing emails:', marketingCheckbox?.getChecked());
        console.log('Dark mode:', darkModeCheckbox?.getChecked());
      }
    });
    submitButton.tabIndex = 6;
    profileForm.addChild(submitButton);

    container.addChild(profileForm);
  }

  // Update form elements with new theme (without recreating)
  function updateFormElementsTheme(newTheme: DefaultUITheme): void {
    // Update labels
    if (profileTitle) profileTitle.setColor(newTheme.text);
    if (nameLabel) nameLabel.setColor(newTheme.textSecondary);
    if (emailLabel) emailLabel.setColor(newTheme.textSecondary);
    if (bioLabel) bioLabel.setColor(newTheme.textSecondary);
    if (preferencesLabel) preferencesLabel.setColor(newTheme.text);

    // Update text inputs - access internal background panel
    if (nameInput) {
      // @ts-ignore - accessing private background property
      if (nameInput.background) {
        // @ts-ignore
        nameInput.background.setBackgroundColor(newTheme.panelBackground);
      }
      // @ts-ignore - accessing private textDisplay property
      if (nameInput.textDisplay) {
        // @ts-ignore
        nameInput.textDisplay.style.fill = newTheme.text;
      }
    }
    if (emailInput) {
      // @ts-ignore
      if (emailInput.background) {
        // @ts-ignore
        emailInput.background.setBackgroundColor(newTheme.panelBackground);
      }
      // @ts-ignore
      if (emailInput.textDisplay) {
        // @ts-ignore
        emailInput.textDisplay.style.fill = newTheme.text;
      }
    }

    // Update textarea
    if (bioInput) {
      // @ts-ignore
      if (bioInput.background) {
        // @ts-ignore
        bioInput.background.setBackgroundColor(newTheme.panelBackground);
      }
      // @ts-ignore
      if (bioInput.textDisplay) {
        // @ts-ignore
        bioInput.textDisplay.style.fill = newTheme.text;
      }
    }

    // Update checkboxes - access internal label
    if (notifyCheckbox) {
      // @ts-ignore - accessing private label property
      if (notifyCheckbox.label) {
        // @ts-ignore
        notifyCheckbox.label.setColor(newTheme.text);
      }
    }
    if (marketingCheckbox) {
      // @ts-ignore
      if (marketingCheckbox.label) {
        // @ts-ignore
        marketingCheckbox.label.setColor(newTheme.text);
      }
    }
    if (darkModeCheckbox) {
      // @ts-ignore
      if (darkModeCheckbox.label) {
        // @ts-ignore
        darkModeCheckbox.label.setColor(newTheme.text);
      }
    }

    // Note: UIButton doesn't have update methods, so we'd need to recreate it
    // For now, we'll leave it as-is since buttons are less critical for theme demo
  }

  // Initial form elements
  createFormElements(initialTheme, formContainer);

  // Listen for theme changes
  themeManager.addListener((newTheme, info) => {
    // Update form elements without recreating (maintains positioning)
    updateFormElementsTheme(newTheme);

    // Update section titles
    section1Title.setColor(newTheme.text);
    section2Title.setColor(newTheme.text);
  });

  // Add all sections
  mainContainer.addChild(section1Title);
  mainContainer.addChild(themeSelectorContainer);
  mainContainer.addChild(section2Title);
  mainContainer.addChild(formContainer);

  scrollContainer.addChild(mainContainer);

  return scrollContainer;
}

// Export theme manager for external access
export function getThemeManager(): ThemeManager<DefaultUITheme> | null {
  return globalThemeManager;
}

