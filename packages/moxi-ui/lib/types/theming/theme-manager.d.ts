export interface BaseTheme {
    [key: string]: number;
}
export type ThemeVariant = 'dark' | 'light';
export interface ThemeInfo<T extends BaseTheme = BaseTheme> {
    name: string;
    variant: ThemeVariant;
    theme: T;
    description?: string;
    metadata?: Record<string, unknown>;
}
export type ThemeChangeListener<T extends BaseTheme = BaseTheme> = (theme: T, info: ThemeInfo<T>) => void;
export declare class ThemeManager<T extends BaseTheme = BaseTheme> {
    private themes;
    private currentThemeName;
    private listeners;
    private storageKey;
    constructor(storageKey: string, defaultThemeName?: string);
    registerTheme(themeInfo: ThemeInfo<T>): void;
    registerThemes(themes: ThemeInfo<T>[]): void;
    getTheme(): T;
    getThemeInfo(): ThemeInfo<T>;
    getAllThemes(): ThemeInfo<T>[];
    getThemesByVariant(variant: ThemeVariant): ThemeInfo<T>[];
    setTheme(name: string): boolean;
    setThemeInfo(themeInfo: ThemeInfo<T>): void;
    addListener(listener: ThemeChangeListener<T>): void;
    removeListener(listener: ThemeChangeListener<T>): void;
    private notifyListeners;
    private saveToStorage;
    private loadFromStorage;
    clearStorage(): void;
}
export type { DefaultUITheme } from './theme-data';
export { createDefaultDarkTheme, createDefaultLightTheme } from './theme-data';
export { ThemeResolver, type ColorType, type ControlType } from './theme-resolver';
