import {
  Theme,
  ThemeInfo,
  createDarkTheme,
  createLightTheme,
  createThemesFromPalette,
  getTheme,
  getThemeInfo,
  getAllThemes,
  setTheme,
  setThemeByName,
  resetTheme,
  DARK_THEME,
  ALL_THEMES,
} from '../../src/theming/theme';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock palette for testing theme generators
const MOCK_PALETTE: number[] = [
  0x000000, // black (darkest)
  0x222222,
  0x444444,
  0x666666,
  0x888888,
  0xaaaaaa,
  0xcccccc,
  0xffffff, // white (lightest)
  0xff0000, // red (saturated - should be accent)
  0x00ff00, // green (saturated)
];

describe('Theme System', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    resetTheme();
  });

  describe('createDarkTheme', () => {
    it('should create a theme with all required properties', () => {
      const theme = createDarkTheme(MOCK_PALETTE);

      expect(theme).toHaveProperty('workspace');
      expect(theme).toHaveProperty('cardBackground');
      expect(theme).toHaveProperty('cardTitleBar');
      expect(theme).toHaveProperty('cardBorder');
      expect(theme).toHaveProperty('buttonBackground');
      expect(theme).toHaveProperty('bevelColor');
      expect(theme).toHaveProperty('accent');
      expect(theme).toHaveProperty('text');
    });

    it('should use dark colors for backgrounds', () => {
      const theme = createDarkTheme(MOCK_PALETTE);

      // Dark theme should have low luminance workspace/backgrounds
      expect(theme.workspace).toBeLessThan(0x888888);
      expect(theme.cardBackground).toBeLessThan(0x888888);
    });

    it('should use light color for text', () => {
      const theme = createDarkTheme(MOCK_PALETTE);

      // Text should be the lightest color
      expect(theme.text).toBe(0xffffff);
    });

    it('should select a saturated color for accent', () => {
      const theme = createDarkTheme(MOCK_PALETTE);

      // Accent should be one of the saturated colors (red or green)
      expect([0xff0000, 0x00ff00]).toContain(theme.accent);
    });

    it('should use darkest color for card border', () => {
      const theme = createDarkTheme(MOCK_PALETTE);

      expect(theme.cardBorder).toBe(0x000000);
    });
  });

  describe('createLightTheme', () => {
    it('should create a theme with all required properties', () => {
      const theme = createLightTheme(MOCK_PALETTE);

      expect(theme).toHaveProperty('workspace');
      expect(theme).toHaveProperty('cardBackground');
      expect(theme).toHaveProperty('cardTitleBar');
      expect(theme).toHaveProperty('cardBorder');
      expect(theme).toHaveProperty('buttonBackground');
      expect(theme).toHaveProperty('bevelColor');
      expect(theme).toHaveProperty('accent');
      expect(theme).toHaveProperty('text');
    });

    it('should use light colors for backgrounds', () => {
      const theme = createLightTheme(MOCK_PALETTE);

      // Light theme should have high luminance backgrounds
      expect(theme.workspace).toBeGreaterThan(0x666666);
      expect(theme.cardBackground).toBeGreaterThan(0x888888);
    });

    it('should use dark color for text', () => {
      const theme = createLightTheme(MOCK_PALETTE);

      // Text should be the darkest color
      expect(theme.text).toBe(0x000000);
    });

    it('should select a saturated color for accent', () => {
      const theme = createLightTheme(MOCK_PALETTE);

      // Accent should be one of the saturated colors
      expect([0xff0000, 0x00ff00]).toContain(theme.accent);
    });
  });

  describe('createThemesFromPalette', () => {
    it('should create both dark and light theme variants', () => {
      const themes = createThemesFromPalette('cc29');

      expect(themes).toHaveProperty('dark');
      expect(themes).toHaveProperty('light');
    });

    it('should include correct metadata in ThemeInfo', () => {
      const themes = createThemesFromPalette('cc29');

      expect(themes.dark.name).toBe('CC29 Dark');
      expect(themes.dark.palette).toBe('cc29');
      expect(themes.dark.variant).toBe('dark');
      expect(themes.dark.theme).toBeDefined();

      expect(themes.light.name).toBe('CC29 Light');
      expect(themes.light.palette).toBe('cc29');
      expect(themes.light.variant).toBe('light');
      expect(themes.light.theme).toBeDefined();
    });

    it('should work with different palette types', () => {
      const pico8Themes = createThemesFromPalette('pico8');
      const tic80Themes = createThemesFromPalette('tic80');

      expect(pico8Themes.dark.name).toBe('PICO8 Dark');
      expect(tic80Themes.light.name).toBe('TIC80 Light');
    });
  });

  describe('Theme State Management', () => {
    describe('getTheme', () => {
      it('should return the current theme', () => {
        const theme = getTheme();

        expect(theme).toHaveProperty('workspace');
        expect(theme).toHaveProperty('text');
        expect(theme).toHaveProperty('accent');
      });

      it('should return default dark theme initially', () => {
        const theme = getTheme();

        expect(theme).toEqual(DARK_THEME);
      });
    });

    describe('getThemeInfo', () => {
      it('should return theme info with metadata', () => {
        const info = getThemeInfo();

        expect(info).toHaveProperty('name');
        expect(info).toHaveProperty('palette');
        expect(info).toHaveProperty('variant');
        expect(info).toHaveProperty('theme');
      });

      it('should default to Dark theme', () => {
        const info = getThemeInfo();

        expect(info.name).toBe('Dark');
      });
    });

    describe('getAllThemes', () => {
      it('should return an array of theme infos', () => {
        const themes = getAllThemes();

        expect(Array.isArray(themes)).toBe(true);
        expect(themes.length).toBeGreaterThan(0);
      });

      it('should include themes with required properties', () => {
        const themes = getAllThemes();

        themes.forEach((themeInfo) => {
          expect(themeInfo).toHaveProperty('name');
          expect(themeInfo).toHaveProperty('palette');
          expect(themeInfo).toHaveProperty('variant');
          expect(themeInfo).toHaveProperty('theme');
          expect(['dark', 'light']).toContain(themeInfo.variant);
        });
      });
    });

    describe('setTheme', () => {
      it('should update the current theme', () => {
        const themes = getAllThemes();
        const newTheme = themes.find((t) => t.name !== 'Dark')!;

        setTheme(newTheme);

        expect(getThemeInfo().name).toBe(newTheme.name);
        expect(getTheme()).toEqual(newTheme.theme);
      });

      it('should persist theme to localStorage', () => {
        const themes = getAllThemes();
        const newTheme = themes.find((t) => t.name !== 'Dark')!;

        setTheme(newTheme);

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'pikcell-theme',
          newTheme.name
        );
      });
    });

    describe('setThemeByName', () => {
      it('should set theme when name exists', () => {
        const result = setThemeByName('Light');

        expect(result).toBe(true);
        expect(getThemeInfo().name).toBe('Light');
      });

      it('should return false for non-existent theme name', () => {
        const result = setThemeByName('NonExistent');

        expect(result).toBe(false);
        expect(getThemeInfo().name).toBe('Dark'); // unchanged
      });

      it('should persist valid theme to localStorage', () => {
        setThemeByName('Light');

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'pikcell-theme',
          'Light'
        );
      });
    });

    describe('resetTheme', () => {
      it('should reset to default dark theme', () => {
        setThemeByName('Light');
        expect(getThemeInfo().name).toBe('Light');

        resetTheme();

        expect(getThemeInfo().name).toBe('Dark');
        expect(getTheme()).toEqual(DARK_THEME);
      });
    });
  });

  describe('Theme Structure Validation', () => {
    it('should have all theme properties as numbers', () => {
      const theme = getTheme();
      const properties: (keyof Theme)[] = [
        'workspace',
        'cardBackground',
        'cardTitleBar',
        'cardBorder',
        'buttonBackground',
        'bevelColor',
        'accent',
        'text',
      ];

      properties.forEach((prop) => {
        expect(typeof theme[prop]).toBe('number');
        expect(theme[prop]).toBeGreaterThanOrEqual(0);
        expect(theme[prop]).toBeLessThanOrEqual(0xffffff);
      });
    });

    it('ALL_THEMES should match getAllThemes()', () => {
      expect(ALL_THEMES).toEqual(getAllThemes());
    });
  });
});
