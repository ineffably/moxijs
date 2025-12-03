import { ThemeManager, ThemeInfo, BaseTheme } from '../../src/theming/theme-manager';

// Test theme type
interface TestTheme extends BaseTheme {
  background: number;
  text: number;
  accent: number;
}

// Test themes
const darkTheme: ThemeInfo<TestTheme> = {
  name: 'Dark',
  variant: 'dark',
  theme: { background: 0x1e1e1e, text: 0xffffff, accent: 0x4a90e2 }
};

const lightTheme: ThemeInfo<TestTheme> = {
  name: 'Light',
  variant: 'light',
  theme: { background: 0xffffff, text: 0x1e1e1e, accent: 0x4a90e2 }
};

const anotherDarkTheme: ThemeInfo<TestTheme> = {
  name: 'Midnight',
  variant: 'dark',
  theme: { background: 0x0a0a0a, text: 0xcccccc, accent: 0x6a5acd }
};

describe('ThemeManager', () => {
  let manager: ThemeManager<TestTheme>;

  beforeEach(() => {
    manager = new ThemeManager<TestTheme>('test-theme');
  });

  describe('registerTheme', () => {
    it('should register a theme', () => {
      manager.registerTheme(darkTheme);

      expect(manager.getAllThemes()).toHaveLength(1);
      expect(manager.getAllThemes()[0].name).toBe('Dark');
    });

    it('should set first registered theme as current', () => {
      manager.registerTheme(darkTheme);

      expect(manager.getTheme()).toBe(darkTheme.theme);
    });

    it('should not change current theme when registering additional themes', () => {
      manager.registerTheme(darkTheme);
      manager.registerTheme(lightTheme);

      expect(manager.getThemeInfo().name).toBe('Dark');
    });
  });

  describe('registerThemes', () => {
    it('should register multiple themes at once', () => {
      manager.registerThemes([darkTheme, lightTheme]);

      expect(manager.getAllThemes()).toHaveLength(2);
    });
  });

  describe('getTheme', () => {
    it('should return current theme', () => {
      manager.registerTheme(darkTheme);

      const theme = manager.getTheme();

      expect(theme.background).toBe(0x1e1e1e);
      expect(theme.text).toBe(0xffffff);
    });

    it('should throw if no theme set', () => {
      expect(() => manager.getTheme()).toThrow('No theme set');
    });
  });

  describe('getThemeInfo', () => {
    it('should return current theme info', () => {
      manager.registerTheme(darkTheme);

      const info = manager.getThemeInfo();

      expect(info.name).toBe('Dark');
      expect(info.variant).toBe('dark');
    });

    it('should throw if no theme set', () => {
      expect(() => manager.getThemeInfo()).toThrow('No theme set');
    });
  });

  describe('getAllThemes', () => {
    it('should return all registered themes', () => {
      manager.registerThemes([darkTheme, lightTheme, anotherDarkTheme]);

      const themes = manager.getAllThemes();

      expect(themes).toHaveLength(3);
    });

    it('should return empty array if no themes', () => {
      expect(manager.getAllThemes()).toHaveLength(0);
    });
  });

  describe('getThemesByVariant', () => {
    it('should filter by dark variant', () => {
      manager.registerThemes([darkTheme, lightTheme, anotherDarkTheme]);

      const darkThemes = manager.getThemesByVariant('dark');

      expect(darkThemes).toHaveLength(2);
      expect(darkThemes.every(t => t.variant === 'dark')).toBe(true);
    });

    it('should filter by light variant', () => {
      manager.registerThemes([darkTheme, lightTheme, anotherDarkTheme]);

      const lightThemes = manager.getThemesByVariant('light');

      expect(lightThemes).toHaveLength(1);
      expect(lightThemes[0].name).toBe('Light');
    });
  });

  describe('setTheme', () => {
    it('should change current theme by name', () => {
      manager.registerThemes([darkTheme, lightTheme]);

      const result = manager.setTheme('Light');

      expect(result).toBe(true);
      expect(manager.getThemeInfo().name).toBe('Light');
    });

    it('should return false for unknown theme', () => {
      manager.registerTheme(darkTheme);

      const result = manager.setTheme('Unknown');

      expect(result).toBe(false);
      expect(manager.getThemeInfo().name).toBe('Dark');
    });
  });

  describe('setThemeInfo', () => {
    it('should register and set theme', () => {
      manager.setThemeInfo(darkTheme);

      expect(manager.getThemeInfo().name).toBe('Dark');
    });
  });

  describe('listeners', () => {
    it('should notify listeners on theme change', () => {
      const listener = jest.fn();
      manager.registerThemes([darkTheme, lightTheme]);
      manager.addListener(listener);

      manager.setTheme('Light');

      expect(listener).toHaveBeenCalledWith(lightTheme.theme, lightTheme);
    });

    it('should notify listeners on first theme registration', () => {
      const listener = jest.fn();
      manager.addListener(listener);

      manager.registerTheme(darkTheme);

      expect(listener).toHaveBeenCalledWith(darkTheme.theme, darkTheme);
    });

    it('should remove listener', () => {
      const listener = jest.fn();
      manager.registerThemes([darkTheme, lightTheme]);
      manager.addListener(listener);
      manager.removeListener(listener);

      manager.setTheme('Light');

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('metadata', () => {
    it('should store and retrieve theme metadata', () => {
      const themeWithMeta: ThemeInfo<TestTheme> = {
        ...darkTheme,
        description: 'A dark theme',
        metadata: { author: 'Test', version: '1.0' }
      };

      manager.registerTheme(themeWithMeta);

      const info = manager.getThemeInfo();
      expect(info.description).toBe('A dark theme');
      expect(info.metadata?.author).toBe('Test');
    });
  });
});
