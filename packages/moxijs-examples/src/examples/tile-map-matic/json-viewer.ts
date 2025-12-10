/**
 * JSON Viewer Component
 * Read-only scrollable display for JSON data with monospace font
 */
import {
  UIComponent,
  UIScrollContainer,
  UILabel,
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
 * A read-only scrollable JSON viewer with monospace font
 */
export class JSONViewer extends UIComponent {
  private scrollContainer: UIScrollContainer;
  private label: UILabel;
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

    // Create scroll container
    this.scrollContainer = new UIScrollContainer({
      width: this.props.width,
      height: this.props.height,
      backgroundColor: this.props.backgroundColor,
      borderRadius: 4,
      scrollbarWidth: 8,
      scrollbarTrackColor: 0x2a2a3a,
      scrollbarThumbColor: 0x4a4a5a,
      scrollbarThumbHoverColor: 0x6a6a7a,
      smoothScroll: true,
      scrollEasing: 0.2
    });

    // Create label for JSON text
    this.label = new UILabel({
      text: this.formatJSON(this.currentData),
      fontSize: this.props.fontSize,
      color: this.props.textColor,
      fontFamily: 'monospace',
      wordWrap: true,
      wordWrapWidth: this.props.width - 32 // Account for padding and scrollbar
    });

    this.scrollContainer.addChild(this.label);
    this.container.addChild(this.scrollContainer.container);

    // Initial layout
    this.layout(this.props.width, this.props.height);
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
    const text = this.formatJSON(data);
    this.label.setText(text);

    // Force scroll container to recalculate content height
    this.scrollContainer.layout(this.props.width, this.props.height);
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
    return this.layoutEngine.measure(this.boxModel, {
      width: this.props.width,
      height: this.props.height
    });
  }

  layout(availableWidth: number, availableHeight: number): void {
    this.props.width = availableWidth;
    this.props.height = availableHeight;

    // Layout scroll container
    this.scrollContainer.layout(availableWidth, availableHeight);

    const measured = this.measure();
    this.computedLayout = this.layoutEngine.layout(
      this.boxModel,
      measured,
      { width: availableWidth, height: availableHeight }
    );
  }

  protected render(): void {
    // Rendering handled by scroll container and label
  }

  destroy(): void {
    this.scrollContainer.destroy();
    super.destroy();
  }
}
