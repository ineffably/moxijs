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

// Layout
export { FlexContainer, FlexDirection, FlexJustify, FlexAlign, FlexContainerProps } from './layout/flex-container';

// Components
export { UIBox, UIBoxProps } from './components/ui-box';
export { UILabel, UILabelProps, TextAlign } from './components/ui-label';
export { UIPanel, UIPanelProps, NineSliceConfig } from './components/ui-panel';
export { UIButton, UIButtonProps, ButtonState } from './components/ui-button';
export { UISelect, UISelectProps, SelectOption } from './components/ui-select';
export { UITextInput, UITextInputProps } from './components/ui-text-input';
export { UITabs, UITabsProps, TabItem } from './components/ui-tabs';
