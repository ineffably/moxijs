import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { ThemeResolver } from '../theming/theme-resolver';
export interface UITextInputProps {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
    width?: number;
    height?: number;
    disabled?: boolean;
    backgroundColor?: number;
    textColor?: number;
    placeholderColor?: number;
    borderRadius?: number;
    fontSize?: number;
    type?: 'text' | 'number';
    themeResolver?: ThemeResolver;
}
export declare class UITextInput extends UIComponent {
    private props;
    private onChange?;
    private currentValue;
    private background;
    private textDisplay;
    private cursor;
    private cursorPosition;
    private cursorBlinkInterval?;
    private cursorVisible;
    constructor(props: UITextInputProps, boxModel?: Partial<BoxModel>);
    private getDisplayText;
    private setupInteractivity;
    private handlePointerDown;
    onFocus(): void;
    onBlur(): void;
    private handleKeyDown;
    private updateText;
    private updateCursor;
    private startCursorBlink;
    private stopCursorBlink;
    private lightenColor;
    measure(): MeasuredSize;
    layout(availableWidth: number, availableHeight: number): void;
    protected render(): void;
    setValue(value: string): void;
    getValue(): string;
    destroy(): void;
}
