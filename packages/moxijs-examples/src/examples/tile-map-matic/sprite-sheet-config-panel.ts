/**
 * Sprite Sheet Config Panel
 * Right-side CardPanel with grid settings using FlexContainer layout
 */
import {
  CardPanel,
  FlexContainer,
  FlexDirection,
  FlexAlign,
  FlexJustify,
  EdgeInsets,
  UILabel,
  UIButton,
  UITextInput
} from '@moxijs/ui';
import { SpriteSheetEntry } from './sprite-sheet-project';
import { GridSettings } from './sprite-sheet-data';

/**
 * Callbacks for config panel actions
 */
export interface ConfigPanelCallbacks {
  onGridChange: (cellWidth: number, cellHeight: number) => void;
  onExportSheet: () => void;
  onExportProject: () => void;
  onClearProject: () => void;
  onRemoveSheet?: () => void;
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

  // UI Elements
  private widthInput: UITextInput;
  private heightInput: UITextInput;
  private gridInfoLabel: UILabel;
  private exportSheetBtn: UIButton;
  private exportProjectBtn: UIButton;
  private removeSheetBtn: UIButton;
  private clearProjectBtn: UIButton;

  private callbacks: ConfigPanelCallbacks;
  private currentSheet: SpriteSheetEntry | null = null;

  constructor(props: SpriteSheetConfigPanelProps) {
    this.callbacks = props.callbacks;

    // Create the layout container
    this.layout = new FlexContainer({
      direction: FlexDirection.Column,
      align: FlexAlign.Stretch,
      gap: 12,
      padding: EdgeInsets.all(12)
    });

    // Width input row - stripped down to debug
    const widthLabel = new UILabel({
      text: 'Cell Width:',
      fontSize: 12,
      color: 0xcccccc
    });
    this.widthInput = new UITextInput({
      width: 60,
      height: 28,
      fontSize: 12,
      type: 'number',
      placeholder: '32',
      onChange: () => this.handleGridChange()
    });
    this.layout.addChild(widthLabel);
    this.layout.addChild(this.widthInput);

    // Height input row - stripped down to debug
    const heightLabel = new UILabel({
      text: 'Cell Height:',
      fontSize: 12,
      color: 0xcccccc
    });
    this.heightInput = new UITextInput({
      width: 60,
      height: 28,
      fontSize: 12,
      type: 'number',
      placeholder: '32',
      onChange: () => this.handleGridChange()
    });
    this.layout.addChild(heightLabel);
    this.layout.addChild(this.heightInput);

    // Grid info label
    this.gridInfoLabel = new UILabel({
      text: 'Grid: --',
      fontSize: 11,
      color: 0x888888
    });
    this.layout.addChild(this.gridInfoLabel);

    // Spacer (using an empty container with flex grow)
    const spacer = new FlexContainer({
      height: 20
    });
    this.layout.addChild(spacer);

    // Export sheet button
    this.exportSheetBtn = new UIButton({
      label: 'Export Sheet',
      width: 160,
      height: 32,
      backgroundColor: 0x4a90e2,
      textColor: 0xffffff,
      fontSize: 12,
      onClick: () => this.callbacks.onExportSheet()
    });
    this.layout.addChild(this.exportSheetBtn);

    // Export project button
    this.exportProjectBtn = new UIButton({
      label: 'Export Project',
      width: 160,
      height: 32,
      backgroundColor: 0x5a9a5a,
      textColor: 0xffffff,
      fontSize: 12,
      onClick: () => this.callbacks.onExportProject()
    });
    this.layout.addChild(this.exportProjectBtn);

    // Remove sheet button
    this.removeSheetBtn = new UIButton({
      label: 'Remove Sheet',
      width: 160,
      height: 32,
      backgroundColor: 0x996633,
      textColor: 0xffffff,
      fontSize: 12,
      onClick: () => this.callbacks.onRemoveSheet?.()
    });
    this.layout.addChild(this.removeSheetBtn);

    // Clear project button
    this.clearProjectBtn = new UIButton({
      label: 'Clear Project',
      width: 160,
      height: 32,
      backgroundColor: 0xaa4444,
      textColor: 0xffffff,
      fontSize: 12,
      onClick: () => this.callbacks.onClearProject()
    });
    this.layout.addChild(this.clearProjectBtn);

    // Layout the flex container
    this.layout.layout(180, 400);

    // Create the CardPanel (title shows sheet name, or default)
    this.panel = new CardPanel({
      title: { text: 'No Sheet', fontSize: 14 },
      bodyWidth: 180,
      bodyHeight: 360,
      draggable: true,
      colors: {
        background: 0x2a2a3a,
        border: 0x404050,
        titleBar: 0x333344,
        titleText: 0xffffff
      }
    });

    // Add layout to panel body
    this.panel.getBodyContainer().addChild(this.layout.container);

    // Position the panel
    if (props.x !== undefined && props.y !== undefined) {
      this.panel.container.position.set(props.x, props.y);
    }

    // Initial state (disabled until sheet selected)
    this.setEnabled(false);
  }

  /**
   * Get the CardPanel container for adding to scene
   */
  getPanel(): CardPanel {
    return this.panel;
  }

  /**
   * Set the currently active sheet
   */
  setActiveSheet(sheet: SpriteSheetEntry | null): void {
    this.currentSheet = sheet;

    if (sheet) {
      // Update panel title with sheet name
      this.panel.setTitle(sheet.name);
      // setValue is now silent (doesn't trigger onChange)
      this.widthInput.setValue(String(sheet.gridSettings.cellWidth));
      this.heightInput.setValue(String(sheet.gridSettings.cellHeight));
      this.updateGridInfo(sheet.gridSettings);
      this.setEnabled(true);
    } else {
      this.panel.setTitle('No Sheet');
      this.widthInput.setValue('');
      this.heightInput.setValue('');
      this.gridInfoLabel.setText('Grid: --');
      this.setEnabled(false);
    }
  }

  /**
   * Update grid info display
   */
  updateGridInfo(settings: GridSettings): void {
    const total = settings.columns * settings.rows;
    this.gridInfoLabel.setText(`Grid: ${settings.columns}x${settings.rows} (${total} cells)`);
  }

  /**
   * Enable/disable input controls
   */
  private setEnabled(enabled: boolean): void {
    this.exportSheetBtn.setEnabled(enabled);
    this.removeSheetBtn.setEnabled(enabled);
    // Project buttons stay enabled as long as there's a project
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
}
