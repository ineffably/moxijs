import PIXI from 'pixi.js';
import { BoxModel, ComputedLayout, MeasuredSize, createDefaultBoxModel } from './box-model';

/**
 * Base abstract class for all UI components
 * Provides box model, layout, and rendering functionality
 *
 * @category UI
 */
export abstract class UIComponent {
  /**
   * The PIXI container that holds this component's visual representation
   */
  public container: PIXI.Container;

  /**
   * The box model defining this component's sizing and spacing
   */
  protected boxModel: BoxModel;

  /**
   * The computed layout after measurement and positioning
   */
  protected computedLayout: ComputedLayout;

  /**
   * Reference to parent component (if any)
   */
  public parent?: UIComponent;

  /**
   * Whether this component is currently visible
   */
  public visible: boolean = true;

  /**
   * Whether this component is enabled for interaction
   */
  public enabled: boolean = true;

  /**
   * Flag indicating if layout needs to be recalculated
   */
  protected layoutDirty: boolean = true;

  constructor(boxModel?: Partial<BoxModel>) {
    this.container = new PIXI.Container();
    this.boxModel = createDefaultBoxModel(boxModel);
    this.computedLayout = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      contentX: 0,
      contentY: 0,
      contentWidth: 0,
      contentHeight: 0
    };
  }

  /**
   * Measures the size this component needs
   * Must be implemented by subclasses
   *
   * @returns The measured width and height
   */
  abstract measure(): MeasuredSize;

  /**
   * Performs layout for this component within the given available space
   * Must be implemented by subclasses
   *
   * @param availableWidth - Available width in pixels
   * @param availableHeight - Available height in pixels
   */
  abstract layout(availableWidth: number, availableHeight: number): void;

  /**
   * Renders the component's visuals
   * Called after layout is complete
   */
  protected abstract render(): void;

  /**
   * Marks this component's layout as dirty, requiring recalculation
   */
  public markLayoutDirty(): void {
    this.layoutDirty = true;
    if (this.parent) {
      this.parent.markLayoutDirty();
    }
  }

  /**
   * Gets the computed layout of this component
   */
  public getLayout(): ComputedLayout {
    return this.computedLayout;
  }

  /**
   * Gets the box model of this component
   */
  public getBoxModel(): BoxModel {
    return this.boxModel;
  }

  /**
   * Sets the position of this component
   */
  public setPosition(x: number, y: number): void {
    this.computedLayout.x = x;
    this.computedLayout.y = y;
    this.container.position.set(x, y);
  }

  /**
   * Shows this component
   */
  public show(): void {
    this.visible = true;
    this.container.visible = true;
  }

  /**
   * Hides this component
   */
  public hide(): void {
    this.visible = false;
    this.container.visible = false;
  }

  /**
   * Destroys this component and cleans up resources
   */
  public destroy(): void {
    this.container.destroy({ children: true });
  }
}
