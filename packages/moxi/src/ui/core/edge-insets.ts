/**
 * Represents spacing values for the edges of a box (top, right, bottom, left).
 * Similar to CSS padding/margin syntax.
 *
 * @category UI
 */
export class EdgeInsets {
  /**
   * Creates an EdgeInsets with specific values for each edge
   *
   * @param top - Top edge spacing
   * @param right - Right edge spacing
   * @param bottom - Bottom edge spacing
   * @param left - Left edge spacing
   */
  constructor(
    public top: number,
    public right: number,
    public bottom: number,
    public left: number
  ) {}

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
  static all(value: number): EdgeInsets {
    return new EdgeInsets(value, value, value, value);
  }

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
  static symmetric(vertical: number, horizontal: number): EdgeInsets {
    return new EdgeInsets(vertical, horizontal, vertical, horizontal);
  }

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
  static only(edges: { top?: number; right?: number; bottom?: number; left?: number }): EdgeInsets {
    return new EdgeInsets(
      edges.top ?? 0,
      edges.right ?? 0,
      edges.bottom ?? 0,
      edges.left ?? 0
    );
  }

  /**
   * Creates EdgeInsets with zero spacing on all edges
   * Similar to CSS: padding: 0
   */
  static zero(): EdgeInsets {
    return new EdgeInsets(0, 0, 0, 0);
  }

  /**
   * Gets the total horizontal spacing (left + right)
   */
  get horizontal(): number {
    return this.left + this.right;
  }

  /**
   * Gets the total vertical spacing (top + bottom)
   */
  get vertical(): number {
    return this.top + this.bottom;
  }

  /**
   * Creates a copy of these EdgeInsets
   */
  clone(): EdgeInsets {
    return new EdgeInsets(this.top, this.right, this.bottom, this.left);
  }
}
