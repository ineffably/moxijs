/**
 * UIManager - Manages UI card lifecycle and z-ordering
 *
 * Extracted from SpriteEditor to follow Single Responsibility Principle.
 * Handles card registration, z-ordering, focus management, and state export/import.
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
import { IUIManager } from '../interfaces/managers';
import { CardState } from '../state/ui-state-manager';
import { LAYOUT_CONSTANTS } from '../config/constants';

/**
 * Manages all UI cards in the editor
 */
export class UIManager implements IUIManager {
  private cards: Map<string, PixelCard> = new Map();
  private scene: PIXI.Container;
  private focusedCardId: string | null = null;
  private cardCallbacks: Map<string, () => void> = new Map(); // Track original callbacks for cleanup

  constructor(scene: PIXI.Container) {
    this.scene = scene;
  }

  /**
   * Register a card with the UI manager
   *
   * @param id Unique card identifier
   * @param card PixelCard instance
   */
  registerCard(id: string, card: PixelCard): void {
    if (this.cards.has(id)) {
      console.warn(`Card with ID "${id}" is already registered`);
      return;
    }

    this.cards.set(id, card);

    // Add card to scene if not already added
    if (!this.scene.children.includes(card.container)) {
      this.scene.addChild(card.container);
    }

    // Setup focus listener - store the wrapper so we can clean up later
    if (card.onStateChanged) {
      const originalOnStateChanged = card.onStateChanged.bind(card);
      this.cardCallbacks.set(id, originalOnStateChanged);

      const wrappedCallback = () => {
        this.setFocusedCard(id);
        originalOnStateChanged();
      };
      card.onStateChanged = wrappedCallback;
    }
  }

  /**
   * Unregister a card
   *
   * @param id Card identifier
   */
  unregisterCard(id: string): void {
    const card = this.cards.get(id);
    if (!card) return;

    // Restore original callback if we wrapped it
    const originalCallback = this.cardCallbacks.get(id);
    if (originalCallback && card.onStateChanged) {
      card.onStateChanged = originalCallback;
    }
    this.cardCallbacks.delete(id);

    // Remove from scene
    if (this.scene.children.includes(card.container)) {
      this.scene.removeChild(card.container);
    }

    // Clear focus if this was the focused card
    if (this.focusedCardId === id) {
      this.focusedCardId = null;
    }

    this.cards.delete(id);
  }

  /**
   * Get a registered card by ID
   *
   * @param id Card identifier
   * @returns The card or undefined if not found
   */
  getCard(id: string): PixelCard | undefined {
    return this.cards.get(id);
  }

  /**
   * Get all registered cards
   *
   * @returns Map of all cards (id -> card)
   */
  getAllCards(): Map<string, PixelCard> {
    return new Map(this.cards);
  }

  /**
   * Bring a card to the front (highest z-index)
   *
   * This is done by removing and re-adding the card to the scene,
   * which places it at the end of the children array (rendered last = on top)
   *
   * @param id Card identifier
   */
  bringToFront(id: string): void {
    const card = this.cards.get(id);
    if (!card) return;

    // Remove and re-add to bring to front
    this.scene.removeChild(card.container);
    this.scene.addChild(card.container);

    // If card has a paired card, bring that to front too (but behind this one)
    const pairedCard = card.getPairedCard?.();
    if (pairedCard && pairedCard !== card) {
      // Find the paired card's ID
      for (const [pairedId, registeredCard] of this.cards.entries()) {
        if (registeredCard === pairedCard) {
          // Remove and re-add paired card first (so it's behind the main card)
          this.scene.removeChild(pairedCard.container);
          this.scene.addChild(pairedCard.container);

          // Then remove and re-add the main card (so it's on top)
          this.scene.removeChild(card.container);
          this.scene.addChild(card.container);
          break;
        }
      }
    }
  }

  /**
   * Export states of all cards
   *
   * @returns Map of card states (id -> state)
   */
  exportAllStates(): Map<string, CardState> {
    const stateMap = new Map<string, CardState>();

    this.cards.forEach((card, id) => {
      stateMap.set(id, card.exportState(id));
    });

    return stateMap;
  }

  /**
   * Import and restore card states
   *
   * @param states Map of card states to restore
   */
  importStates(states: Map<string, CardState>): void {
    states.forEach((cardState, id) => {
      const card = this.cards.get(id);
      if (card) {
        card.importState(cardState);
      }
    });
  }

  /**
   * Check if a card is registered
   *
   * @param id Card identifier
   * @returns True if card exists
   */
  hasCard(id: string): boolean {
    return this.cards.has(id);
  }

  /**
   * Get the focused card ID
   *
   * @returns The ID of the focused card or null
   */
  getFocusedCard(): string | null {
    return this.focusedCardId;
  }

  /**
   * Set the focused card
   *
   * This will bring the card to front and track it as focused
   *
   * @param id Card identifier or null to clear focus
   */
  setFocusedCard(id: string | null): void {
    if (id === this.focusedCardId) return;

    this.focusedCardId = id;

    if (id) {
      this.bringToFront(id);
    }
  }

  /**
   * Get the count of registered cards
   *
   * @returns Number of cards
   */
  getCardCount(): number {
    return this.cards.size;
  }

  /**
   * Clear all cards
   *
   * Removes all cards from the scene and clears the registry
   */
  clear(): void {
    const ids = Array.from(this.cards.keys());
    ids.forEach(id => this.unregisterCard(id));
  }

  /**
   * Find cards by predicate
   *
   * @param predicate Function to test each card
   * @returns Array of [id, card] pairs that match the predicate
   */
  findCards(predicate: (card: PixelCard, id: string) => boolean): Array<[string, PixelCard]> {
    const results: Array<[string, PixelCard]> = [];

    this.cards.forEach((card, id) => {
      if (predicate(card, id)) {
        results.push([id, card]);
      }
    });

    return results;
  }

  /**
   * Get card IDs matching a pattern
   *
   * @param pattern Regex pattern or string to match
   * @returns Array of matching card IDs
   */
  getCardIdsByPattern(pattern: string | RegExp): string[] {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return Array.from(this.cards.keys()).filter(id => regex.test(id));
  }

  /**
   * Bring a group of cards to front together
   *
   * Useful for bringing paired cards or related cards to front as a group
   *
   * @param ids Array of card IDs to bring to front
   */
  bringGroupToFront(ids: string[]): void {
    // Remove all cards from scene
    ids.forEach(id => {
      const card = this.cards.get(id);
      if (card && this.scene.children.includes(card.container)) {
        this.scene.removeChild(card.container);
      }
    });

    // Re-add in order (first card in array will be at back, last at front)
    ids.forEach(id => {
      const card = this.cards.get(id);
      if (card) {
        this.scene.addChild(card.container);
      }
    });
  }
}
