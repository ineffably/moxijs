/**
 * Sprite Sheet Project Manager
 * Manages sprite sheet project data with localStorage persistence
 * Stores image data as base64 for persistence across sessions
 */
import {
  GridSettings,
  TileRegion,
  SpriteSheetJSON,
  calculateGrid,
  guessCellSize,
  generateFrames,
  generateFramesWithRegions,
  framesToJSON,
  downloadJSON,
  getCellRegion,
  createRegionFromCells
} from './sprite-sheet-data';

const PROJECT_STORAGE_KEY = 'tilemap-matic-project';

/**
 * Result type for operations that can fail
 */
export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * A single sprite sheet entry in the project
 */
export interface SpriteSheetEntry {
  id: string;
  name: string;
  imageDataUrl: string; // Base64 data URL for persistence
  width: number;
  height: number;
  gridSettings: GridSettings;
  /** Merged tile regions (cells combined into larger tiles) */
  tileRegions: TileRegion[];
  createdAt: number;
  modifiedAt: number;
}

/**
 * Complete project state (persisted to localStorage)
 */
export interface SpriteSheetProject {
  version: string;
  createdAt: number;
  modifiedAt: number;
  sheets: SpriteSheetEntry[];
  activeSheetId: string | null;
}

/**
 * Project bundle for export (includes generated JSON for each sheet)
 */
export interface ProjectBundle {
  project: SpriteSheetProject;
  sheetsJSON: Record<string, SpriteSheetJSON>;
}

/**
 * Input for adding a new sheet (without auto-generated fields)
 */
export interface AddSheetInput {
  name: string;
  imageDataUrl: string;
  width: number;
  height: number;
  gridSettings?: Partial<GridSettings>;
}

type ProjectListener = (project: SpriteSheetProject) => void;

/**
 * Sprite Sheet Project Manager
 * Handles project state with auto-save to localStorage and observer pattern
 */
export class SpriteSheetProjectManager {
  private static readonly CURRENT_VERSION = '1.0.0';

  private project: SpriteSheetProject;
  private listeners: Set<ProjectListener> = new Set();

  constructor() {
    this.project = this.loadFromStorage() ?? this.createEmpty();
  }

  /**
   * Create a new empty project
   */
  private createEmpty(): SpriteSheetProject {
    return {
      version: SpriteSheetProjectManager.CURRENT_VERSION,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      sheets: [],
      activeSheetId: null
    };
  }

  /**
   * Generate a unique ID for a new sheet
   */
  private generateId(): string {
    return `sheet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Load project from localStorage
   */
  private loadFromStorage(): SpriteSheetProject | null {
    try {
      const serialized = localStorage.getItem(PROJECT_STORAGE_KEY);
      if (!serialized) return null;

      const project = JSON.parse(serialized) as SpriteSheetProject;
      console.log(`Loaded project with ${project.sheets.length} sheets`);
      return project;
    } catch (error) {
      console.error('Failed to load project from storage:', error);
      return null;
    }
  }

  /**
   * Save project to localStorage
   */
  private saveToStorage(): OperationResult {
    try {
      this.project.modifiedAt = Date.now();
      const serialized = JSON.stringify(this.project);
      localStorage.setItem(PROJECT_STORAGE_KEY, serialized);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to save project:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Notify all listeners of project changes
   */
  private notify(): void {
    this.listeners.forEach(listener => listener(this.project));
  }

  /**
   * Subscribe to project changes
   * @returns Unsubscribe function
   */
  subscribe(listener: ProjectListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current project state
   */
  getProject(): SpriteSheetProject {
    return this.project;
  }

  /**
   * Get all sheets
   */
  getAllSheets(): SpriteSheetEntry[] {
    return this.project.sheets;
  }

  /**
   * Get a sheet by ID
   */
  getSheet(id: string): SpriteSheetEntry | null {
    return this.project.sheets.find(s => s.id === id) ?? null;
  }

  /**
   * Get the currently active sheet
   */
  getActiveSheet(): SpriteSheetEntry | null {
    if (!this.project.activeSheetId) return null;
    return this.getSheet(this.project.activeSheetId);
  }

  /**
   * Add a new sprite sheet to the project
   */
  addSheet(input: AddSheetInput): SpriteSheetEntry {
    const now = Date.now();

    // Calculate default grid settings if not provided
    // Use smart cell size detection based on image dimensions
    const guessed = guessCellSize(input.width, input.height);
    const defaultCellWidth = input.gridSettings?.cellWidth ?? guessed.cellWidth;
    const defaultCellHeight = input.gridSettings?.cellHeight ?? guessed.cellHeight;
    const gridSettings = calculateGrid(
      input.width,
      input.height,
      defaultCellWidth,
      defaultCellHeight
    );

    const entry: SpriteSheetEntry = {
      id: this.generateId(),
      name: input.name,
      imageDataUrl: input.imageDataUrl,
      width: input.width,
      height: input.height,
      gridSettings,
      tileRegions: [],
      createdAt: now,
      modifiedAt: now
    };

    this.project.sheets.push(entry);
    this.project.activeSheetId = entry.id;
    this.saveToStorage();
    this.notify();

    console.log(`Added sheet: ${entry.name}`);
    return entry;
  }

  /**
   * Remove a sheet from the project
   */
  removeSheet(id: string): void {
    const index = this.project.sheets.findIndex(s => s.id === id);
    if (index === -1) return;

    const removed = this.project.sheets.splice(index, 1)[0];

    // Update active sheet if we removed the active one
    if (this.project.activeSheetId === id) {
      this.project.activeSheetId = this.project.sheets.length > 0
        ? this.project.sheets[Math.max(0, index - 1)].id
        : null;
    }

    this.saveToStorage();
    this.notify();

    console.log(`Removed sheet: ${removed.name}`);
  }

  /**
   * Set the active sheet
   */
  setActiveSheet(id: string | null): void {
    if (id !== null && !this.getSheet(id)) {
      console.warn(`Sheet not found: ${id}`);
      return;
    }

    this.project.activeSheetId = id;
    this.saveToStorage();
    this.notify();
  }

  /**
   * Update grid settings for a sheet
   */
  updateGridSettings(id: string, cellWidth: number, cellHeight: number): void {
    const sheet = this.getSheet(id);
    if (!sheet) return;

    sheet.gridSettings = calculateGrid(sheet.width, sheet.height, cellWidth, cellHeight);
    sheet.modifiedAt = Date.now();
    this.saveToStorage();
    this.notify();
  }

  /**
   * Update sheet name
   */
  updateSheetName(id: string, name: string): void {
    const sheet = this.getSheet(id);
    if (!sheet) return;

    sheet.name = name;
    sheet.modifiedAt = Date.now();
    this.saveToStorage();
    this.notify();
  }

  /**
   * Export a single sheet as PIXI.js JSON
   * Includes tile regions as separate frames
   */
  exportSheetJSON(id: string): SpriteSheetJSON | null {
    const sheet = this.getSheet(id);
    if (!sheet) return null;

    // Use region-aware frame generation if there are tile regions
    // Handle legacy sheets that don't have tileRegions array
    const tileRegions = sheet.tileRegions ?? [];
    const frames = tileRegions.length > 0
      ? generateFramesWithRegions(sheet.name, sheet.gridSettings, tileRegions)
      : generateFrames(sheet.name, sheet.gridSettings);
    return framesToJSON(frames, sheet.name, sheet.width, sheet.height);
  }

  /**
   * Join selected cells into a tile region
   * Returns the new region or null if invalid selection
   */
  joinCells(sheetId: string, cells: Array<{ col: number; row: number }>): TileRegion | null {
    const sheet = this.getSheet(sheetId);
    if (!sheet) return null;

    // Initialize tileRegions if missing (legacy sheets)
    if (!sheet.tileRegions) {
      sheet.tileRegions = [];
    }

    const region = createRegionFromCells(cells, sheet.tileRegions);
    if (!region) return null;

    sheet.tileRegions.push(region);
    sheet.modifiedAt = Date.now();
    this.saveToStorage();
    this.notify();

    return region;
  }

  /**
   * Split a tile region back into individual cells
   * Returns true if region was found and removed
   */
  splitRegion(sheetId: string, regionId: string): boolean {
    const sheet = this.getSheet(sheetId);
    if (!sheet || !sheet.tileRegions) return false;

    const index = sheet.tileRegions.findIndex(r => r.id === regionId);
    if (index === -1) return false;

    sheet.tileRegions.splice(index, 1);
    sheet.modifiedAt = Date.now();
    this.saveToStorage();
    this.notify();

    return true;
  }

  /**
   * Get the tile region at a specific cell, if any
   */
  getRegionAtCell(sheetId: string, col: number, row: number): TileRegion | null {
    const sheet = this.getSheet(sheetId);
    if (!sheet) return null;

    return getCellRegion(col, row, sheet.tileRegions ?? []);
  }

  /**
   * Get all tile regions for a sheet
   */
  getTileRegions(sheetId: string): TileRegion[] {
    const sheet = this.getSheet(sheetId);
    return sheet?.tileRegions ?? [];
  }

  /**
   * Download a single sheet's JSON
   */
  downloadSheetJSON(id: string): void {
    const sheet = this.getSheet(id);
    if (!sheet) return;

    const json = this.exportSheetJSON(id);
    if (json) {
      downloadJSON(json, `${sheet.name}.json`);
    }
  }

  /**
   * Export entire project as a bundle
   */
  exportProjectBundle(): ProjectBundle {
    const sheetsJSON: Record<string, SpriteSheetJSON> = {};

    for (const sheet of this.project.sheets) {
      const json = this.exportSheetJSON(sheet.id);
      if (json) {
        sheetsJSON[sheet.id] = json;
      }
    }

    return {
      project: this.project,
      sheetsJSON
    };
  }

  /**
   * Download project bundle as JSON file
   */
  downloadProjectBundle(): void {
    const bundle = this.exportProjectBundle();
    const jsonString = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tilemap-matic-project.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Clear the entire project
   */
  clearProject(): void {
    this.project = this.createEmpty();
    this.saveToStorage();
    this.notify();
    console.log('Project cleared');
  }

  /**
   * Check if project has any sheets
   */
  hasSheets(): boolean {
    return this.project.sheets.length > 0;
  }

  /**
   * Get sheet count
   */
  getSheetCount(): number {
    return this.project.sheets.length;
  }
}
