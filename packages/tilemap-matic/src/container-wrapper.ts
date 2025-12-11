/**
 * Container Wrapper
 * Wraps a raw PIXI Container as a UIComponent for use in UITabs and other UI components
 */
import { Container } from 'pixi.js';
import { UIComponent, MeasuredSize, BoxModel } from '@moxijs/ui';

export interface ContainerWrapperProps {
  /** The PIXI container to wrap */
  content: Container;
  /** Fixed width */
  width?: number;
  /** Fixed height */
  height?: number;
  /** Background color (optional) */
  backgroundColor?: number;
}

/**
 * Wraps a PIXI Container as a UIComponent
 * Useful for embedding raw PIXI content in UI layouts like tabs
 */
export class ContainerWrapper extends UIComponent {
  private content: Container;
  private width: number;
  private height: number;

  constructor(props: ContainerWrapperProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    this.content = props.content;
    this.width = props.width ?? 100;
    this.height = props.height ?? 100;

    this.container.addChild(this.content);
  }

  /**
   * Update the wrapped content
   */
  setContent(content: Container): void {
    if (this.content && this.content.parent === this.container) {
      this.container.removeChild(this.content);
    }
    this.content = content;
    this.container.addChild(this.content);
  }

  /**
   * Get the wrapped content
   */
  getContent(): Container {
    return this.content;
  }

  measure(): MeasuredSize {
    return this.layoutEngine.measure(this.boxModel, {
      width: this.width,
      height: this.height
    });
  }

  layout(availableWidth: number, availableHeight: number): void {
    this.width = availableWidth;
    this.height = availableHeight;

    const measured = this.measure();
    this.computedLayout = this.layoutEngine.layout(
      this.boxModel,
      measured,
      { width: availableWidth, height: availableHeight }
    );
  }

  protected render(): void {
    // Content renders itself
  }
}
