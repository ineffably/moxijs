/**
 * Project State Manager
 * Manages sprite project data separately from UI layout state
 * Saves sprite pixel data, sprite sheet configurations, and active editing state
 */
import { SpriteSheetType } from '../controllers/sprite-sheet-controller';

const PROJECT_STATE_KEY = 'sprite-editor-project';

/**
 * Result type for operations that can fail
 */
export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * State for a single sprite sheet in the project
 */
export interface SpriteSheetState {
  id: string;
  type: SpriteSheetType;
  showGrid: boolean;
  pixels: number[][]; // 2D array of color indices
  selectedCellX: number;
  selectedCellY: number;
  scale: number;
  spriteCardScale?: number; // Scale of the sprite card if open
}

/**
 * Complete project state
 */
export interface ProjectState {
  version: number; // For future migrations
  createdAt: number; // Timestamp
  modifiedAt: number; // Timestamp
  spriteSheets: SpriteSheetState[];
  activeSpriteSheetId: string | null;
  selectedColorIndex: number;
}

/**
 * Project State Manager
 * Handles saving and loading of sprite project data to/from localStorage
 */
export class ProjectStateManager {
  private static readonly CURRENT_VERSION = 1;

  /**
   * Create a new empty project
   */
  static createEmptyProject(): ProjectState {
    return {
      version: this.CURRENT_VERSION,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      spriteSheets: [],
      activeSpriteSheetId: null,
      selectedColorIndex: 0
    };
  }

  /**
   * Save project state to localStorage
   * @returns Result indicating success or failure with error message
   */
  static saveProject(state: ProjectState): OperationResult {
    try {
      state.modifiedAt = Date.now();
      const serialized = JSON.stringify(state);
      localStorage.setItem(PROJECT_STATE_KEY, serialized);
      console.log('💾 Project saved to localStorage');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to save project state:', error);
      return { success: false, error: `Failed to save project: ${errorMessage}` };
    }
  }

  /**
   * Load project state from localStorage
   * @returns Result with project data or error message
   */
  static loadProject(): OperationResult<ProjectState | null> {
    try {
      const serialized = localStorage.getItem(PROJECT_STATE_KEY);
      if (!serialized) {
        return { success: true, data: null };
      }

      const state = JSON.parse(serialized) as ProjectState;

      // Version migration if needed
      if (state.version !== this.CURRENT_VERSION) {
        console.warn('Project version mismatch, migrating...');
        return { success: true, data: this.migrateProject(state) };
      }

      console.log('📂 Project loaded from localStorage');
      return { success: true, data: state };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to load project state:', error);
      return { success: false, error: `Failed to load project: ${errorMessage}` };
    }
  }

  /**
   * Clear project state (start fresh)
   * @returns Result indicating success or failure
   */
  static clearProject(): OperationResult {
    try {
      localStorage.removeItem(PROJECT_STATE_KEY);
      console.log('🗑️ Project cleared');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to clear project state:', error);
      return { success: false, error: `Failed to clear project: ${errorMessage}` };
    }
  }

  /**
   * Check if a project exists
   */
  static hasProject(): boolean {
    return localStorage.getItem(PROJECT_STATE_KEY) !== null;
  }

  /**
   * Migrate old project versions to current version
   */
  private static migrateProject(state: ProjectState): ProjectState {
    // For now, just update the version
    // In the future, handle migrations between versions here
    return {
      ...state,
      version: this.CURRENT_VERSION
    };
  }

  /**
   * Export project as JSON string (for download/sharing)
   */
  static exportProjectJSON(state: ProjectState): string {
    return JSON.stringify(state, null, 2);
  }

  /**
   * Import project from JSON string
   * @returns Result with imported project or error message
   */
  static importProjectJSON(jsonString: string): OperationResult<ProjectState> {
    try {
      const state = JSON.parse(jsonString) as ProjectState;

      // Validate the structure
      if (!state.spriteSheets || !Array.isArray(state.spriteSheets)) {
        return { success: false, error: 'Invalid project file: missing sprite sheet data' };
      }

      // Migrate if needed
      if (state.version !== this.CURRENT_VERSION) {
        return { success: true, data: this.migrateProject(state) };
      }

      return { success: true, data: state };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to import project:', error);
      return { success: false, error: `Failed to import project: ${errorMessage}` };
    }
  }

  /**
   * Get project metadata (without full pixel data)
   */
  static getProjectMetadata(): { createdAt: number; modifiedAt: number; sheetCount: number } | null {
    const result = this.loadProject();
    if (!result.success || !result.data) return null;

    return {
      createdAt: result.data.createdAt,
      modifiedAt: result.data.modifiedAt,
      sheetCount: result.data.spriteSheets.length
    };
  }

  /**
   * Download project as a .pikcell file to user's drive
   */
  static downloadProject(state: ProjectState, filename?: string): void {
    const json = this.exportProjectJSON(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename ?? `pikcell-project-${Date.now()}.pikcell`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('💾 Pikcell project downloaded');
  }

  /**
   * Prompt user to load a project file from their drive
   * @returns Promise with result containing project or error message
   */
  static async loadProjectFromFile(): Promise<OperationResult<ProjectState | null>> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pikcell,application/json';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve({ success: true, data: null }); // User cancelled
          return;
        }

        try {
          const text = await file.text();
          const result = this.importProjectJSON(text);
          if (result.success && result.data) {
            console.log('📂 Pikcell project loaded from file');
          }
          resolve(result.success ? { success: true, data: result.data } : result);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Failed to load pikcell project file:', error);
          resolve({ success: false, error: `Failed to read file: ${errorMessage}` });
        }
      };

      input.click();
    });
  }
}
