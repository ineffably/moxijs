import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
export type TextAlign = 'left' | 'center' | 'right';
export interface UILabelProps {
    text: string;
    fontSize?: number;
    fontFamily?: string;
    color?: number;
    align?: TextAlign;
    wordWrap?: boolean;
    wordWrapWidth?: number;
    fontWeight?: string;
    lineHeight?: number;
}
export declare class UILabel extends UIComponent {
    private props;
    private textObject;
    constructor(props: UILabelProps, boxModel?: Partial<BoxModel>);
    private getTextStyle;
    measure(): MeasuredSize;
    layout(availableWidth: number, availableHeight: number): void;
    protected render(): void;
    setText(text: string): void;
    setColor(color: number): void;
    setFontSize(size: number): void;
    getText(): string;
}
