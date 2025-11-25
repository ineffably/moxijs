/**
 * Layout State Manager - Save and load layout configurations
 */

export interface CardLayoutState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutSlotState {
  cards: CardLayoutState[];
}

const LAYOUT_STORAGE_PREFIX = 'pikcell-layout-slot-';

export class LayoutStateManager {
  /**
   * Save current layout to a slot
   */
  static saveLayoutSlot(slot: 'A' | 'B' | 'C', layout: LayoutSlotState): void {
    const key = `${LAYOUT_STORAGE_PREFIX}${slot}`;
    localStorage.setItem(key, JSON.stringify(layout));
  }

  /**
   * Load layout from a slot
   */
  static loadLayoutSlot(slot: 'A' | 'B' | 'C'): LayoutSlotState | null {
    const key = `${LAYOUT_STORAGE_PREFIX}${slot}`;
    const data = localStorage.getItem(key);
    if (!data) return null;

    try {
      return JSON.parse(data) as LayoutSlotState;
    } catch (e) {
      console.error(`Failed to parse layout slot ${slot}:`, e);
      return null;
    }
  }

  /**
   * Check if a slot has a saved layout
   */
  static hasLayoutSlot(slot: 'A' | 'B' | 'C'): boolean {
    const key = `${LAYOUT_STORAGE_PREFIX}${slot}`;
    return localStorage.getItem(key) !== null;
  }

  /**
   * Clear a layout slot
   */
  static clearLayoutSlot(slot: 'A' | 'B' | 'C'): void {
    const key = `${LAYOUT_STORAGE_PREFIX}${slot}`;
    localStorage.removeItem(key);
  }
}
