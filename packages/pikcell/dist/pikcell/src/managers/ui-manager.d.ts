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
/**
 * Manages all UI cards in the editor
 */
export declare class UIManager implements IUIManager {
    private cards;
    private scene;
    private focusedCardId;
    constructor(scene: PIXI.Container);
    /**
     * Register a card with the UI manager
     *
     * @param id Unique card identifier
     * @param card PixelCard instance
     */
    registerCard(id: string, card: PixelCard): void;
    /**
     * Unregister a card
     *
     * @param id Card identifier
     */
    unregisterCard(id: string): void;
    /**
     * Get a registered card by ID
     *
     * @param id Card identifier
     * @returns The card or undefined if not found
     */
    getCard(id: string): PixelCard | undefined;
    /**
     * Get all registered cards
     *
     * @returns Map of all cards (id -> card)
     */
    getAllCards(): Map<string, PixelCard>;
    /**
     * Bring a card to the front (highest z-index)
     *
     * This is done by removing and re-adding the card to the scene,
     * which places it at the end of the children array (rendered last = on top)
     *
     * @param id Card identifier
     */
    bringToFront(id: string): void;
    /**
     * Export states of all cards
     *
     * @returns Map of card states (id -> state)
     */
    exportAllStates(): Map<string, CardState>;
    /**
     * Import and restore card states
     *
     * @param states Map of card states to restore
     */
    importStates(states: Map<string, CardState>): void;
    /**
     * Check if a card is registered
     *
     * @param id Card identifier
     * @returns True if card exists
     */
    hasCard(id: string): boolean;
    /**
     * Get the focused card ID
     *
     * @returns The ID of the focused card or null
     */
    getFocusedCard(): string | null;
    /**
     * Set the focused card
     *
     * This will bring the card to front and track it as focused
     *
     * @param id Card identifier or null to clear focus
     */
    setFocusedCard(id: string | null): void;
    /**
     * Get the count of registered cards
     *
     * @returns Number of cards
     */
    getCardCount(): number;
    /**
     * Clear all cards
     *
     * Removes all cards from the scene and clears the registry
     */
    clear(): void;
    /**
     * Find cards by predicate
     *
     * @param predicate Function to test each card
     * @returns Array of [id, card] pairs that match the predicate
     */
    findCards(predicate: (card: PixelCard, id: string) => boolean): Array<[string, PixelCard]>;
    /**
     * Get card IDs matching a pattern
     *
     * @param pattern Regex pattern or string to match
     * @returns Array of matching card IDs
     */
    getCardIdsByPattern(pattern: string | RegExp): string[];
    /**
     * Bring a group of cards to front together
     *
     * Useful for bringing paired cards or related cards to front as a group
     *
     * @param ids Array of card IDs to bring to front
     */
    bringGroupToFront(ids: string[]): void;
}
