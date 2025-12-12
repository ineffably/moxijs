/**
 * Sprite Sheet Project Manager
 * Manages sprite sheet project data with localStorage persistence
 * Stores image data as base64 for persistence across sessions
 */
import {
  GridSettings,
  TileRegion,
  AnimationSequence,
  SpriteSheetJSON,
  calculateGrid,
  guessCellSize,
  generateFrames,
  generateFramesWithRegions,
  framesToJSON,
  downloadJSON,
  getCellRegion,
  createRegionFromCells,
  generateAnimationId
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
 * Named cell - a single cell with a custom name and optional description
 */
export interface NamedCell {
  /** Grid column (0-indexed) */
  col: number;
  /** Grid row (0-indexed) */
  row: number;
  /** Custom name for this cell (e.g., "milk_jug") */
  name: string;
  /** Optional description */
  description?: string;
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
  /** Animation sequences (ordered frame collections) */
  animations: AnimationSequence[];
  /** Named individual cells */
  namedCells: NamedCell[];
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
      animations: [],
      namedCells: [],
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
   * Includes grid settings, tile regions, animations, and named cells
   */
  exportSheetJSON(id: string): SpriteSheetJSON | null {
    const sheet = this.getSheet(id);
    if (!sheet) return null;

    // Use region-aware frame generation if there are tile regions
    // Handle legacy sheets that don't have tileRegions array
    const tileRegions = sheet.tileRegions ?? [];
    const animations = sheet.animations ?? [];
    const namedCells = sheet.namedCells ?? [];
    const frames = tileRegions.length > 0
      ? generateFramesWithRegions(sheet.name, sheet.gridSettings, tileRegions)
      : generateFrames(sheet.name, sheet.gridSettings);
    return framesToJSON(
      frames,
      sheet.name,
      sheet.width,
      sheet.height,
      sheet.gridSettings,
      animations,
      namedCells
    );
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

  // ==========================================
  // Animation Management
  // ==========================================

  /**
   * Add a new animation sequence from ordered cell selection
   * @param sheetId - The sheet to add the animation to
   * @param frames - Ordered array of cell coordinates
   * @param name - Optional name (auto-generated if not provided)
   * @returns The created animation or null if invalid
   */
  addAnimation(
    sheetId: string,
    frames: Array<{ col: number; row: number }>,
    name?: string
  ): AnimationSequence | null {
    const sheet = this.getSheet(sheetId);
    if (!sheet || frames.length < 1) return null;

    // Initialize animations array if missing (legacy sheets)
    if (!sheet.animations) {
      sheet.animations = [];
    }

    const animation: AnimationSequence = {
      id: generateAnimationId(),
      name: name || `animation_${sheet.animations.length + 1}`,
      frames: [...frames], // Copy to avoid mutation
      frameDuration: 100, // Default 100ms per frame
      loop: true
    };

    sheet.animations.push(animation);
    sheet.modifiedAt = Date.now();
    this.saveToStorage();
    this.notify();

    console.log(`Added animation: ${animation.name} with ${frames.length} frames`);
    return animation;
  }

  /**
   * Update an existing animation
   */
  updateAnimation(
    sheetId: string,
    animationId: string,
    updates: Partial<Omit<AnimationSequence, 'id'>>
  ): boolean {
    const sheet = this.getSheet(sheetId);
    if (!sheet || !sheet.animations) return false;

    const animation = sheet.animations.find(a => a.id === animationId);
    if (!animation) return false;

    // Apply updates
    if (updates.name !== undefined) animation.name = updates.name;
    if (updates.frames !== undefined) animation.frames = [...updates.frames];
    if (updates.frameDuration !== undefined) animation.frameDuration = updates.frameDuration;
    if (updates.loop !== undefined) animation.loop = updates.loop;
    if (updates.inputBinding !== undefined) animation.inputBinding = updates.inputBinding;

    sheet.modifiedAt = Date.now();
    this.saveToStorage();
    this.notify();

    return true;
  }

  /**
   * Remove an animation from a sheet
   */
  removeAnimation(sheetId: string, animationId: string): boolean {
    const sheet = this.getSheet(sheetId);
    if (!sheet || !sheet.animations) return false;

    const index = sheet.animations.findIndex(a => a.id === animationId);
    if (index === -1) return false;

    const removed = sheet.animations.splice(index, 1)[0];
    sheet.modifiedAt = Date.now();
    this.saveToStorage();
    this.notify();

    console.log(`Removed animation: ${removed.name}`);
    return true;
  }

  /**
   * Get all animations for a sheet
   */
  getAnimations(sheetId: string): AnimationSequence[] {
    const sheet = this.getSheet(sheetId);
    return sheet?.animations ?? [];
  }

  /**
   * Get a specific animation by ID
   */
  getAnimation(sheetId: string, animationId: string): AnimationSequence | null {
    const sheet = this.getSheet(sheetId);
    if (!sheet || !sheet.animations) return null;
    return sheet.animations.find(a => a.id === animationId) ?? null;
  }

  /**
   * Update region name
   */
  updateRegionName(sheetId: string, regionId: string, name: string): boolean {
    const sheet = this.getSheet(sheetId);
    if (!sheet || !sheet.tileRegions) return false;

    const region = sheet.tileRegions.find(r => r.id === regionId);
    if (!region) return false;

    region.name = name;
    sheet.modifiedAt = Date.now();
    this.saveToStorage();
    this.notify();

    return true;
  }

  // ==========================================
  // Named Cell Management
  // ==========================================

  /**
   * Set or update a named cell
   * @param sheetId - The sheet ID
   * @param col - Grid column
   * @param row - Grid row
   * @param name - Name for this cell
   * @param description - Optional description
   */
  setNamedCell(sheetId: string, col: number, row: number, name: string, description?: string): boolean {
    const sheet = this.getSheet(sheetId);
    if (!sheet) return false;

    // Initialize namedCells if missing (legacy sheets)
    if (!sheet.namedCells) {
      sheet.namedCells = [];
    }

    // Check if cell already has a name
    const existing = sheet.namedCells.find(c => c.col === col && c.row === row);
    if (existing) {
      existing.name = name;
      existing.description = description;
    } else {
      sheet.namedCells.push({ col, row, name, description });
    }

    sheet.modifiedAt = Date.now();
    this.saveToStorage();
    this.notify();

    return true;
  }

  /**
   * Remove a named cell
   */
  removeNamedCell(sheetId: string, col: number, row: number): boolean {
    const sheet = this.getSheet(sheetId);
    if (!sheet || !sheet.namedCells) return false;

    const index = sheet.namedCells.findIndex(c => c.col === col && c.row === row);
    if (index === -1) return false;

    sheet.namedCells.splice(index, 1);
    sheet.modifiedAt = Date.now();
    this.saveToStorage();
    this.notify();

    return true;
  }

  /**
   * Get named cell at position
   */
  getNamedCell(sheetId: string, col: number, row: number): NamedCell | null {
    const sheet = this.getSheet(sheetId);
    if (!sheet || !sheet.namedCells) return null;
    return sheet.namedCells.find(c => c.col === col && c.row === row) ?? null;
  }

  /**
   * Get all named cells for a sheet
   */
  getNamedCells(sheetId: string): NamedCell[] {
    const sheet = this.getSheet(sheetId);
    return sheet?.namedCells ?? [];
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
