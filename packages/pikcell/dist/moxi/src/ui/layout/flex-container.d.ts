import { UIComponent } from '../core/ui-component';
import { MeasuredSize } from '../core/box-model';
import { EdgeInsets } from '../core/edge-insets';
/**
 * Flexbox direction (how children are arranged)
 *
 * @category UI
 */
export declare enum FlexDirection {
    Row = "row",// Horizontal, left to right
    RowReverse = "row-reverse",
    Column = "column",// Vertical, top to bottom
    ColumnReverse = "column-reverse"
}
/**
 * Flexbox justify content (main axis alignment)
 *
 * @category UI
 */
export declare enum FlexJustify {
    Start = "start",// Pack items to start
    End = "end",// Pack items to end
    Center = "center",// Center items
    SpaceBetween = "space-between",// Space between items
    SpaceAround = "space-around",// Space around items
    SpaceEvenly = "space-evenly"
}
/**
 * Flexbox align items (cross axis alignment)
 *
 * @category UI
 */
export declare enum FlexAlign {
    Start = "start",
    End = "end",
    Center = "center",
    Stretch = "stretch"
}
/**
 * Props for configuring a FlexContainer
 *
 * @category UI
 */
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
/**
 * A flexbox-style layout container
 * Arranges children in rows or columns with flexible sizing and alignment
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const container = new FlexContainer({
 *   direction: FlexDirection.Row,
 *   justify: FlexJustify.Center,
 *   gap: 10,
 *   padding: EdgeInsets.all(20)
 * });
 *
 * container.addChild(box1);
 * container.addChild(box2);
 * container.addChild(box3);
 * ```
 */
export declare class FlexContainer extends UIComponent {
    private props;
    children: UIComponent[];
    constructor(props?: FlexContainerProps);
    /**
     * Adds a child component to this container
     */
    addChild(child: UIComponent): void;
    /**
     * Removes a child component from this container
     */
    removeChild(child: UIComponent): void;
    /**
     * Measures the size needed for this container and its children
     */
    measure(): MeasuredSize;
    /**
     * Performs layout for this container and positions children
     */
    layout(availableWidth: number, availableHeight: number): void;
    /**
     * Layouts and positions child components
     */
    private layoutChildren;
    /**
     * Renders the container (currently no visual representation)
     */
    protected render(): void;
}
