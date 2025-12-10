/**
 * JSON Viewer Component
 * Read-only scrollable display for JSON data with monospace font
 */
import * as PIXI from 'pixi.js';
import {
  UIComponent,
  BoxModel,
  MeasuredSize
} from '@moxijs/ui';

export interface JSONViewerProps {
  /** Width of the viewer */
  width: number;
  /** Height of the viewer */
  height: number;
  /** Initial JSON data to display */
  data?: object | null;
  /** Background color */
  backgroundColor?: number;
  /** Text color */
  textColor?: number;
  /** Font size */
  fontSize?: number;
}

/**
 * A read-only scrollable JSON viewer using native PIXI.Text
 */
export class JSONViewer extends UIComponent {
  private textObject: PIXI.Text;
  private background: PIXI.Graphics;
  private props: Required<JSONViewerProps>;
  private currentData: object | null = null;

  constructor(props: JSONViewerProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    this.props = {
      width: props.width,
      height: props.height,
      data: props.data ?? null,
      backgroundColor: props.backgroundColor ?? 0x1a1a2e,
      textColor: props.textColor ?? 0x88ff88,
      fontSize: props.fontSize ?? 12
    };

    this.currentData = this.props.data;

    // Create background
    this.background = new PIXI.Graphics();
    this.drawBackground();
    this.container.addChild(this.background);

    // Create PIXI.Text directly
    this.textObject = new PIXI.Text({
      text: this.formatJSON(this.currentData),
      style: {
        fontFamily: 'Arial',
        fontSize: this.props.fontSize,
        fill: 0x88ff88,
        wordWrap: true,
        wordWrapWidth: this.props.width - 24
      }
    });
    this.textObject.position.set(12, 12);
    this.container.addChild(this.textObject);

    console.log('JSONViewer text created:', this.textObject.text.substring(0, 50));
  }

  private drawBackground(): void {
    this.background.clear();
    this.background.rect(0, 0, this.props.width, this.props.height);
    this.background.fill({ color: this.props.backgroundColor });
  }

  /**
   * Format JSON for display
   */
  private formatJSON(data: object | null): string {
    if (!data) {
      return '// No data to display\n// Select a sprite sheet to see its JSON';
    }

    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return '// Error formatting JSON';
    }
  }

  /**
   * Update the displayed JSON data
   */
  setData(data: object | null): void {
    this.currentData = data;
    const jsonText = this.formatJSON(data);
    this.textObject.text = jsonText;
    console.log('JSONViewer setData:', jsonText.substring(0, 100));
  }

  /**
   * Get the current data
   */
  getData(): object | null {
    return this.currentData;
  }

  /**
   * Update viewer size
   */
  setSize(width: number, height: number): void {
    this.props.width = width;
    this.props.height = height;
    this.layout(width, height);
  }

  measure(): MeasuredSize {
    return {
      width: this.props.width,
      height: this.props.height
    };
  }

  layout(availableWidth: number, availableHeight: number): void {
    this.props.width = availableWidth;
    this.props.height = availableHeight;

    // Update background size
    this.drawBackground();

    // Update text wrap width
    this.textObject.style.wordWrapWidth = availableWidth - 24;

    const measured = this.measure();
    this.computedLayout = {
      x: 0,
      y: 0,
      width: measured.width ?? availableWidth,
      height: measured.height ?? availableHeight,
      contentX: 0,
      contentY: 0,
      contentWidth: measured.width ?? availableWidth,
      contentHeight: measured.height ?? availableHeight
    };
  }

  protected render(): void {
    // Rendering handled by PIXI
  }

  destroy(): void {
    super.destroy();
  }
}
