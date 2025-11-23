/**
 * Tool selection toolbar component for sprite editor
 */
import PIXI from 'pixi.js';
import { DraggableToolbar, DraggableToolbarProps } from './draggable-toolbar';
import { createPixelButton } from './pixel-button';
import { createToolIcon } from './tool-icons';

export type ToolType = 'pencil' | 'eraser' | 'eyedropper' | 'fill';

export interface ToolSelectionToolbarProps extends Omit<DraggableToolbarProps, 'title'> {
  onToolSelect?: (tool: ToolType) => void;
  selectedTool?: ToolType;
}

/**
 * A toolbar for selecting drawing tools
 */
export class ToolSelectionToolbar extends DraggableToolbar {
  private tools: ToolType[] = ['pencil', 'eraser', 'eyedropper', 'fill'];
  private selectedTool: ToolType;
  private onToolSelect?: (tool: ToolType) => void;
  private toolButtons: PIXI.Container[] = [];

  constructor(props: ToolSelectionToolbarProps = {}) {
    super({
      title: 'Tools',
      width: props.width ?? 100,
      height: props.height ?? 200,
      ...props
    });

    this.selectedTool = props.selectedTool ?? 'pencil';
    this.onToolSelect = props.onToolSelect;

    this.createToolButtons();
  }

  /**
   * Creates tool selection buttons
   */
  private createToolButtons(): void {
    const contentContainer = this.getContentContainer();
    const buttonSize = 45; // Square buttons (decreased size)
    const spacing = 8;
    const startX = 10;
    let startY = 10;

    this.tools.forEach((tool) => {
      const iconColor = 0x212123; // CC-29 very dark
      const button = createPixelButton({
        icon: () => createToolIcon(tool, buttonSize - 16, iconColor),
        width: buttonSize,
        height: buttonSize,
        x: startX,
        y: startY,
        selected: this.selectedTool === tool,
        backgroundColor: this.selectedTool === tool ? 0xede19e : 0xb8b5b9, // CC-29 light yellow if selected, light gray otherwise
        iconColor: iconColor,
        onClick: () => this.selectTool(tool)
      });

      contentContainer.addChild(button);
      this.toolButtons.push(button);

      startY += buttonSize + spacing;
    });
  }

  /**
   * Selects a tool
   */
  private selectTool(tool: ToolType): void {
    this.selectedTool = tool;

    // Update button visuals - recreate buttons with new selection state
    const contentContainer = this.getContentContainer();
    this.toolButtons.forEach(btn => contentContainer.removeChild(btn));
    this.toolButtons = [];
    this.createToolButtons();

    // Call callback
    if (this.onToolSelect) {
      this.onToolSelect(tool);
    }
  }

  /**
   * Gets the currently selected tool
   */
  getSelectedTool(): ToolType {
    return this.selectedTool;
  }

  /**
   * Sets the selected tool programmatically
   */
  setSelectedTool(tool: ToolType): void {
    this.selectTool(tool);
  }
}

