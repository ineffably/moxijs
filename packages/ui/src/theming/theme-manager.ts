/**
 * Generic Theme System for MoxiJS UI Components
 * 
 * Provides a flexible, extensible theming system that can be used by any application.
 * Supports theme registration, switching, persistence, and change notifications.
 */

/**
 * Base theme interface - applications can extend this
 */
export interface BaseTheme {
  [key: string]: number; // All theme values are color numbers (hex)
}

/**
 * Theme variant type
 */
export type ThemeVariant = 'dark' | 'light';

/**
 * Theme metadata
 */
export interface ThemeInfo<T extends BaseTheme = BaseTheme> {
  name: string;
  variant: ThemeVariant;
  theme: T;
  description?: string;
  metadata?: Record<string, unknown>; // Additional metadata
}

/**
 * Theme change listener callback
 */
export type ThemeChangeListener<T extends BaseTheme = BaseTheme> = (theme: T, info: ThemeInfo<T>) => void;

/**
 * Generic Theme Manager
 * 
 * Manages theme state, persistence, and change notifications.
 * Applications can register themes and switch between them.
 * 
 * @example
 * ```typescript
 * // Define your theme interface
 * interface MyTheme extends BaseTheme {
 *   background: number;
 *   text: number;
 *   accent: number;
 * }
 * 
 * // Create theme manager
 * const themeManager = new ThemeManager<MyTheme>('my-app-theme');
 * 
 * // Register themes
 * themeManager.registerTheme({
 *   name: 'Dark',
 *   variant: 'dark',
 *   theme: { background: 0x1e1e1e, text: 0xffffff, accent: 0x4a90e2 }
 * });
 * 
 * // Set theme
 * themeManager.setTheme('Dark');
 * 
 * // Get current theme
 * const theme = themeManager.getTheme();
 * ```
 */
export class ThemeManager<T extends BaseTheme = BaseTheme> {
  private themes: Map<string, ThemeInfo<T>> = new Map();
  private currentThemeName: string | null = null;
  private listeners: Set<ThemeChangeListener<T>> = new Set();
  private storageKey: string;

  /**
   * @param storageKey - Key for localStorage persistence (e.g., 'my-app-theme')
   * @param defaultThemeName - Default theme name to use if none is set
   */
  constructor(storageKey: string, defaultThemeName?: string) {
    this.storageKey = storageKey;
    
    // Try to load saved theme
    if (defaultThemeName) {
      const saved = this.loadFromStorage();
      if (saved && this.themes.has(saved)) {
        this.currentThemeName = saved;
      } else {
        this.currentThemeName = defaultThemeName;
      }
    } else {
      const saved = this.loadFromStorage();
      if (saved && this.themes.has(saved)) {
        this.currentThemeName = saved;
      }
    }
  }

  /**
   * Register a theme
   */
  public registerTheme(themeInfo: ThemeInfo<T>): void {
    this.themes.set(themeInfo.name, themeInfo);
    
    // If this is the first theme and we don't have a current theme, set it
    if (!this.currentThemeName && this.themes.size === 1) {
      this.currentThemeName = themeInfo.name;
      this.saveToStorage(themeInfo.name);
      this.notifyListeners();
    }
  }

  /**
   * Register multiple themes at once
   */
  public registerThemes(themes: ThemeInfo<T>[]): void {
    themes.forEach(theme => this.registerTheme(theme));
  }

  /**
   * Get the current theme
   */
  public getTheme(): T {
    if (!this.currentThemeName) {
      throw new Error('No theme set. Register themes first.');
    }
    const themeInfo = this.themes.get(this.currentThemeName);
    if (!themeInfo) {
      throw new Error(`Theme "${this.currentThemeName}" not found.`);
    }
    return themeInfo.theme;
  }

  /**
   * Get the current theme info
   */
  public getThemeInfo(): ThemeInfo<T> {
    if (!this.currentThemeName) {
      throw new Error('No theme set. Register themes first.');
    }
    const themeInfo = this.themes.get(this.currentThemeName);
    if (!themeInfo) {
      throw new Error(`Theme "${this.currentThemeName}" not found.`);
    }
    return themeInfo;
  }

  /**
   * Get all registered themes
   */
  public getAllThemes(): ThemeInfo<T>[] {
    return Array.from(this.themes.values());
  }

  /**
   * Get themes by variant
   */
  public getThemesByVariant(variant: ThemeVariant): ThemeInfo<T>[] {
    return Array.from(this.themes.values()).filter(t => t.variant === variant);
  }

  /**
   * Set theme by name
   */
  public setTheme(name: string): boolean {
    if (!this.themes.has(name)) {
      return false;
    }
    this.currentThemeName = name;
    this.saveToStorage(name);
    this.notifyListeners();
    return true;
  }

  /**
   * Set theme by ThemeInfo
   */
  public setThemeInfo(themeInfo: ThemeInfo<T>): void {
    this.registerTheme(themeInfo); // Ensure it's registered
    this.setTheme(themeInfo.name);
  }

  /**
   * Add a theme change listener
   */
  public addListener(listener: ThemeChangeListener<T>): void {
    this.listeners.add(listener);
  }

  /**
   * Remove a theme change listener
   */
  public removeListener(listener: ThemeChangeListener<T>): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of theme change
   */
  private notifyListeners(): void {
    const theme = this.getTheme();
    const info = this.getThemeInfo();
    this.listeners.forEach(listener => listener(theme, info));
  }

  /**
   * Save theme name to localStorage
   */
  private saveToStorage(themeName: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(this.storageKey, themeName);
    } catch {
      // localStorage might not be available or quota exceeded
    }
  }

  /**
   * Load theme name from localStorage
   */
  private loadFromStorage(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      return window.localStorage.getItem(this.storageKey);
    } catch {
      return null;
    }
  }

  /**
   * Clear persisted theme
   */
  public clearStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.removeItem(this.storageKey);
    } catch {
      // Ignore errors
    }
  }
}

// Re-export theme data types and functions
export type { DefaultUITheme } from './theme-data';
export { createDefaultDarkTheme, createDefaultLightTheme } from './theme-data';

// Re-export theme resolver
export { ThemeResolver, type ColorType, type ControlType } from './theme-resolver';

