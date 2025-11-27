/**
 * Card ID Constants
 *
 * Centralized identifiers for all UI cards in the sprite editor.
 * Using constants prevents typos and enables type-safe card lookups.
 */

/**
 * Core card identifiers
 */
export const CARD_IDS = {
  /** Commander bar at top of screen */
  COMMANDER: 'commander',

  /** Color palette picker */
  PALETTE: 'palette',

  /** Info bar at bottom of screen */
  INFO: 'info',

  /** Tool selection card */
  TOOL: 'tool',

  /** Scale selector card */
  SCALE: 'scale',
} as const;

/**
 * Generate sprite sheet card ID
 * @param index Sprite sheet index
 */
export function getSpriteSheetCardId(index: number): string {
  return `sprite-sheet-${index}`;
}

/**
 * Generate sprite card ID
 * @param index Sprite sheet index this sprite belongs to
 */
export function getSpriteCardId(index: number): string {
  return `sprite-card-${index}`;
}

/**
 * Check if a card ID is a sprite sheet card
 */
export function isSpriteSheetCard(id: string): boolean {
  return id.startsWith('sprite-sheet-');
}

/**
 * Check if a card ID is a sprite card
 */
export function isSpriteCard(id: string): boolean {
  return id.startsWith('sprite-card-');
}

/**
 * Extract index from sprite sheet or sprite card ID
 * @returns The index or -1 if not a valid ID
 */
export function getCardIndex(id: string): number {
  if (isSpriteSheetCard(id)) {
    return parseInt(id.replace('sprite-sheet-', ''), 10);
  }
  if (isSpriteCard(id)) {
    return parseInt(id.replace('sprite-card-', ''), 10);
  }
  return -1;
}

export type CardId = typeof CARD_IDS[keyof typeof CARD_IDS];

