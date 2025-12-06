/**
 * Flex Layout Engine
 *
 * Implements a 3-pass CSS Flexbox-like layout algorithm:
 * - Pass 1 (Prepare): Resolve percentages, normalize styles
 * - Pass 2 (Measure): Bottom-up content measurement
 * - Pass 3 (Position): Top-down flex distribution and positioning
 *
 * @module layout/engine/flex-layout-engine
 */

import { EdgeInsets } from '../../base/edge-insets';
import {
  LayoutNode,
  LayoutStyle,
  ResolvedStyle,
  MeasuredLayout,
  ComputedLayout,
  FlexLine,
  FlexItem,
  EdgeInsetsInput,
} from '../core/layout-types';
import { parseSizeValue, resolveParsedSize } from '../core/size-value';

/**
 * 3-pass flex layout engine
 */
export class FlexLayoutEngine {
  /**
   * Compute layout for a tree starting at root
   */
  compute(
    root: LayoutNode,
    availableWidth: number,
    availableHeight: number
  ): void {
    // Pass 1: Prepare (resolve percentages, normalize)
    this.preparePass(root, availableWidth, availableHeight);

    // Pass 2: Measure (bottom-up)
    this.measurePass(root);

    // Pass 3: Position (top-down)
    this.positionPass(root, 0, 0, availableWidth, availableHeight);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PASS 1: PREPARE
  // ════════════════════════════════════════════════════════════════════════════

  private preparePass(
    node: LayoutNode,
    parentWidth: number,
    parentHeight: number
  ): void {
    const style = node.style;

    // Skip hidden nodes
    if (style.display === 'none') {
      node._resolved = null;
      return;
    }

    const isRow =
      style.flexDirection === 'row' || style.flexDirection === 'row-reverse';

    // Resolve sizes
    const widthParsed = parseSizeValue(style.width);
    const heightParsed = parseSizeValue(style.height);
    const basisParsed = parseSizeValue(style.flexBasis);

    const resolvedWidth = resolveParsedSize(widthParsed, parentWidth);
    const resolvedHeight = resolveParsedSize(heightParsed, parentHeight);
    const resolvedBasis = resolveParsedSize(
      basisParsed,
      isRow ? parentWidth : parentHeight
    );

    // Normalize padding/margin
    const padding = EdgeInsets.from(style.padding);
    const margin = EdgeInsets.from(style.margin);

    // Calculate gaps
    const mainGap = isRow
      ? style.columnGap ?? style.gap
      : style.rowGap ?? style.gap;
    const crossGap = isRow
      ? style.rowGap ?? style.gap
      : style.columnGap ?? style.gap;

    node._resolved = {
      padding,
      margin,
      width: resolvedWidth,
      height: resolvedHeight,
      minWidth: style.minWidth ?? 0,
      maxWidth: style.maxWidth ?? Infinity,
      minHeight: style.minHeight ?? 0,
      maxHeight: style.maxHeight ?? Infinity,
      flexBasis: resolvedBasis,
      mainGap,
      crossGap,
    };

    // Calculate available space for children
    const childAvailWidth =
      resolvedWidth === 'auto'
        ? parentWidth - padding.horizontal - margin.horizontal
        : (resolvedWidth as number) - padding.horizontal;

    const childAvailHeight =
      resolvedHeight === 'auto'
        ? parentHeight - padding.vertical - margin.vertical
        : (resolvedHeight as number) - padding.vertical;

    // Recurse to relative children (skip absolute - they use parent's final size)
    for (const child of node.children) {
      if (child.style.position !== 'absolute') {
        this.preparePass(child, childAvailWidth, childAvailHeight);
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PASS 2: MEASURE
  // ════════════════════════════════════════════════════════════════════════════

  private measurePass(node: LayoutNode): { width: number; height: number } {
    if (!node._resolved) {
      node._measured = { width: 0, height: 0, lines: null };
      return { width: 0, height: 0 };
    }

    const resolved = node._resolved;
    const style = node.style;
    const isRow =
      style.flexDirection === 'row' || style.flexDirection === 'row-reverse';

    // Get relative children (skip absolute and hidden)
    const relativeChildren = node.children.filter(
      (c) => c.style.position !== 'absolute' && c.style.display !== 'none'
    );

    // Leaf node: use intrinsic size
    if (relativeChildren.length === 0) {
      const intrinsic = this.getIntrinsicSize(node);
      const width = this.applyWidthConstraint(resolved, intrinsic.width);
      const height = this.applyHeightConstraint(resolved, intrinsic.height);

      node._measured = { width, height, lines: null };
      return { width, height };
    }

    // Container: measure children first
    for (const child of relativeChildren) {
      this.measurePass(child);
    }

    // Create flex items
    const items = relativeChildren.map((child) =>
      this.createFlexItem(child, isRow)
    );

    // Wrap items into lines
    const lines =
      style.flexWrap !== 'nowrap'
        ? this.wrapItemsIntoLines(items, resolved, isRow)
        : [this.createSingleLine(items, isRow)];

    // Calculate container size
    const size = this.measureContainer(lines, resolved, isRow);

    node._measured = { width: size.width, height: size.height, lines };
    return size;
  }

  private getIntrinsicSize(node: LayoutNode): { width: number; height: number } {
    if (node.measureFn) {
      return node.measureFn();
    }
    return node.intrinsicSize ?? { width: 0, height: 0 };
  }

  private applyWidthConstraint(
    resolved: ResolvedStyle,
    contentWidth: number
  ): number {
    let width =
      resolved.width === 'auto'
        ? contentWidth + resolved.padding.horizontal
        : (resolved.width as number);

    return Math.max(resolved.minWidth, Math.min(resolved.maxWidth, width));
  }

  private applyHeightConstraint(
    resolved: ResolvedStyle,
    contentHeight: number
  ): number {
    let height =
      resolved.height === 'auto'
        ? contentHeight + resolved.padding.vertical
        : (resolved.height as number);

    return Math.max(resolved.minHeight, Math.min(resolved.maxHeight, height));
  }

  private createFlexItem(node: LayoutNode, isRow: boolean): FlexItem {
    const measured = node._measured!;
    const resolved = node._resolved!;
    const style = node.style;

    let mainBaseSize: number;
    if (resolved.flexBasis !== 'auto') {
      mainBaseSize = resolved.flexBasis as number;
    } else if (isRow && resolved.width !== 'auto') {
      mainBaseSize = resolved.width as number;
    } else if (!isRow && resolved.height !== 'auto') {
      mainBaseSize = resolved.height as number;
    } else {
      mainBaseSize = isRow ? measured.width : measured.height;
    }

    // Add margin to base size
    mainBaseSize += isRow
      ? resolved.margin.horizontal
      : resolved.margin.vertical;

    const crossBaseSize =
      (isRow ? measured.height : measured.width) +
      (isRow ? resolved.margin.vertical : resolved.margin.horizontal);

    return {
      node,
      mainBaseSize,
      crossBaseSize,
      mainFinalSize: mainBaseSize,
      crossFinalSize: crossBaseSize,
      frozen: false,
    };
  }

  private createSingleLine(items: FlexItem[], isRow: boolean): FlexLine {
    let mainSize = 0;
    let crossSize = 0;

    for (const item of items) {
      mainSize += item.mainBaseSize;
      crossSize = Math.max(crossSize, item.crossBaseSize);
    }

    return { items, mainSize, crossSize };
  }

  private wrapItemsIntoLines(
    items: FlexItem[],
    resolved: ResolvedStyle,
    isRow: boolean
  ): FlexLine[] {
    const containerMain = isRow
      ? resolved.width !== 'auto'
        ? (resolved.width as number) - resolved.padding.horizontal
        : Infinity
      : resolved.height !== 'auto'
        ? (resolved.height as number) - resolved.padding.vertical
        : Infinity;

    const lines: FlexLine[] = [];
    let currentLine: FlexLine = { items: [], mainSize: 0, crossSize: 0 };
    let currentMainSize = 0;
    const gap = resolved.mainGap;

    for (const item of items) {
      const itemMain = item.mainBaseSize;
      const sizeWithGap =
        currentLine.items.length > 0
          ? currentMainSize + gap + itemMain
          : itemMain;

      if (sizeWithGap > containerMain && currentLine.items.length > 0) {
        // Start new line
        currentLine.mainSize = currentMainSize;
        lines.push(currentLine);
        currentLine = { items: [], mainSize: 0, crossSize: 0 };
        currentMainSize = 0;
      }

      currentLine.items.push(item);
      currentLine.crossSize = Math.max(currentLine.crossSize, item.crossBaseSize);
      currentMainSize =
        currentLine.items.length === 1
          ? itemMain
          : currentMainSize + gap + itemMain;
    }

    if (currentLine.items.length > 0) {
      currentLine.mainSize = currentMainSize;
      lines.push(currentLine);
    }

    return lines;
  }

  private measureContainer(
    lines: FlexLine[],
    resolved: ResolvedStyle,
    isRow: boolean
  ): { width: number; height: number } {
    let maxMainSize = 0;
    let totalCrossSize = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineMainWithGaps =
        line.mainSize + resolved.mainGap * Math.max(0, line.items.length - 1);

      maxMainSize = Math.max(maxMainSize, lineMainWithGaps);
      totalCrossSize += line.crossSize;

      if (i > 0) {
        totalCrossSize += resolved.crossGap;
      }
    }

    const mainSize =
      maxMainSize +
      (isRow ? resolved.padding.horizontal : resolved.padding.vertical);
    const crossSize =
      totalCrossSize +
      (isRow ? resolved.padding.vertical : resolved.padding.horizontal);

    const width = isRow ? mainSize : crossSize;
    const height = isRow ? crossSize : mainSize;

    return {
      width: this.applyWidthConstraint(
        resolved,
        width - resolved.padding.horizontal
      ),
      height: this.applyHeightConstraint(
        resolved,
        height - resolved.padding.vertical
      ),
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PASS 3: POSITION
  // ════════════════════════════════════════════════════════════════════════════

  private positionPass(
    node: LayoutNode,
    offsetX: number,
    offsetY: number,
    availWidth: number,
    availHeight: number
  ): void {
    if (!node._resolved) {
      node._computed = null;
      return;
    }

    const resolved = node._resolved;
    const measured = node._measured!;

    // Calculate final size
    const finalWidth = this.resolveFinalSize(
      resolved.width,
      availWidth,
      measured.width,
      resolved.minWidth,
      resolved.maxWidth
    );
    const finalHeight = this.resolveFinalSize(
      resolved.height,
      availHeight,
      measured.height,
      resolved.minHeight,
      resolved.maxHeight
    );

    // Apply margin
    const x = offsetX + resolved.margin.left;
    const y = offsetY + resolved.margin.top;

    // Store computed layout
    node._computed = {
      x,
      y,
      width: finalWidth,
      height: finalHeight,
      contentX: resolved.padding.left,
      contentY: resolved.padding.top,
      contentWidth: Math.max(0, finalWidth - resolved.padding.horizontal),
      contentHeight: Math.max(0, finalHeight - resolved.padding.vertical),
    };

    // Position children
    if (measured.lines && measured.lines.length > 0) {
      this.positionChildren(node);
    }

    // Position absolute children
    this.positionAbsoluteChildren(node);
  }

  private resolveFinalSize(
    constraint: number | 'auto',
    available: number,
    measured: number,
    min: number,
    max: number
  ): number {
    let value: number;
    if (constraint === 'auto') {
      value = measured;
    } else {
      value = constraint;
    }
    return Math.max(min, Math.min(max, value));
  }

  private positionChildren(node: LayoutNode): void {
    const resolved = node._resolved!;
    const computed = node._computed!;
    const style = node.style;
    const lines = node._measured!.lines!;

    const isRow =
      style.flexDirection === 'row' || style.flexDirection === 'row-reverse';
    const isReverse =
      style.flexDirection === 'row-reverse' ||
      style.flexDirection === 'column-reverse';
    const isWrapReverse = style.flexWrap === 'wrap-reverse';

    const mainSize = isRow ? computed.contentWidth : computed.contentHeight;
    const crossSize = isRow ? computed.contentHeight : computed.contentWidth;

    // Process flex for each line
    for (const line of lines) {
      this.processFlexLine(line, mainSize, resolved.mainGap, node.style);
    }

    // Distribute lines (align-content)
    if (lines.length > 1) {
      this.distributeLines(
        lines,
        crossSize,
        resolved.crossGap,
        style.alignContent
      );
    } else if (lines.length === 1) {
      lines[0].crossOffset = 0;
      lines[0].crossFinalSize = crossSize;
    }

    // Reverse lines if wrap-reverse
    const orderedLines = isWrapReverse ? [...lines].reverse() : lines;

    // Position each line
    let crossOffset = 0;
    for (const line of orderedLines) {
      this.positionLine(node, line, crossOffset, isRow, isReverse);
      crossOffset += (line.crossFinalSize ?? line.crossSize) + resolved.crossGap;
    }
  }

  private processFlexLine(
    line: FlexLine,
    availableMain: number,
    gap: number,
    style: LayoutStyle
  ): void {
    const items = line.items;
    const numItems = items.length;
    const totalGap = gap * Math.max(0, numItems - 1);

    let usedSpace = 0;
    for (const item of items) {
      usedSpace += item.mainBaseSize;
    }

    const freeSpace = availableMain - usedSpace - totalGap;

    if (freeSpace > 0) {
      this.growItems(items, freeSpace);
    } else if (freeSpace < 0) {
      this.shrinkItems(items, -freeSpace);
    } else {
      for (const item of items) {
        item.mainFinalSize = item.mainBaseSize;
      }
    }
  }

  private growItems(items: FlexItem[], freeSpace: number): void {
    let remaining = freeSpace;
    let unfrozen = items.filter(
      (item) => !item.frozen && item.node.style.flexGrow > 0
    );

    while (remaining > 0.5 && unfrozen.length > 0) {
      const totalGrow = unfrozen.reduce(
        (sum, item) => sum + item.node.style.flexGrow,
        0
      );
      if (totalGrow === 0) break;

      const spacePerGrow = remaining / totalGrow;
      let used = 0;

      for (const item of unfrozen) {
        const grow = item.node.style.flexGrow;
        const addition = spacePerGrow * grow;
        const newSize = item.mainFinalSize + addition;

        const isRow =
          item.node.parent?.style.flexDirection === 'row' ||
          item.node.parent?.style.flexDirection === 'row-reverse';
        const maxMain = isRow
          ? item.node._resolved!.maxWidth
          : item.node._resolved!.maxHeight;

        if (newSize > maxMain) {
          item.mainFinalSize = maxMain;
          item.frozen = true;
          used += maxMain - item.mainBaseSize;
        } else {
          item.mainFinalSize = newSize;
          used += addition;
        }
      }

      remaining -= used;
      unfrozen = unfrozen.filter((item) => !item.frozen);
    }

    // Items with grow: 0 keep base size
    for (const item of items) {
      if (item.node.style.flexGrow === 0) {
        item.mainFinalSize = item.mainBaseSize;
      }
    }
  }

  private shrinkItems(items: FlexItem[], overflow: number): void {
    let remaining = overflow;
    let unfrozen = items.filter(
      (item) => !item.frozen && item.node.style.flexShrink > 0
    );

    while (remaining > 0.5 && unfrozen.length > 0) {
      const totalScaledShrink = unfrozen.reduce(
        (sum, item) => sum + item.mainBaseSize * item.node.style.flexShrink,
        0
      );
      if (totalScaledShrink === 0) break;

      let shrunk = 0;

      for (const item of unfrozen) {
        const shrink = item.node.style.flexShrink;
        const scaledShrink = item.mainBaseSize * shrink;
        const ratio = scaledShrink / totalScaledShrink;
        const reduction = remaining * ratio;
        const newSize = item.mainFinalSize - reduction;

        const isRow =
          item.node.parent?.style.flexDirection === 'row' ||
          item.node.parent?.style.flexDirection === 'row-reverse';
        const minMain = isRow
          ? item.node._resolved!.minWidth
          : item.node._resolved!.minHeight;

        if (newSize < minMain) {
          item.mainFinalSize = minMain;
          item.frozen = true;
          shrunk += item.mainBaseSize - minMain;
        } else {
          item.mainFinalSize = newSize;
          shrunk += reduction;
        }
      }

      remaining -= shrunk;
      unfrozen = unfrozen.filter((item) => !item.frozen);
    }
  }

  private distributeLines(
    lines: FlexLine[],
    availableCross: number,
    crossGap: number,
    alignContent: string
  ): void {
    const numLines = lines.length;
    const totalLinesCross = lines.reduce((sum, line) => sum + line.crossSize, 0);
    const totalGaps = crossGap * Math.max(0, numLines - 1);
    const freeCross = availableCross - totalLinesCross - totalGaps;

    let offset = 0;
    let extra = 0;

    switch (alignContent) {
      case 'start':
        break;
      case 'end':
        offset = freeCross;
        break;
      case 'center':
        offset = freeCross / 2;
        break;
      case 'stretch':
        extra = freeCross / numLines;
        break;
      case 'space-between':
        extra = numLines > 1 ? freeCross / (numLines - 1) : 0;
        break;
      case 'space-around':
        extra = freeCross / numLines;
        offset = extra / 2;
        break;
    }

    let currentOffset = offset;
    for (const line of lines) {
      line.crossOffset = currentOffset;
      line.crossFinalSize =
        line.crossSize + (alignContent === 'stretch' ? extra : 0);
      currentOffset +=
        line.crossFinalSize + crossGap + (alignContent !== 'stretch' ? extra : 0);
    }
  }

  private positionLine(
    parent: LayoutNode,
    line: FlexLine,
    crossOffset: number,
    isRow: boolean,
    isReverse: boolean
  ): void {
    const computed = parent._computed!;
    const resolved = parent._resolved!;
    const style = parent.style;
    const items = line.items;

    const mainSize = isRow ? computed.contentWidth : computed.contentHeight;
    const mainGap = resolved.mainGap;

    // Calculate used space after flex
    const usedMain =
      items.reduce((sum, item) => sum + item.mainFinalSize, 0) +
      mainGap * Math.max(0, items.length - 1);
    const freeMain = mainSize - usedMain;

    // Justify content
    let mainOffset = 0;
    let extraSpace = 0;

    switch (style.justifyContent) {
      case 'start':
        break;
      case 'end':
        mainOffset = freeMain;
        break;
      case 'center':
        mainOffset = freeMain / 2;
        break;
      case 'space-between':
        extraSpace = items.length > 1 ? freeMain / (items.length - 1) : 0;
        break;
      case 'space-around':
        extraSpace = freeMain / items.length;
        mainOffset = extraSpace / 2;
        break;
      case 'space-evenly':
        extraSpace = freeMain / (items.length + 1);
        mainOffset = extraSpace;
        break;
    }

    // Sort by order
    const orderedItems = [...items].sort(
      (a, b) => (a.node.style.order ?? 0) - (b.node.style.order ?? 0)
    );

    // Reverse if needed
    if (isReverse) {
      orderedItems.reverse();
    }

    // Position each item
    let currentMain = mainOffset;
    const lineCrossSize = line.crossFinalSize ?? line.crossSize;

    for (const item of orderedItems) {
      const child = item.node;
      const childResolved = child._resolved!;

      // Align items / align self
      const alignSelf = child.style.alignSelf;
      const align = alignSelf === 'auto' ? style.alignItems : alignSelf;

      let crossItemSize = item.crossFinalSize;
      let itemCrossOffset = 0;

      switch (align) {
        case 'start':
          itemCrossOffset = 0;
          break;
        case 'end':
          itemCrossOffset = lineCrossSize - crossItemSize;
          break;
        case 'center':
          itemCrossOffset = (lineCrossSize - crossItemSize) / 2;
          break;
        case 'stretch':
          crossItemSize =
            lineCrossSize -
            (isRow
              ? childResolved.margin.vertical
              : childResolved.margin.horizontal);
          item.crossFinalSize = crossItemSize;
          break;
      }

      // Calculate child position and available space
      let childX: number, childY: number;
      let childAvailWidth: number, childAvailHeight: number;

      if (isRow) {
        childX = resolved.padding.left + currentMain;
        childY =
          resolved.padding.top + (line.crossOffset ?? crossOffset) + itemCrossOffset;
        childAvailWidth = item.mainFinalSize - childResolved.margin.horizontal;
        childAvailHeight = crossItemSize - childResolved.margin.vertical;
      } else {
        childX =
          resolved.padding.left + (line.crossOffset ?? crossOffset) + itemCrossOffset;
        childY = resolved.padding.top + currentMain;
        childAvailWidth = crossItemSize - childResolved.margin.horizontal;
        childAvailHeight = item.mainFinalSize - childResolved.margin.vertical;
      }

      // Recurse
      this.positionPass(child, childX, childY, childAvailWidth, childAvailHeight);

      currentMain += item.mainFinalSize + mainGap + extraSpace;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ABSOLUTE POSITIONING
  // ════════════════════════════════════════════════════════════════════════════

  private positionAbsoluteChildren(node: LayoutNode): void {
    const computed = node._computed;
    if (!computed) return;

    const absoluteChildren = node.children.filter(
      (c) => c.style.position === 'absolute'
    );

    for (const child of absoluteChildren) {
      this.positionAbsoluteChild(node, child);
    }
  }

  private positionAbsoluteChild(parent: LayoutNode, child: LayoutNode): void {
    const parentComputed = parent._computed!;
    const style = child.style;

    // Prepare child (wasn't done in Pass 1)
    this.preparePass(child, parentComputed.contentWidth, parentComputed.contentHeight);
    if (!child._resolved) return;

    // Measure child
    this.measurePass(child);
    const measured = child._measured!;
    const resolved = child._resolved;

    const hasLeft = style.left !== undefined;
    const hasRight = style.right !== undefined;
    const hasTop = style.top !== undefined;
    const hasBottom = style.bottom !== undefined;

    // Calculate width
    let finalWidth: number;
    if (hasLeft && hasRight && resolved.width === 'auto') {
      finalWidth =
        parentComputed.contentWidth -
        style.left! -
        style.right! -
        resolved.margin.horizontal;
    } else {
      finalWidth = this.resolveFinalSize(
        resolved.width,
        parentComputed.contentWidth,
        measured.width,
        resolved.minWidth,
        resolved.maxWidth
      );
    }

    // Calculate height
    let finalHeight: number;
    if (hasTop && hasBottom && resolved.height === 'auto') {
      finalHeight =
        parentComputed.contentHeight -
        style.top! -
        style.bottom! -
        resolved.margin.vertical;
    } else {
      finalHeight = this.resolveFinalSize(
        resolved.height,
        parentComputed.contentHeight,
        measured.height,
        resolved.minHeight,
        resolved.maxHeight
      );
    }

    // Calculate position
    let x: number, y: number;

    if (hasLeft) {
      x = style.left! + resolved.margin.left;
    } else if (hasRight) {
      x =
        parentComputed.contentWidth -
        style.right! -
        finalWidth -
        resolved.margin.right;
    } else {
      x = resolved.margin.left;
    }

    if (hasTop) {
      y = style.top! + resolved.margin.top;
    } else if (hasBottom) {
      y =
        parentComputed.contentHeight -
        style.bottom! -
        finalHeight -
        resolved.margin.bottom;
    } else {
      y = resolved.margin.top;
    }

    // Add parent content offset
    x += parentComputed.contentX;
    y += parentComputed.contentY;

    // Store computed
    child._computed = {
      x,
      y,
      width: finalWidth,
      height: finalHeight,
      contentX: resolved.padding.left,
      contentY: resolved.padding.top,
      contentWidth: Math.max(0, finalWidth - resolved.padding.horizontal),
      contentHeight: Math.max(0, finalHeight - resolved.padding.vertical),
    };

    // Position child's children
    if (child._measured!.lines && child._measured!.lines.length > 0) {
      this.positionChildren(child);
    }

    this.positionAbsoluteChildren(child);
  }
}
