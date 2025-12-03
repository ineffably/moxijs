/**
 * Theming System
 * 
 * Provides a generic, extensible theming system for UI components.
 * 
 * Architecture:
 * - theme-data.ts: Pure data structures (DefaultUITheme, theme creators)
 * - theme-resolver.ts: Color resolution logic (ThemeResolver)
 * - theme-manager.ts: Theme management (ThemeManager, registration, switching)
 */

export {
  BaseTheme,
  ThemeVariant,
  ThemeInfo,
  ThemeChangeListener,
  ThemeManager
} from './theme-manager';

export {
  DefaultUITheme,
  createDefaultDarkTheme,
  createDefaultLightTheme,
  UI_DEFAULTS
} from './theme-data';

export {
  ThemeResolver,
  type ColorType,
  type ControlType
} from './theme-resolver';

