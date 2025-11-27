/**
 * FileOperationsManager - Manages file I/O operations
 *
 * Extracted from SpriteEditor to follow Single Responsibility Principle.
 * Handles save/load project files, PNG export, and file dialogs.
 *
 * Supports both .moxiproject and .pikcell file formats.
 */
import { IFileOperationsManager } from '../interfaces/managers';
import { ProjectState, ProjectStateManager } from '../state/project-state-manager';
import { SpriteSheetController } from '../controllers/sprite-sheet-controller';
import { SpriteController } from '../controllers/sprite-controller';
import { FILE_CONSTANTS } from '../config/constants';

/** Supported project file extensions */
const SUPPORTED_EXTENSIONS = [
  FILE_CONSTANTS.PROJECT_FILE_EXTENSION,
  '.pikcell',
];

/**
 * Manages all file operations in the editor
 */
export class FileOperationsManager implements IFileOperationsManager {
  private lastSavedFileName: string | null = null;

  /**
   * Save project to file
   *
   * Downloads a .pikcell JSON file with the current project state
   *
   * @param projectState Project state to save
   * @param filename Optional custom filename
   */
  async saveProject(projectState: ProjectState, filename?: string): Promise<void> {
    if (!this.supportsFileOperations()) {
      throw new Error('File operations not supported in this browser');
    }

    const json = ProjectStateManager.exportProjectJSON(projectState);
    const blob = new Blob([json], { type: 'application/json' });

    // Generate filename if not provided
    const timestamp = new Date().toISOString().split('T')[0];
    const finalFilename = filename ?? `pikcell-project-${timestamp}.pikcell`;

    // Download file
    this.downloadBlob(blob, finalFilename);
    this.lastSavedFileName = finalFilename;

    console.log('💾 Project saved:', finalFilename);
  }

  /**
   * Load project from file
   *
   * Opens a file picker and loads a .pikcell or .moxiproject JSON file
   *
   * @returns Loaded project state or null if cancelled/failed
   */
  async loadProject(): Promise<ProjectState | null> {
    if (!this.supportsFileOperations()) {
      throw new Error('File operations not supported in this browser');
    }

    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = SUPPORTED_EXTENSIONS.join(',');

      input.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) {
          resolve(null);
          return;
        }

        try {
          const text = await file.text();
          const result = ProjectStateManager.importProjectJSON(text);

          if (!result.success || !result.data) {
            console.error('Invalid project file:', result.error);
            resolve(null);
            return;
          }

          this.lastSavedFileName = file.name;
          console.log('📂 Project loaded:', file.name);
          resolve(result.data);
        } catch (error) {
          console.error('Failed to load project file:', error);
          resolve(null);
        }
      };

      input.oncancel = () => {
        resolve(null);
      };

      input.click();
    });
  }

  /**
   * Export sprite sheet as PNG
   *
   * Renders the sprite sheet to a canvas and downloads it as PNG
   *
   * @param spriteSheet Sprite sheet controller to export
   * @param filename Optional custom filename
   */
  async exportPNG(spriteSheet: SpriteSheetController, filename?: string): Promise<void> {
    if (!this.supportsFileOperations()) {
      throw new Error('File operations not supported in this browser');
    }

    // Get sprite sheet data
    const config = spriteSheet.getConfig();
    const pixels = spriteSheet.getPixelData();

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = config.width;
    canvas.height = config.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    // Render pixels to canvas
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        const colorIndex = pixels[y][x];
        const color = config.palette[colorIndex];

        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Convert to PNG blob
    const blob = await this.canvasToBlob(canvas);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const exportFilename = filename || `spritesheet-${config.type.toLowerCase()}-${timestamp}${FILE_CONSTANTS.PNG_EXPORT_EXTENSION}`;

    // Download
    this.downloadBlob(blob, exportFilename);
  }

  /**
   * Export individual sprite as PNG
   *
   * Renders an 8x8 sprite to a canvas and downloads it as PNG
   *
   * @param sprite Sprite controller to export
   * @param filename Optional custom filename
   */
  async exportSpritePNG(sprite: SpriteController, filename?: string): Promise<void> {
    if (!this.supportsFileOperations()) {
      throw new Error('File operations not supported in this browser');
    }

    // Get sprite data
    const { x: cellX, y: cellY } = sprite.getCell();
    const sheetController = sprite.getSpriteSheetController();
    const config = sheetController.getConfig();

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    // Render 8x8 sprite
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const colorIndex = sprite.getPixel(x, y);
        const color = config.palette[colorIndex];

        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Convert to PNG blob
    const blob = await this.canvasToBlob(canvas);

    // Generate filename
    const exportFilename = filename || `sprite-${cellX}-${cellY}${FILE_CONSTANTS.PNG_EXPORT_EXTENSION}`;

    // Download
    this.downloadBlob(blob, exportFilename);
  }

  /**
   * Check if browser supports file operations
   *
   * @returns True if file operations are supported
   */
  supportsFileOperations(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  /**
   * Get the last saved file name
   *
   * @returns Last saved filename or null
   */
  getLastSavedFileName(): string | null {
    return this.lastSavedFileName;
  }

  /**
   * Download a blob as a file
   *
   * @private
   * @param blob Blob to download
   * @param filename Filename for the download
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Convert canvas to PNG blob
   *
   * @private
   * @param canvas Canvas element to convert
   * @returns Promise resolving to PNG blob
   */
  private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      }, 'image/png');
    });
  }

  /**
   * Export sprite sheet with custom scale (for high-res exports)
   *
   * @param spriteSheet Sprite sheet controller to export
   * @param scale Scale factor (e.g., 2 for 2x resolution)
   * @param filename Optional custom filename
   */
  async exportScaledPNG(
    spriteSheet: SpriteSheetController,
    scale: number,
    filename?: string
  ): Promise<void> {
    if (!this.supportsFileOperations()) {
      throw new Error('File operations not supported in this browser');
    }

    // Get sprite sheet data
    const config = spriteSheet.getConfig();
    const pixels = spriteSheet.getPixelData();

    // Create canvas with scaled dimensions
    const canvas = document.createElement('canvas');
    canvas.width = config.width * scale;
    canvas.height = config.height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    // Disable image smoothing for pixel-perfect scaling
    ctx.imageSmoothingEnabled = false;

    // Render pixels to canvas with scaling
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        const colorIndex = pixels[y][x];
        const color = config.palette[colorIndex];

        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }

    // Convert to PNG blob
    const blob = await this.canvasToBlob(canvas);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const exportFilename = filename || `spritesheet-${config.type.toLowerCase()}-${scale}x-${timestamp}${FILE_CONSTANTS.PNG_EXPORT_EXTENSION}`;

    // Download
    this.downloadBlob(blob, exportFilename);
  }

  /**
   * Clear the last saved filename
   *
   * Useful when creating a new project
   */
  clearLastSavedFileName(): void {
    this.lastSavedFileName = null;
  }
}
