/**
 * SpriteSheetManager - Manages sprite sheet lifecycle
 *
 * Extracted from SpriteEditor to follow Single Responsibility Principle.
 * Handles creation, tracking, activation, and validation of sprite sheets.
 */
import { SpriteSheetInstance, ISpriteSheetManager, ValidationResult } from '../interfaces/managers';
import { SpriteSheetType, SpriteSheetConfig } from '../controllers/sprite-sheet-controller';
type EventHandler = (id: string) => void;
/**
 * Manages all sprite sheet instances in the editor
 */
export declare class SpriteSheetManager implements ISpriteSheetManager {
    private instances;
    private activeId;
    private eventHandlers;
    /**
     * Create a new sprite sheet instance
     *
     * @param type Sprite sheet type (PICO-8, TIC-80, etc.)
     * @param savedId Optional saved ID to reuse when loading from state
     * @param config Optional configuration overrides
     * @returns The created sprite sheet instance
     */
    create(type: SpriteSheetType, savedId?: string, config?: Partial<SpriteSheetConfig>): SpriteSheetInstance;
    /**
     * Get a sprite sheet instance by ID
     *
     * @param id Sprite sheet ID
     * @returns The sprite sheet instance or undefined if not found
     */
    get(id: string): SpriteSheetInstance | undefined;
    /**
     * Get the currently active sprite sheet
     *
     * @returns The active sprite sheet instance or null if none active
     */
    getActive(): SpriteSheetInstance | null;
    /**
     * Set the active sprite sheet
     *
     * @param id Sprite sheet ID to activate
     * @throws Error if sprite sheet ID doesn't exist
     */
    setActive(id: string): void;
    /**
     * Get all sprite sheet instances
     *
     * @returns Array of all sprite sheet instances
     */
    getAll(): SpriteSheetInstance[];
    /**
     * Remove a sprite sheet instance
     *
     * @param id Sprite sheet ID to remove
     */
    remove(id: string): void;
    /**
     * Validate if a sprite sheet can be created
     *
     * Enforces rules like:
     * - Maximum sprite sheets per project
     * - One sprite sheet type per project
     *
     * @param type Sprite sheet type to validate
     * @returns Validation result with error message if invalid
     */
    validate(type: SpriteSheetType): ValidationResult;
    /**
     * Check if a sprite sheet exists
     *
     * @param id Sprite sheet ID
     * @returns True if sprite sheet exists
     */
    has(id: string): boolean;
    /**
     * Get the count of sprite sheets
     *
     * @returns Number of sprite sheets
     */
    count(): number;
    /**
     * Subscribe to sprite sheet events
     *
     * @param event Event type to subscribe to
     * @param handler Event handler function
     */
    on(event: 'created' | 'removed' | 'activeChanged', handler: EventHandler): void;
    /**
     * Unsubscribe from sprite sheet events
     *
     * @param event Event type to unsubscribe from
     * @param handler Event handler function to remove
     */
    off(event: 'created' | 'removed' | 'activeChanged', handler: EventHandler): void;
    /**
     * Clear all sprite sheets
     *
     * Useful for creating a new project
     */
    clear(): void;
    /**
     * Get the sprite sheet type (if all sheets are the same type)
     *
     * @returns The sprite sheet type or null if no sheets or mixed types
     */
    getProjectSpriteSheetType(): SpriteSheetType | null;
    /**
     * Generate a unique ID for a sprite sheet
     *
     * @private
     */
    private generateId;
    /**
     * Emit an event to all subscribed handlers
     *
     * @private
     */
    private emit;
    /**
     * Get statistics about sprite sheets
     *
     * Useful for debugging and UI display
     */
    getStats(): {
        total: number;
        activeId: string | null;
        type: SpriteSheetType | null;
    };
}
export {};
