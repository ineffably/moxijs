/**
 * Sprite Editor (Refactored) - Main orchestrator class
 *
 * REFACTORED to use manager pattern for better separation of concerns:
 * - SpriteSheetManager: Sprite sheet lifecycle
 * - UIManager: Card registry and z-ordering
 * - LayoutManager: Positioning and layouts
 * - FileOperationsManager: Save/load/export
 *
 * This reduces the class from 1040 lines to ~400 lines with clear responsibilities.
 */
import * as PIXI from 'pixi.js';
export interface SpriteEditorOptions {
    renderer: PIXI.Renderer;
    scene: PIXI.Container;
    maxSpriteSheets?: number;
}
/**
 * Main Sprite Editor class (Refactored)
 * Now acts as a lightweight orchestrator that delegates to specialized managers
 */
export declare class SpriteEditor {
    private spriteSheetManager;
    private uiManager;
    private layoutManager;
    private fileOperationsManager;
    private renderer;
    private scene;
    private commanderBarCard?;
    private paletteCard?;
    private infoBarCard?;
    private currentPalette;
    private selectedColorIndex;
    private projectState;
    private hasUnsavedChanges;
    private uiStateSaveTimer;
    private projectSaveTimer;
    constructor(options: SpriteEditorOptions);
    /**
     * Initialize and create all UI elements
     */
    initialize(): Promise<void>;
    /**
     * Register a card and setup auto-save on state changes
     */
    private registerCard;
    /**
     * Save current UI state to localStorage (debounced)
     */
    private saveUIState;
    /**
     * Restore UI state from localStorage
     */
    private restoreUIState;
    /**
     * Apply default layout positions to all cards
     */
    private applyDefaultLayout;
    /**
     * Updates the palette card to match the active sprite sheet
     */
    private updatePaletteForActiveSheet;
    /**
     * Creates a new sprite sheet and sprite card
     */
    private createNewSpriteSheet;
    /**
     * Update theme without losing state
     */
    updateTheme(): void;
    /**
     * Recreate all UI with current theme
     */
    recreateUI(): Promise<void>;
    /**
     * Save current project state (debounced)
     */
    private saveProjectState;
    /**
     * Load project state and recreate sprite sheets
     */
    private loadProjectState;
    /**
     * Handle "New" button
     */
    private handleNew;
    /**
     * Create a new project
     */
    private createNewProject;
    /**
     * Handle "Save" button - uses FileOperationsManager
     */
    private handleSave;
    /**
     * Handle "Load" button - uses FileOperationsManager
     */
    private handleLoad;
    /**
     * Load a project file
     */
    private loadProjectFile;
    /**
     * Handle "Export" button - uses FileOperationsManager
     */
    private handleExport;
    /**
     * Handle saving layout to slot
     */
    private handleSaveLayoutSlot;
    /**
     * Handle loading layout from slot
     */
    private handleLoadLayoutSlot;
    /**
     * Handle scale change (temporary)
     */
    private handleScaleChange;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
