/**
 * Size Value Types and Utilities
 *
 * Handles parsing and resolution of CSS-like size values including
 * fixed pixels, auto, fill, and percentages.
 *
 * @module layout/core/size-value
 */

/**
 * Size constraint values.
 * - number: Fixed pixels (e.g., 100)
 * - 'auto': Fit to content
 * - 'fill': Expand to available space (alias for '100%')
 * - '${n}%': Percentage of parent (e.g., '50%')
 */
export type SizeValue = number | 'auto' | 'fill' | `${number}%`;

/**
 * Parsed size value for internal use
 */
export interface ParsedSize {
  type: 'fixed' | 'auto' | 'percent';
  value: number; // pixels for fixed, 0-100 for percent
}

/**
 * Parse a SizeValue into internal representation
 */
export function parseSizeValue(value: SizeValue | undefined): ParsedSize {
  if (value === undefined || value === 'auto') {
    return { type: 'auto', value: 0 };
  }
  if (value === 'fill') {
    return { type: 'percent', value: 100 };
  }
  if (typeof value === 'number') {
    return { type: 'fixed', value };
  }
  // Parse percentage string
  const match = value.match(/^(\d+(?:\.\d+)?)%$/);
  if (match) {
    return { type: 'percent', value: parseFloat(match[1]) };
  }
  throw new Error(`Invalid size value: ${value}`);
}

/**
 * Resolve a parsed size against parent dimension
 *
 * @param parsed - The parsed size value
 * @param parentSize - The parent's dimension to resolve percentages against
 * @returns Resolved number or 'auto'
 */
export function resolveParsedSize(
  parsed: ParsedSize,
  parentSize: number
): number | 'auto' {
  switch (parsed.type) {
    case 'fixed':
      return parsed.value;
    case 'percent':
      return (parsed.value / 100) * parentSize;
    case 'auto':
      return 'auto';
  }
}

/**
 * Check if a size value is a percentage
 */
export function isPercentage(value: SizeValue | undefined): boolean {
  if (value === undefined) return false;
  if (value === 'fill') return true;
  if (typeof value === 'string' && value.endsWith('%')) return true;
  return false;
}

/**
 * Check if a size value is fixed (number)
 */
export function isFixed(value: SizeValue | undefined): value is number {
  return typeof value === 'number';
}

/**
 * Check if a size value is auto
 */
export function isAuto(value: SizeValue | undefined): boolean {
  return value === undefined || value === 'auto';
}

/**
 * Format a size value for display (e.g., in debug tooltip)
 */
export function formatSizeValue(value: SizeValue | undefined): string {
  if (value === undefined) return 'auto';
  if (value === 'auto') return 'auto';
  if (value === 'fill') return 'fill';
  if (typeof value === 'number') return `${value}px`;
  return value; // percentage string
}
