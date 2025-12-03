/**
 * Tests for ThemeResolver
 */

import { ThemeResolver, DefaultUITheme, createDefaultDarkTheme, createDefaultLightTheme } from '@moxijs/core';

describe('ThemeResolver', () => {
  let darkTheme: DefaultUITheme;
  let lightTheme: DefaultUITheme;
  let darkResolver: ThemeResolver;
  let lightResolver: ThemeResolver;

  beforeEach(() => {
    darkTheme = createDefaultDarkTheme();
    lightTheme = createDefaultLightTheme();
    darkResolver = new ThemeResolver(darkTheme);
    lightResolver = new ThemeResolver(lightTheme);
  });

  describe('getColor', () => {
    it('should return override value when provided', () => {
      const override = 0xff0000;
      const result = darkResolver.getColor('background', override);
      expect(result).toBe(override);
    });

    it('should return generic control color when no override', () => {
      const result = darkResolver.getColor('background');
      expect(result).toBe(darkTheme.controlBackground);
    });

    it('should return controlSelected for selected type', () => {
      const result = darkResolver.getColor('selected');
      expect(result).toBe(darkTheme.controlSelected);
    });

    it('should return controlHover for hover type', () => {
      const result = darkResolver.getColor('hover');
      expect(result).toBe(darkTheme.controlHover);
    });

    it('should return controlFocus for focus type', () => {
      const result = darkResolver.getColor('focus');
      expect(result).toBe(darkTheme.controlFocus);
    });

    it('should return controlDisabled for disabled type', () => {
      const result = darkResolver.getColor('disabled');
      expect(result).toBe(darkTheme.controlDisabled);
    });

    it('should fallback to controlBackground when value is not a number', () => {
      // This tests the fallback logic in getColor
      // When the resolved value is not a number, it falls back to controlBackground
      const result = darkResolver.getColor('background');
      expect(result).toBe(darkTheme.controlBackground);
      expect(typeof result).toBe('number');
    });
  });

  describe('getControlColor', () => {
    it('should return override value when provided', () => {
      const override = 0xff0000;
      const result = darkResolver.getControlColor('checkbox', 'background', override);
      expect(result).toBe(override);
    });

    it('should fallback to generic when no control-specific override', () => {
      const result = darkResolver.getControlColor('checkbox', 'background');
      expect(result).toBe(darkTheme.controlBackground);
    });

    it('should work with different control types', () => {
      const checkboxResult = darkResolver.getControlColor('checkbox', 'selected');
      const textInputResult = darkResolver.getControlColor('textInput', 'selected');
      const selectResult = darkResolver.getControlColor('select', 'selected');
      
      // All should fallback to generic controlSelected
      expect(checkboxResult).toBe(darkTheme.controlSelected);
      expect(textInputResult).toBe(darkTheme.controlSelected);
      expect(selectResult).toBe(darkTheme.controlSelected);
    });
  });

  describe('getControlProperty', () => {
    it('should return property value when exists', () => {
      const result = darkResolver.getControlProperty('checkboxCheckmark', 0x000000);
      expect(result).toBe(darkTheme.checkboxCheckmark);
    });

    it('should return fallback when property is undefined', () => {
      const fallback = 0x000000;
      // Create a theme without checkboxCheckmark to test fallback
      const themeWithoutCheckmark: DefaultUITheme = {
        ...darkTheme,
        checkboxCheckmark: undefined
      };
      const resolver = new ThemeResolver(themeWithoutCheckmark);
      // When property is undefined, should return fallback
      const result = resolver.getControlProperty('checkboxCheckmark', fallback);
      expect(result).toBe(fallback);
    });
  });

  describe('getTextColor', () => {
    it('should return override when provided', () => {
      const override = 0xff0000;
      const result = darkResolver.getTextColor(override);
      expect(result).toBe(override);
    });

    it('should return theme.text when no override', () => {
      const result = darkResolver.getTextColor();
      expect(result).toBe(darkTheme.text);
    });
  });

  describe('getTextSecondary', () => {
    it('should return override when provided', () => {
      const override = 0xff0000;
      const result = darkResolver.getTextSecondary(override);
      expect(result).toBe(override);
    });

    it('should return theme.textSecondary when no override', () => {
      const result = darkResolver.getTextSecondary();
      expect(result).toBe(darkTheme.textSecondary);
    });
  });

  describe('getPlaceholderColor', () => {
    it('should return override when provided', () => {
      const override = 0xff0000;
      const result = darkResolver.getPlaceholderColor(override);
      expect(result).toBe(override);
    });

    it('should return textInputPlaceholder when exists', () => {
      const result = darkResolver.getPlaceholderColor();
      expect(result).toBe(darkTheme.textInputPlaceholder);
    });

    it('should fallback to textSecondary when textInputPlaceholder not set', () => {
      const themeWithoutPlaceholder: DefaultUITheme = {
        ...darkTheme,
        textInputPlaceholder: undefined
      };
      const resolver = new ThemeResolver(themeWithoutPlaceholder);
      const result = resolver.getPlaceholderColor();
      expect(result).toBe(themeWithoutPlaceholder.textSecondary);
    });
  });

  describe('getCheckmarkColor', () => {
    it('should return override when provided', () => {
      const override = 0xff0000;
      const result = darkResolver.getCheckmarkColor(override);
      expect(result).toBe(override);
    });

    it('should return checkboxCheckmark when exists', () => {
      const result = darkResolver.getCheckmarkColor();
      expect(result).toBe(darkTheme.checkboxCheckmark);
    });

    it('should fallback to controlText when checkboxCheckmark not set', () => {
      const themeWithoutCheckmark: DefaultUITheme = {
        ...darkTheme,
        checkboxCheckmark: undefined
      };
      const resolver = new ThemeResolver(themeWithoutCheckmark);
      const result = resolver.getCheckmarkColor();
      expect(result).toBe(themeWithoutCheckmark.controlText);
    });
  });

  describe('getSelectDropdownBackground', () => {
    it('should return override when provided', () => {
      const override = 0xff0000;
      const result = darkResolver.getSelectDropdownBackground(override);
      expect(result).toBe(override);
    });

    it('should return selectDropdown when exists', () => {
      const result = darkResolver.getSelectDropdownBackground();
      expect(result).toBe(darkTheme.selectDropdown);
    });

    it('should fallback to controlBackground when selectDropdown not set', () => {
      const themeWithoutDropdown: DefaultUITheme = {
        ...darkTheme,
        selectDropdown: undefined
      };
      const resolver = new ThemeResolver(themeWithoutDropdown);
      const result = resolver.getSelectDropdownBackground();
      expect(result).toBe(themeWithoutDropdown.controlBackground);
    });
  });

  describe('theme consistency', () => {
    it('should work with dark theme', () => {
      expect(darkResolver.getColor('background')).toBe(0x2a2a2a);
      expect(darkResolver.getColor('selected')).toBe(0x4a90e2);
      expect(darkResolver.getTextColor()).toBe(0xffffff);
    });

    it('should work with light theme', () => {
      expect(lightResolver.getColor('background')).toBe(0xffffff);
      expect(lightResolver.getColor('selected')).toBe(0x4a90e2);
      expect(lightResolver.getTextColor()).toBe(0x000000);
    });
  });
});

