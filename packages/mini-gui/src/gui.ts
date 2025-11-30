/**
 * GUI
 *
 * Main container for mini-gui. Provides a collapsible, draggable
 * panel with automatic control type detection based on property values.
 *
 * @example
 * ```ts
 * import { GUI } from '@moxijs/mini-gui';
 *
 * const gui = new GUI({ title: 'Player' });
 * gui.add(player, 'speed', 0, 10);
 * gui.add(player, 'isAlive');
 * scene.addChild(gui);
 * ```
 */

import { Container, Graphics } from 'pixi.js';
import { UIComponent, UILabel } from '@moxijs/core';
import { px, GUI_CONST, GUI_COLORS } from './gui-grid';
import {
  Control,
  ChangeCallback,
  NumberControl,
  BooleanControl,
  StringControl,
  OptionControl,
} from './controls';
import { GUIHeader, GUIBody } from './components';

/** GUI configuration options */
export interface GUIOptions {
  /** GUI title (default: 'Controls') */
  title?: string;
  /** Width in grid units (default: 100 = 200px at 2x) */
  width?: number;
  /** Row height in grid units (default: 12 = 24px at 2x) */
  rowHeight?: number;
  /** Label width ratio 0-1 (default: 0.35) */
  labelRatio?: number;
  /** Padding in grid units (default: 3 = 6px at 2x) */
  padding?: number;
  /** Initial x position in pixels */
  x?: number;
  /** Initial y position in pixels */
  y?: number;
  /** Start collapsed (default: false) */
  closed?: boolean;
  /** Allow dragging (default: true) */
  draggable?: boolean;
  /** Child folders start closed (default: false) */
  closeFolders?: boolean;
  /** Parent GUI (for folders) */
  parent?: GUI;
}

/** Resolved GUI config with all values */
export interface GUIConfig {
  width: number;
  rowHeight: number;
  labelRatio: number;
  padding: number;
  headerHeight: number;
  gap: number;
  border: number;
  fontFamily: string;
  fontSize: number;
}

/** Change event data passed to callbacks */
export interface ChangeEvent<T = unknown> {
  object: Record<string, unknown>;
  property: string;
  value: T;
  control: Control<T>;
}

/**
 * Minimal debug GUI container.
 *
 * Supports automatic control type detection, folders, drag, collapse,
 * and save/load state persistence.
 */
export class GUI extends UIComponent {
  /** GUI title */
  protected _title: string;

  /** GUI width in grid units */
  protected _width: number;

  /** Resolved configuration */
  readonly config: GUIConfig;

  /** Whether GUI is collapsed */
  protected _closed: boolean;

  /** Whether GUI is draggable */
  protected _draggable: boolean;

  /** Whether child folders start closed */
  protected _closeFolders: boolean;

  /** Parent GUI (if this is a folder) */
  protected _parent?: GUI;

  /** Root GUI (topmost parent) */
  protected _root: GUI;

  /** Child controls */
  protected _controls: Control[] = [];

  /** Child folders */
  protected _folders: GUI[] = [];

  /** All children (controls + folders) */
  protected _children: (Control | GUI)[] = [];

  /** Background graphics */
  protected _background: Graphics;

  /** Header component */
  protected _header: GUIHeader;

  /** Body component (holds controls) */
  protected _guiBody: GUIBody;

  /** onChange callback */
  protected _onChange?: (event: ChangeEvent) => void;

  /** onFinishChange callback */
  protected _onFinishChange?: (event: ChangeEvent) => void;

  /** onOpenClose callback */
  protected _onOpenClose?: (gui: GUI) => void;

  constructor(options: GUIOptions = {}) {
    super();

    this._title = options.title ?? 'Controls';
    this._width = options.width ?? GUI_CONST.width;
    this._closed = options.closed ?? false;
    this._draggable = options.draggable ?? true;
    this._closeFolders = options.closeFolders ?? false;
    this._parent = options.parent;
    this._root = this._parent ? this._parent._root : this;

    // Build resolved config - inherit from parent or use defaults
    const parentConfig = this._parent?.config;
    this.config = {
      width: options.width ?? parentConfig?.width ?? GUI_CONST.width,
      rowHeight: options.rowHeight ?? parentConfig?.rowHeight ?? GUI_CONST.rowHeight,
      labelRatio: options.labelRatio ?? parentConfig?.labelRatio ?? GUI_CONST.labelRatio,
      padding: options.padding ?? parentConfig?.padding ?? GUI_CONST.padding,
      headerHeight: GUI_CONST.headerHeight,
      gap: GUI_CONST.gap,
      border: GUI_CONST.border,
      fontFamily: GUI_CONST.fontFamily,
      fontSize: GUI_CONST.fontSize,
    };
    this._width = this.config.width;

    // Register with parent
    if (this._parent) {
      this._parent._children.push(this);
      this._parent._folders.push(this);
    }

    // Create background
    this._background = new Graphics();
    this.container.addChild(this._background);

    // Create header component
    this._header = new GUIHeader({
      title: this._title,
      config: this.config,
      draggable: this._draggable && !this._parent,
      collapsed: this._closed,
      isFolder: !!this._parent,
    });
    this._header.onToggle(() => this.toggle());
    this._header.onDrag((dx, dy) => {
      this.container.x += dx;
      this.container.y += dy;
    });
    this.container.addChild(this._header.container);

    // Create body component
    this._guiBody = new GUIBody({
      config: this.config,
      collapsed: this._closed,
    });
    this._guiBody.container.y = px(this.config.headerHeight);
    this._guiBody.onOpenClose(() => {
      this._render();
      if (this._parent) {
        this._parent._layoutChildren();
      }
    });
    this.container.addChild(this._guiBody.container);

    // Position
    if (options.x !== undefined) this.container.x = options.x;
    if (options.y !== undefined) this.container.y = options.y;

    // Initial render
    this._render();
  }

  /** Set GUI title */
  title(title: string): this {
    this._title = title;
    this._header.setTitle(title);
    return this;
  }

  /**
   * Add a control for a property.
   * Automatically detects type based on value.
   *
   * @param object - Object containing the property
   * @param property - Property name to control
   * @param minOrOptions - For numbers: min value. For options: array or object of choices
   * @param max - For numbers: max value
   * @param step - For numbers: step increment
   */
  add<T extends Record<string, unknown>, K extends keyof T>(
    object: T,
    property: K,
    minOrOptions?: number | T[K][] | Record<string, T[K]>,
    max?: number,
    step?: number
  ): Control {
    const value = object[property];
    let control: Control;

    // Check if options were provided (array or object)
    if (Array.isArray(minOrOptions) || (typeof minOrOptions === 'object' && minOrOptions !== null && typeof minOrOptions !== 'number')) {
      // Option control
      control = new OptionControl(
        this,
        object as Record<string, unknown>,
        property as string,
        minOrOptions as T[K][] | Record<string, T[K]>
      );
    } else if (typeof value === 'boolean') {
      // Boolean control
      control = new BooleanControl(
        this,
        object as Record<string, unknown>,
        property as string
      );
    } else if (typeof value === 'number') {
      // Number control
      control = new NumberControl(
        this,
        object as Record<string, unknown>,
        property as string,
        minOrOptions as number | undefined,
        max,
        step
      );
    } else if (typeof value === 'string') {
      // String control
      control = new StringControl(
        this,
        object as Record<string, unknown>,
        property as string
      );
    } else {
      throw new Error(`Cannot create control for property "${String(property)}" with value type "${typeof value}"`);
    }

    // Register control
    this._controls.push(control);
    this._children.push(control);
    this._guiBody.content.addChild(control.container);
    this._layoutChildren();

    return control;
  }

  /**
   * Add a color control.
   */
  addColor<T extends Record<string, unknown>, K extends keyof T>(
    object: T,
    property: K,
    rgbScale = 1
  ): Control {
    throw new Error('ColorControl not yet implemented. Coming in Phase 3.');
  }

  /**
   * Add a folder (nested GUI).
   */
  addFolder(title: string): GUI {
    const folder = new GUI({
      parent: this,
      title,
      width: this._width,
      draggable: false,
      closed: this._root._closeFolders,
    });

    this._guiBody.content.addChild(folder.container);
    this._layoutChildren();

    return folder;
  }

  /** Open the GUI */
  open(open = true): this {
    if (this._closed === !open) return this;

    this._closed = !open;
    this._header.setCollapsed(this._closed);

    if (this._closed) {
      this._guiBody.collapse();
    } else {
      this._guiBody.expand();
    }

    if (this._onOpenClose) {
      this._onOpenClose(this);
    }
    if (this._parent) {
      this._parent._callOnOpenClose(this);
    }

    this._render();
    return this;
  }

  /** Close the GUI */
  close(): this {
    return this.open(false);
  }

  /** Toggle open/closed */
  toggle(): this {
    return this.open(this._closed);
  }

  /** Register onChange callback */
  onChange(callback: (event: ChangeEvent) => void): this {
    this._onChange = callback;
    return this;
  }

  /** Register onFinishChange callback */
  onFinishChange(callback: (event: ChangeEvent) => void): this {
    this._onFinishChange = callback;
    return this;
  }

  /** Register onOpenClose callback */
  onOpenClose(callback: (gui: GUI) => void): this {
    this._onOpenClose = callback;
    return this;
  }

  /** Reset all controls to initial values */
  reset(recursive = true): this {
    const controls = recursive ? this.controllersRecursive() : this._controls;
    controls.forEach((c) => c.reset());
    return this;
  }

  /** Save GUI state */
  save(recursive = true): Record<string, unknown> {
    const state: Record<string, unknown> = {
      controllers: {} as Record<string, unknown>,
      folders: {} as Record<string, unknown>,
    };

    this._controls.forEach((c) => {
      (state.controllers as Record<string, unknown>)[(c as any)._name] = c.save();
    });

    if (recursive) {
      this._folders.forEach((f) => {
        (state.folders as Record<string, unknown>)[f._title] = f.save();
      });
    }

    return state;
  }

  /** Load GUI state */
  load(state: Record<string, unknown>, recursive = true): this {
    const controllers = state.controllers as Record<string, unknown> | undefined;
    const folders = state.folders as Record<string, unknown> | undefined;

    if (controllers) {
      this._controls.forEach((c) => {
        const name = (c as any)._name;
        if (name in controllers) {
          c.load(controllers[name] as any);
        }
      });
    }

    if (recursive && folders) {
      this._folders.forEach((f) => {
        if (f._title in folders) {
          f.load(folders[f._title] as Record<string, unknown>);
        }
      });
    }

    return this;
  }

  /** Get all controls recursively */
  controllersRecursive(): Control[] {
    let controls = [...this._controls];
    for (const folder of this._folders) {
      controls = controls.concat(folder.controllersRecursive());
    }
    return controls;
  }

  /** Get all folders recursively */
  foldersRecursive(): GUI[] {
    let folders: GUI[] = [];
    for (const folder of this._folders) {
      folders.push(folder);
      folders = folders.concat(folder.foldersRecursive());
    }
    return folders;
  }

  /** Destroy the GUI */
  destroy(): void {
    if (this._parent) {
      const idx = this._parent._children.indexOf(this);
      if (idx !== -1) this._parent._children.splice(idx, 1);
      const fIdx = this._parent._folders.indexOf(this);
      if (fIdx !== -1) this._parent._folders.splice(fIdx, 1);
    }
    this._children.forEach((c) => c.destroy());
    this.container.destroy({ children: true });
  }

  /** Called by controls when value changes */
  _callOnChange(control: Control): void {
    if (this._parent) {
      this._parent._callOnChange(control);
    }
    if (this._onChange) {
      this._onChange({
        object: (control as any)._object,
        property: (control as any)._property,
        value: control.getValue(),
        control,
      });
    }
  }

  /** Called by controls when value change is complete */
  _callOnFinishChange(control: Control): void {
    if (this._parent) {
      this._parent._callOnFinishChange(control);
    }
    if (this._onFinishChange) {
      this._onFinishChange({
        object: (control as any)._object,
        property: (control as any)._property,
        value: control.getValue(),
        control,
      });
    }
  }

  /** Called when GUI opens/closes */
  _callOnOpenClose(gui: GUI): void {
    if (this._parent) {
      this._parent._callOnOpenClose(gui);
    }
    if (this._onOpenClose) {
      this._onOpenClose(gui);
    }
  }

  /** Remove a control */
  _removeControl(control: Control): void {
    const idx = this._children.indexOf(control);
    if (idx !== -1) this._children.splice(idx, 1);
    const cIdx = this._controls.indexOf(control);
    if (cIdx !== -1) this._controls.splice(cIdx, 1);
    this._guiBody.content.removeChild(control.container);
    this._layoutChildren();
  }

  /** Layout child controls and folders */
  protected _layoutChildren(): void {
    let y = 0;

    for (const child of this._children) {
      child.container.y = y;
      const size = child.measure();
      y += size.height + px(this.config.gap);
    }

    // Add bottom padding
    const contentHeight = y + px(this.config.padding);
    this._guiBody.setContentHeight(contentHeight);

    this._render();

    // Notify parent that our size changed (for nested folders)
    if (this._parent) {
      this._parent._layoutChildren();
    }
  }

  /** Measure GUI size */
  measure(): { width: number; height: number } {
    const width = px(this._width);
    const headerHeight = px(this.config.headerHeight);
    const bodyHeight = this._guiBody.getVisibleHeight();

    return { width, height: headerHeight + bodyHeight };
  }

  /** Render the GUI */
  protected _render(): void {
    const { width, height } = this.measure();

    // Draw background
    this._background.clear();

    // Main background
    this._background.roundRect(0, 0, width, height, px(1));
    this._background.fill(GUI_COLORS.background);
    this._background.stroke({ color: GUI_COLORS.border, width: px(this.config.border) });
  }

  layout(availableWidth: number, availableHeight: number): void {
    this._layoutChildren();
  }

  protected render(): void {
    this._render();
  }
}

export default GUI;
