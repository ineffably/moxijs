/**
 * Project State Manager
 * Manages sprite project data separately from UI layout state
 * Saves sprite pixel data, sprite sheet configurations, and active editing state
 */
import { SpriteSheetType } from '../controllers/sprite-sheet-controller';
/**
 * State for a single sprite sheet in the project
 */
export interface SpriteSheetState {
    id: string;
    type: SpriteSheetType;
    showGrid: boolean;
    pixels: number[][];
    selectedCellX: number;
    selectedCellY: number;
    scale: number;
    spriteCardScale?: number;
}
/**
 * Complete project state
 */
export interface ProjectState {
    version: number;
    createdAt: number;
    modifiedAt: number;
    spriteSheets: SpriteSheetState[];
    activeSpriteSheetId: string | null;
    selectedColorIndex: number;
}
/**
 * Project State Manager
 * Handles saving and loading of sprite project data to/from localStorage
 */
export declare class ProjectStateManager {
    private static readonly CURRENT_VERSION;
    /**
     * Create a new empty project
     */
    static createEmptyProject(): ProjectState;
    /**
     * Save project state to localStorage
     */
    static saveProject(state: ProjectState): void;
    /**
     * Load project state from localStorage
     */
    static loadProject(): ProjectState | null;
    /**
     * Clear project state (start fresh)
     */
    static clearProject(): void;
    /**
     * Check if a project exists
     */
    static hasProject(): boolean;
    /**
     * Migrate old project versions to current version
     */
    private static migrateProject;
    /**
     * Export project as JSON string (for download/sharing)
     */
    static exportProjectJSON(state: ProjectState): string;
    /**
     * Import project from JSON string
     */
    static importProjectJSON(jsonString: string): ProjectState | null;
    /**
     * Get project metadata (without full pixel data)
     */
    static getProjectMetadata(): {
        createdAt: number;
        modifiedAt: number;
        sheetCount: number;
    } | null;
    /**
     * Download project as a .pikcell file to user's drive
     */
    static downloadProject(state: ProjectState, filename?: string): void;
    /**
     * Prompt user to load a project file from their drive
     * Returns a promise that resolves with the loaded project state
     */
    static loadProjectFromFile(): Promise<ProjectState | null>;
}
