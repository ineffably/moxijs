import { UIComponent } from '../core/ui-component';
import { MeasuredSize } from '../core/box-model';
import { EdgeInsets } from '../core/edge-insets';
export declare enum FlexDirection {
    Row = "row",
    RowReverse = "row-reverse",
    Column = "column",
    ColumnReverse = "column-reverse"
}
export declare enum FlexJustify {
    Start = "start",
    End = "end",
    Center = "center",
    SpaceBetween = "space-between",
    SpaceAround = "space-around",
    SpaceEvenly = "space-evenly"
}
export declare enum FlexAlign {
    Start = "start",
    End = "end",
    Center = "center",
    Stretch = "stretch"
}
export interface FlexContainerProps {
    direction?: FlexDirection;
    justify?: FlexJustify;
    align?: FlexAlign;
    gap?: number;
    wrap?: boolean;
    padding?: EdgeInsets;
    width?: number | 'fill';
    height?: number | 'fill';
}
export declare class FlexContainer extends UIComponent {
    private props;
    children: UIComponent[];
    constructor(props?: FlexContainerProps);
    addChild(child: UIComponent): void;
    removeChild(child: UIComponent): void;
    measure(): MeasuredSize;
    layout(availableWidth: number, availableHeight: number): void;
    private layoutChildren;
    protected render(): void;
}
