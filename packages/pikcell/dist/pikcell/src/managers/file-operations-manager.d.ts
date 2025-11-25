/**
 * FileOperationsManager - Manages file I/O operations
 *
 * Extracted from SpriteEditor to follow Single Responsibility Principle.
 * Handles save/load project files, PNG export, and file dialogs.
 */
import { IFileOperationsManager } from '../interfaces/managers';
import { ProjectState } from '../state/project-state-manager';
import { SpriteSheetController } from '../controllers/sprite-sheet-controller';
import { SpriteController } from '../controllers/sprite-controller';
/**
 * Manages all file operations in the editor
 */
export declare class FileOperationsManager implements IFileOperationsManager {
    private lastSavedFileName;
    /**
     * Save project to file
     *
     * Downloads a .moxiproject JSON file with the current project state
     *
     * @param projectState Project state to save
     */
    saveProject(projectState: ProjectState): Promise<void>;
    /**
     * Load project from file
     *
     * Opens a file picker and loads a .moxiproject JSON file
     *
     * @returns Loaded project state or null if cancelled/failed
     */
    loadProject(): Promise<ProjectState | null>;
    /**
     * Export sprite sheet as PNG
     *
     * Renders the sprite sheet to a canvas and downloads it as PNG
     *
     * @param spriteSheet Sprite sheet controller to export
     * @param filename Optional custom filename
     */
    exportPNG(spriteSheet: SpriteSheetController, filename?: string): Promise<void>;
    /**
     * Export individual sprite as PNG
     *
     * Renders an 8x8 sprite to a canvas and downloads it as PNG
     *
     * @param sprite Sprite controller to export
     * @param filename Optional custom filename
     */
    exportSpritePNG(sprite: SpriteController, filename?: string): Promise<void>;
    /**
     * Check if browser supports file operations
     *
     * @returns True if file operations are supported
     */
    supportsFileOperations(): boolean;
    /**
     * Get the last saved file name
     *
     * @returns Last saved filename or null
     */
    getLastSavedFileName(): string | null;
    /**
     * Download a blob as a file
     *
     * @private
     * @param blob Blob to download
     * @param filename Filename for the download
     */
    private downloadBlob;
    /**
     * Convert canvas to PNG blob
     *
     * @private
     * @param canvas Canvas element to convert
     * @returns Promise resolving to PNG blob
     */
    private canvasToBlob;
    /**
     * Export sprite sheet with custom scale (for high-res exports)
     *
     * @param spriteSheet Sprite sheet controller to export
     * @param scale Scale factor (e.g., 2 for 2x resolution)
     * @param filename Optional custom filename
     */
    exportScaledPNG(spriteSheet: SpriteSheetController, scale: number, filename?: string): Promise<void>;
    /**
     * Clear the last saved filename
     *
     * Useful when creating a new project
     */
    clearLastSavedFileName(): void;
}
