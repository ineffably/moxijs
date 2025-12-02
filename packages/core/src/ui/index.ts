/**
 * Moxi UI System
 * Flexbox-inspired UI layout with ECS integration
 *
 * @packageDocumentation
 * @category UI
 */

// Core
export { EdgeInsets } from './core/edge-insets';
export { BoxModel, ComputedLayout, MeasuredSize, SizeConstraint, createDefaultBoxModel } from './core/box-model';
export { UIComponent } from './core/ui-component';
export { UIFocusManager, Focusable } from './core/ui-focus-manager';

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

// Components
export { UIBox, UIBoxProps } from './components/ui-box';
export { UILabel, UILabelProps, TextAlign } from './components/ui-label';
export { UIPanel, UIPanelProps, NineSliceConfig } from './components/ui-panel';
export { UIButton, UIButtonProps, ButtonState } from './components/ui-button';
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
