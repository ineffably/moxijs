/**
 * Moxi UI System
 * Flexbox-inspired UI layout with ECS integration
 *
 * @packageDocumentation
 * @category UI
 */

// Core
export { EdgeInsets } from './base/edge-insets';
export { BoxModel, ComputedLayout, MeasuredSize, SizeConstraint, createDefaultBoxModel } from './base/box-model';
export { UIComponent, UIFontConfig } from './base/ui-component';
export { UIFocusManager, Focusable } from './base/ui-focus-manager';

// Services (Composition services for UI components)
export {
  LayoutEngine,
  SizeConstraints,
  FormStateManager,
  FormStateConfig,
  TextInputHandler,
  TextInputHandlerConfig,
  ThemeApplier,
  ComponentState
} from './services';

// Layout
export { FlexContainer, FlexDirection, FlexJustify, FlexAlign, FlexContainerProps } from './layout/flex-container';

// Theming
export {
  ThemeManager,
  ThemeResolver,
  createDefaultDarkTheme,
  createDefaultLightTheme
} from './theming';
export type {
  BaseTheme,
  ThemeVariant,
  ThemeInfo,
  ThemeChangeListener,
  DefaultUITheme,
  ColorType,
  ControlType
} from './theming';

// Components
export { UIBox, UIBoxProps } from './components/ui-box';
export { UILabel, UILabelProps, TextAlign } from './components/ui-label';
export { UIPanel, UIPanelProps, NineSliceConfig } from './components/ui-panel';
export { UIButton, UIButtonProps, ButtonState, SpriteBackgroundConfig } from './components/ui-button';
export { UICheckbox, UICheckboxProps } from './components/ui-checkbox';
export { UICheckboxWithLabel, UICheckboxWithLabelProps } from './components/ui-checkbox-with-label';
export { UIRadioButton, UIRadioButtonProps } from './components/ui-radio-button';
export { UIRadioGroup, UIRadioGroupProps, RadioOption } from './components/ui-radio-group';
export { UISelect, UISelectProps, SelectOption } from './components/ui-select';
export { UITextInput, UITextInputProps } from './components/ui-text-input';
export { UITextArea, UITextAreaProps } from './components/ui-textarea';
export { UIScrollContainer, UIScrollContainerProps } from './components/ui-scroll-container';
export { UITabs, UITabsProps, TabItem } from './components/ui-tabs';

// Card Panel (flexible card with title/body/footer sections)
export {
  CardPanel,
  CardPanelProps,
  CardPanelTitle,
  CardPanelFooter,
  DrawIconFn,
  ResizeDirection,
  BaseCardStyle,
  CardStyle,
  CardThemeColors,
  CardSectionDimensions,
  FlatCardStyle,
  FlatCardStyleConfig
} from './components/card-panel';

// UI Layer and scaling
export { UILayer, UILayerOptions } from './UILayer';
export { UIScaleMode } from './UIScaleMode';

// Re-exported from @moxijs/core
// Pixel grid utilities
export { PixelGrid, px, units, GRID, BORDER, createBorderConfig } from '@moxijs/core';
export type { PixelGridConfig, BorderConfig } from '@moxijs/core';

// Helper for DPR-scaled text
export { asTextDPR, TextDPROptions, PixiProps } from '@moxijs/core';

// Font loading utility (commonly needed before using UI components)
export { loadFonts } from '@moxijs/core';
