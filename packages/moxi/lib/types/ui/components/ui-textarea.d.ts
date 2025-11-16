import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
export interface UITextAreaProps {
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
    lineHeight?: number;
    rows?: number;
}
export declare class UITextArea extends UIComponent {
    private props;
    private onChange?;
    private currentValue;
    private background;
    private textDisplay;
    private cursor;
    private cursorPosition;
    private cursorBlinkInterval?;
    private cursorVisible;
    constructor(props: UITextAreaProps, boxModel?: Partial<BoxModel>);
    private getDisplayText;
    private setupInteractivity;
    private handlePointerDown;
    onFocus(): void;
    onBlur(): void;
    private handleKeyDown;
    private moveCursorVertically;
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
