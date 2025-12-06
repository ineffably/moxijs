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

  /**
   * Creates EdgeInsets from flexible input.
   * Accepts a number (all sides equal), an EdgeInsets instance, or an object with individual sides.
   *
   * @param input - Number, EdgeInsets, or object with edge values
   * @example
   * ```typescript
   * EdgeInsets.from(10);                    // All sides 10
   * EdgeInsets.from({ top: 5, left: 10 }); // Top 5, left 10, others 0
   * EdgeInsets.from(existingInsets);       // Clone
   * ```
   */
  static from(
    input:
      | number
      | EdgeInsets
      | { top?: number; right?: number; bottom?: number; left?: number }
      | undefined
  ): EdgeInsets {
    if (input === undefined) {
      return EdgeInsets.zero();
    }
    if (typeof input === 'number') {
      return EdgeInsets.all(input);
    }
    if (input instanceof EdgeInsets) {
      return input.clone();
    }
    return new EdgeInsets(
      input.top ?? 0,
      input.right ?? 0,
      input.bottom ?? 0,
      input.left ?? 0
    );
  }

  /**
   * Checks if this EdgeInsets equals another
   */
  equals(other: EdgeInsets): boolean {
    return (
      this.top === other.top &&
      this.right === other.right &&
      this.bottom === other.bottom &&
      this.left === other.left
    );
  }

  /**
   * Checks if all edges are zero
   */
  isZero(): boolean {
    return this.top === 0 && this.right === 0 && this.bottom === 0 && this.left === 0;
  }

  /**
   * Returns a string representation for debugging
   */
  toString(): string {
    if (this.isZero()) {
      return '0';
    }
    if (this.top === this.right && this.right === this.bottom && this.bottom === this.left) {
      return `${this.top}`;
    }
    if (this.top === this.bottom && this.left === this.right) {
      return `${this.top} ${this.right}`;
    }
    return `${this.top} ${this.right} ${this.bottom} ${this.left}`;
  }
}
