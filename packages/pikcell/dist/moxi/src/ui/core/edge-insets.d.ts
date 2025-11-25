/**
 * Represents spacing values for the edges of a box (top, right, bottom, left).
 * Similar to CSS padding/margin syntax.
 *
 * @category UI
 */
export declare class EdgeInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
    /**
     * Creates an EdgeInsets with specific values for each edge
     *
     * @param top - Top edge spacing
     * @param right - Right edge spacing
     * @param bottom - Bottom edge spacing
     * @param left - Left edge spacing
     */
    constructor(top: number, right: number, bottom: number, left: number);
    /**
     * Creates EdgeInsets with the same value for all edges
     * Similar to CSS: padding: 10px
     *
     * @param value - The value to apply to all edges
     * @example
     * ```typescript
     * const padding = EdgeInsets.all(20); // 20px on all sides
     * ```
     */
    static all(value: number): EdgeInsets;
    /**
     * Creates EdgeInsets with symmetric vertical and horizontal values
     * Similar to CSS: padding: 10px 20px
     *
     * @param vertical - Value for top and bottom edges
     * @param horizontal - Value for left and right edges
     * @example
     * ```typescript
     * const padding = EdgeInsets.symmetric(10, 20); // 10px top/bottom, 20px left/right
     * ```
     */
    static symmetric(vertical: number, horizontal: number): EdgeInsets;
    /**
     * Creates EdgeInsets with specific values for individual edges
     * Similar to CSS: padding-top, padding-right, etc.
     *
     * @param edges - Object with optional top, right, bottom, left values (defaults to 0)
     * @example
     * ```typescript
     * const padding = EdgeInsets.only({ top: 10, left: 20 }); // 10px top, 20px left, 0px right/bottom
     * ```
     */
    static only(edges: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    }): EdgeInsets;
    /**
     * Creates EdgeInsets with zero spacing on all edges
     * Similar to CSS: padding: 0
     */
    static zero(): EdgeInsets;
    /**
     * Gets the total horizontal spacing (left + right)
     */
    get horizontal(): number;
    /**
     * Gets the total vertical spacing (top + bottom)
     */
    get vertical(): number;
    /**
     * Creates a copy of these EdgeInsets
     */
    clone(): EdgeInsets;
}
