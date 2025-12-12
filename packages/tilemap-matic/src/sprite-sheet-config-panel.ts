/**
 * Sprite Sheet Config Panel
 * Right-side CardPanel with grid settings, region preview, and menu
 */
import {
  CardPanel,
  FlexContainer,
  FlexDirection,
  FlexAlign,
  EdgeInsets,
  UILabel,
  UIButton,
  UITextInput,
  FlatCardStyle
} from '@moxijs/ui';
import { Graphics, Container } from 'pixi.js';
import { SpriteSheetEntry } from './sprite-sheet-project';
import { GridSettings, TileRegion } from './sprite-sheet-data';

// Screen dimensions for centering modal
const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 720;

/**
 * Callbacks for config panel actions
 */
export interface ConfigPanelCallbacks {
  onGridChange: (cellWidth: number, cellHeight: number) => void;
  onExportSheet: () => void;
  onExportProject: () => void;
  onClearProject: () => void;
  onRemoveSheet?: () => void;
  onCopyJSON?: () => void;
}

/**
 * Config panel props
 */
export interface SpriteSheetConfigPanelProps {
  callbacks: ConfigPanelCallbacks;
  x?: number;
  y?: number;
}

/**
 * Sprite Sheet Config Panel Component
 * Provides UI for editing grid settings and exporting sheets
 */
export class SpriteSheetConfigPanel {
  private panel: CardPanel;
  private layout: FlexContainer;
  private menuButton: UIButton;
  private menuButtonDots: Graphics;
  private menuDropdown: Container;
  private menuVisible: boolean = false;

  // UI Elements
  private widthInput: UITextInput;
  private heightInput: UITextInput;
  private gridInfoLabel: UILabel;
  private regionPreview: Graphics;
  private regionInfoLabel: UILabel;
  private viewJSONBtn: UIButton; // In panel body, not menu

  // Animation mode indicator
  private animationModeContainer: Container;
  private animationModeLabel: UILabel;

  // Menu buttons (in dropdown)
  private exportSheetBtn: UIButton;
  private exportProjectBtn: UIButton;
  private removeSheetBtn: UIButton;
  private clearProjectBtn: UIButton;

  private callbacks: ConfigPanelCallbacks;
  private currentSheet: SpriteSheetEntry | null = null;

  constructor(props: SpriteSheetConfigPanelProps) {
    this.callbacks = props.callbacks;

    const PANEL_WIDTH = 180;

    // Create the CardPanel first with SE drop shadow
    this.panel = new CardPanel({
      title: { text: 'No Sheet', fontSize: 14 },
      bodyWidth: PANEL_WIDTH,
      bodyHeight: 100, // Initial height, will auto-size to fit content
      draggable: true,
      style: new FlatCardStyle({
        showShadow: true,
        shadowOffset: 6,
        shadowAlpha: 0.4
      }),
      colors: {
        background: 0x28282c,
        border: 0x404045,
        titleBar: 0x333338,
        titleText: 0x9acd32 // Muted lime green to match app title
      }
    });

    // Create [...] menu button in title bar with larger hit area
    const titleBarHeight = this.panel.getTitleBarHeight();
    const MENU_BTN_SIZE = 28;

    this.menuButton = new UIButton({
      width: MENU_BTN_SIZE,
      height: MENU_BTN_SIZE,
      backgroundColor: 0x38383c, // Slightly darker background
      borderRadius: 4,
      onClick: () => this.toggleMenu(),
      onHover: () => this.drawMenuButtonDots(true)
    });

    // Add border around the button (non-interactive so clicks pass through)
    const menuButtonBorder = new Graphics();
    menuButtonBorder.roundRect(0, 0, MENU_BTN_SIZE, MENU_BTN_SIZE, 4);
    menuButtonBorder.stroke({ color: 0x505055, width: 1 });
    menuButtonBorder.eventMode = 'none';
    this.menuButton.container.addChild(menuButtonBorder);

    // Draw the three dots on top of the button (non-interactive)
    this.menuButtonDots = new Graphics();
    this.menuButtonDots.eventMode = 'none';
    this.drawMenuButtonDots(false);
    this.menuButton.container.addChild(this.menuButtonDots);

    // Handle hover out to restore dot color
    this.menuButton.container.on('pointerout', () => {
      if (!this.menuVisible) this.drawMenuButtonDots(false);
    });

    // Position menu button on right side of title bar
    this.menuButton.container.position.set(
      PANEL_WIDTH - MENU_BTN_SIZE - 4,
      (titleBarHeight - MENU_BTN_SIZE) / 2
    );
    this.panel.getTitleBarContainer().addChild(this.menuButton.container);

    // Create modal menu (centered dialog)
    this.menuDropdown = new Container();
    this.menuDropdown.visible = false;

    // Backdrop (dims the screen and catches clicks to close)
    const backdrop = new Graphics();
    backdrop.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    backdrop.fill({ color: 0x000000, alpha: 0.5 });
    backdrop.eventMode = 'static';
    backdrop.cursor = 'default';
    backdrop.on('pointerdown', () => this.hideMenu());
    this.menuDropdown.addChild(backdrop);

    // Menu dialog (4 buttons now - removed View JSON)
    const MENU_WIDTH = 200;
    const MENU_HEIGHT = 220;
    const menuDialog = new Container();
    menuDialog.position.set(
      (SCREEN_WIDTH - MENU_WIDTH) / 2,
      (SCREEN_HEIGHT - MENU_HEIGHT) / 2
    );

    // Dialog background
    const menuBg = new Graphics();
    menuBg.roundRect(0, 0, MENU_WIDTH, MENU_HEIGHT, 8);
    menuBg.fill({ color: 0x28282c });
    menuBg.stroke({ color: 0x48484d, width: 2 });
    menuDialog.addChild(menuBg);

    // Dialog title
    const menuTitle = new UILabel({
      text: 'Actions',
      fontSize: 14,
      color: 0xffffff,
      fontWeight: 'bold'
    });
    menuTitle.container.position.set(MENU_WIDTH / 2 - 25, 12);
    menuDialog.addChild(menuTitle.container);

    // Menu buttons (auto-layout when width/height provided)
    this.exportSheetBtn = new UIButton({
      label: 'Export Sheet JSON',
      width: 170,
      height: 36,
      backgroundColor: 0x4a90e2,
      textColor: 0xffffff,
      fontSize: 12,
      onClick: () => {
        this.callbacks.onExportSheet();
        this.hideMenu();
      }
    });
    this.exportSheetBtn.container.position.set(15, 45);
    menuDialog.addChild(this.exportSheetBtn.container);

    this.exportProjectBtn = new UIButton({
      label: 'Export Project Bundle',
      width: 170,
      height: 36,
      backgroundColor: 0x5a9a5a,
      textColor: 0xffffff,
      fontSize: 12,
      onClick: () => {
        this.callbacks.onExportProject();
        this.hideMenu();
      }
    });
    this.exportProjectBtn.container.position.set(15, 88);
    menuDialog.addChild(this.exportProjectBtn.container);

    this.removeSheetBtn = new UIButton({
      label: 'Remove Current Sheet',
      width: 170,
      height: 36,
      backgroundColor: 0x996633,
      textColor: 0xffffff,
      fontSize: 12,
      onClick: () => {
        this.callbacks.onRemoveSheet?.();
        this.hideMenu();
      }
    });
    this.removeSheetBtn.container.position.set(15, 131);
    menuDialog.addChild(this.removeSheetBtn.container);

    this.clearProjectBtn = new UIButton({
      label: 'Clear Entire Project',
      width: 170,
      height: 36,
      backgroundColor: 0xaa4444,
      textColor: 0xffffff,
      fontSize: 12,
      onClick: () => {
        this.callbacks.onClearProject();
        this.hideMenu();
      }
    });
    this.clearProjectBtn.container.position.set(15, 174);
    menuDialog.addChild(this.clearProjectBtn.container);

    this.menuDropdown.addChild(menuDialog);

    // Create the layout container for body content
    this.layout = new FlexContainer({
      direction: FlexDirection.Column,
      align: FlexAlign.Stretch,
      gap: 6,
      padding: EdgeInsets.all(10)
    });

    // Cell Size section (combined W/H on one line)
    const cellSizeLabel = new UILabel({
      text: 'Cell Size',
      fontSize: 11,
      color: 0x888890
    });
    this.layout.addChild(cellSizeLabel);

    // Width/Height inputs in a row
    const inputRow = new FlexContainer({
      direction: FlexDirection.Row,
      gap: 6,
      align: FlexAlign.Center
    });

    this.widthInput = new UITextInput({
      width: 55,
      height: 26,
      fontSize: 12,
      type: 'number',
      placeholder: '32',
      onChange: () => this.handleGridChange()
    });

    const xLabel = new UILabel({ text: '×', fontSize: 14, color: 0x666670 });

    this.heightInput = new UITextInput({
      width: 55,
      height: 26,
      fontSize: 12,
      type: 'number',
      placeholder: '32',
      onChange: () => this.handleGridChange()
    });

    const pxLabel = new UILabel({ text: 'px', fontSize: 11, color: 0x666670 });

    inputRow.addChild(this.widthInput);
    inputRow.addChild(xLabel);
    inputRow.addChild(this.heightInput);
    inputRow.addChild(pxLabel);
    inputRow.layout(PANEL_WIDTH - 20, 26);
    this.layout.addChild(inputRow);

    // Grid info label (shows cols x rows)
    this.gridInfoLabel = new UILabel({
      text: '',
      fontSize: 10,
      color: 0x707075
    });
    this.layout.addChild(this.gridInfoLabel);

    // Spacer before selection section
    const spacer = new FlexContainer({ height: 4 });
    this.layout.addChild(spacer);

    // Selection section (only visible when there's a selection)
    this.regionInfoLabel = new UILabel({
      text: '',
      fontSize: 10,
      color: 0x707075
    });
    this.layout.addChild(this.regionInfoLabel);

    // Region preview (graphics drawn directly, shown/hidden based on selection)
    this.regionPreview = new Graphics();
    this.layout.container.addChild(this.regionPreview);

    // Animation mode indicator (hidden by default)
    this.animationModeContainer = new Container();
    this.animationModeContainer.visible = false;

    const animModeBg = new Graphics();
    animModeBg.roundRect(0, 0, PANEL_WIDTH - 20, 50, 6);
    animModeBg.fill({ color: 0xffaa00, alpha: 0.2 });
    animModeBg.stroke({ color: 0xffaa00, width: 2 });
    this.animationModeContainer.addChild(animModeBg);

    const animModeTitle = new UILabel({
      text: '🎬 Animation Mode',
      fontSize: 12,
      color: 0xffaa00,
      fontWeight: 'bold'
    });
    animModeTitle.container.position.set(8, 6);
    this.animationModeContainer.addChild(animModeTitle.container);

    this.animationModeLabel = new UILabel({
      text: 'Click cells in order',
      fontSize: 10,
      color: 0xddaa44
    });
    this.animationModeLabel.container.position.set(8, 26);
    this.animationModeContainer.addChild(this.animationModeLabel.container);

    this.layout.container.addChild(this.animationModeContainer);

    // Spacer to push button to bottom
    const bottomSpacer = new FlexContainer({ height: 8 });
    this.layout.addChild(bottomSpacer);

    // Copy JSON button at bottom of panel
    this.viewJSONBtn = new UIButton({
      label: 'Copy JSON',
      width: PANEL_WIDTH - 20,
      height: 32,
      backgroundColor: 0x4a90e2,
      textColor: 0xffffff,
      fontSize: 12,
      onClick: () => {
        this.callbacks.onCopyJSON?.();
      }
    });
    this.layout.addChild(this.viewJSONBtn);

    // Layout the flex container (use a large height, panel will size to fit)
    this.layout.layout(PANEL_WIDTH, 500);

    // Add layout to panel body
    this.panel.getBodyContainer().addChild(this.layout.container);

    // Auto-size panel to fit content
    this.panel.sizeToFit();

    // Position the panel
    if (props.x !== undefined && props.y !== undefined) {
      this.panel.container.position.set(props.x, props.y);
    }

    // Initial state
    this.setEnabled(false);
  }

  /**
   * Draw the [...] dots on the menu button
   */
  private drawMenuButtonDots(hover: boolean): void {
    this.menuButtonDots.clear();
    const color = hover ? 0xffffff : 0xaaaaaa;
    // Draw three dots centered in the 28x28 button
    const centerY = 14;
    const dotSpacing = 6;
    const startX = 14 - dotSpacing; // Center the 3 dots
    for (let i = 0; i < 3; i++) {
      this.menuButtonDots.circle(startX + i * dotSpacing, centerY, 2);
    }
    this.menuButtonDots.fill({ color });
  }

  /**
   * Toggle menu visibility
   */
  private toggleMenu(): void {
    if (this.menuVisible) {
      this.hideMenu();
    } else {
      this.showMenu();
    }
  }

  /**
   * Show the modal menu
   */
  private showMenu(): void {
    this.menuVisible = true;
    this.menuDropdown.visible = true;
    this.drawMenuButtonDots(true);
  }

  /**
   * Hide the dropdown menu
   */
  private hideMenu(): void {
    this.menuVisible = false;
    this.menuDropdown.visible = false;
    this.drawMenuButtonDots(false);
  }

  /**
   * Get the CardPanel container for adding to scene
   */
  getPanel(): CardPanel {
    return this.panel;
  }

  /**
   * Get the menu dropdown container (add to scene after panel for z-order)
   */
  getMenuDropdown(): Container {
    return this.menuDropdown;
  }

  /**
   * Set the currently active sheet
   */
  setActiveSheet(sheet: SpriteSheetEntry | null): void {
    this.currentSheet = sheet;

    if (sheet) {
      this.panel.setTitle(sheet.name);
      this.widthInput.setValue(String(sheet.gridSettings.cellWidth));
      this.heightInput.setValue(String(sheet.gridSettings.cellHeight));
      this.updateGridInfo(sheet.gridSettings);
      this.setEnabled(true);
    } else {
      this.panel.setTitle('No Sheet');
      this.widthInput.setValue('');
      this.heightInput.setValue('');
      this.gridInfoLabel.setText('');
      this.clearRegionPreview();
      this.setEnabled(false);
    }
  }

  /**
   * Update the region preview with selected cells/region
   */
  updateRegionPreview(
    cells: Array<{ col: number; row: number }>,
    gridSettings: GridSettings,
    region?: TileRegion
  ): void {
    this.regionPreview.clear();

    if (cells.length === 0) {
      this.regionInfoLabel.setText('');
      return;
    }

    // Calculate bounds
    const minCol = Math.min(...cells.map(c => c.col));
    const maxCol = Math.max(...cells.map(c => c.col));
    const minRow = Math.min(...cells.map(c => c.row));
    const maxRow = Math.max(...cells.map(c => c.row));

    const colSpan = maxCol - minCol + 1;
    const rowSpan = maxRow - minRow + 1;
    const cellW = gridSettings.cellWidth;
    const cellH = gridSettings.cellHeight;
    const pixelW = colSpan * cellW;
    const pixelH = rowSpan * cellH;

    // Update info label with selection details
    if (region) {
      this.regionInfoLabel.setText(`Selected: ${colSpan}×${rowSpan} (${pixelW}×${pixelH}px)`);
    } else {
      this.regionInfoLabel.setText(`Selected: ${cells.length} cell${cells.length > 1 ? 's' : ''}`);
    }
  }

  /**
   * Clear the region preview
   */
  clearRegionPreview(): void {
    this.regionPreview.clear();
    this.regionInfoLabel.setText('');
  }

  /**
   * Update grid info display
   */
  updateGridInfo(settings: GridSettings): void {
    const total = settings.columns * settings.rows;
    this.gridInfoLabel.setText(`Grid: ${settings.columns} × ${settings.rows} = ${total} cells`);
  }

  /**
   * Enable/disable input controls
   */
  private setEnabled(enabled: boolean): void {
    this.viewJSONBtn.setEnabled(enabled);
    this.exportSheetBtn.setEnabled(enabled);
    this.removeSheetBtn.setEnabled(enabled);
  }

  /**
   * Handle grid settings change from inputs
   */
  private handleGridChange(): void {
    if (!this.currentSheet) return;

    const width = parseInt(this.widthInput.getValue(), 10);
    const height = parseInt(this.heightInput.getValue(), 10);

    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      this.callbacks.onGridChange(width, height);
    }
  }

  /**
   * Update the sheet count display (for project button state)
   */
  setHasSheets(hasSheets: boolean): void {
    this.exportProjectBtn.setEnabled(hasSheets);
    this.clearProjectBtn.setEnabled(hasSheets);
  }

  /**
   * Get focusable inputs for registration with UIFocusManager
   */
  getFocusableInputs(): UITextInput[] {
    return [this.widthInput, this.heightInput];
  }

  /**
   * Set animation mode indicator visibility and frame count
   * @param active - Whether animation mode is active
   * @param frameCount - Number of frames selected (shown when active)
   */
  setAnimationMode(active: boolean, frameCount: number = 0): void {
    this.animationModeContainer.visible = active;

    if (active) {
      if (frameCount === 0) {
        this.animationModeLabel.setText('Click cells in order');
      } else {
        this.animationModeLabel.setText(`${frameCount} frame${frameCount > 1 ? 's' : ''} selected`);
      }
    }

    // Re-layout to adjust panel size
    this.panel.sizeToFit();
  }

  /**
   * Show brief "Copied!" feedback on the Copy JSON button
   */
  showCopyFeedback(): void {
    this.viewJSONBtn.setLabel('Copied!');
    setTimeout(() => this.viewJSONBtn.setLabel('Copy JSON'), 1500);
  }
}
