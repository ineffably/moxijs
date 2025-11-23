/**
 * Draggable toolbar component for sprite editor
 */
import PIXI from 'pixi.js';
import { UIComponent, MeasuredSize, asBitmapText } from 'moxi';
import { UIPanel } from 'moxi';
import { EdgeInsets } from 'moxi';

export interface DraggableToolbarProps {
  title?: string;
  width?: number;
  height?: number;
  backgroundColor?: number;
  x?: number;
  y?: number;
  renderer?: PIXI.Renderer;
}

/**
 * A draggable toolbar that can be moved around the workspace
 */
export class DraggableToolbar extends UIComponent {
  private panel: UIPanel;
  private titleLabel?: PIXI.BitmapText;
  private titleBar: PIXI.Graphics;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private contentContainer: PIXI.Container;
  private renderer?: PIXI.Renderer;

  constructor(props: DraggableToolbarProps = {}) {
    super();
    
    this.renderer = props.renderer;

    const width = props.width ?? 200;
    const height = props.height ?? 300;
    const backgroundColor = props.backgroundColor ?? 0xe5ceb4; // CC-29 beige

    // Create panel
    this.panel = new UIPanel({
      backgroundColor,
      width,
      height,
      borderRadius: 4
    });

    this.container.addChild(this.panel.container);

    // Create title bar for dragging
    this.titleBar = new PIXI.Graphics();
    this.titleBar.roundPixels = true; // Pixel perfect rendering
    this.titleBar.rect(0, 0, width, 24);
    this.titleBar.fill({ color: 0xb8b5b9 }); // CC-29 light gray
    this.titleBar.stroke({ color: 0x646365, width: 1 }); // CC-29 medium gray
    this.titleBar.eventMode = 'static';
    this.titleBar.cursor = 'move';
    this.container.addChild(this.titleBar);

    // Create title label if provided (using bitmap text)
    if (props.title) {
      this.titleLabel = asBitmapText(
        {
          text: props.title,
          style: {
            fontFamily: 'PixelOperator',
            fontSize: 18,
            fill: 0x212123 // CC-29 very dark
          }
        },
        { x: 8, y: 6 }
      );
      this.container.addChild(this.titleLabel);
    }

    // Create content container
    this.contentContainer = new PIXI.Container();
    this.contentContainer.position.set(0, 24);
    this.container.addChild(this.contentContainer);

    // Set initial position
    if (props.x !== undefined) this.container.x = props.x;
    if (props.y !== undefined) this.container.y = props.y;

    // Make container interactive
    this.container.eventMode = 'static';

    // Setup dragging
    this.setupDragging();
  }

  /**
   * Sets up drag and drop functionality
   */
  private setupDragging(): void {
    let dragStartScreenX = 0;
    let dragStartScreenY = 0;
    let containerStartX = 0;
    let containerStartY = 0;
    let canvas: HTMLCanvasElement | null = null;

    this.titleBar.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
      this.isDragging = true;
      
      // Store initial container position
      containerStartX = this.container.x;
      containerStartY = this.container.y;
      
      // Get canvas element for coordinate conversion
      if (!canvas && this.renderer) {
        canvas = this.renderer.canvas as HTMLCanvasElement;
      }
      
      if (!canvas) {
        // Try to find canvas from parent containers
        let parent: PIXI.Container | null = this.container.parent;
        while (parent && !canvas) {
          if ((parent as any).renderer?.canvas) {
            canvas = (parent as any).renderer.canvas;
            break;
          }
          parent = parent.parent;
        }
      }
      
      // Store initial screen position
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        dragStartScreenX = e.clientX;
        dragStartScreenY = e.clientY;
      } else {
        // Fallback: use PIXI global coordinates
        dragStartScreenX = e.globalX;
        dragStartScreenY = e.globalY;
      }
      
      e.stopPropagation();
    });

    // Use window events for dragging (more reliable than PIXI global events)
    const handleGlobalMove = (e: PointerEvent) => {
      if (this.isDragging && canvas) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        // Calculate delta in screen coordinates
        const deltaScreenX = e.clientX - dragStartScreenX;
        const deltaScreenY = e.clientY - dragStartScreenY;
        
        // Convert delta to PIXI coordinates
        const deltaPixiX = deltaScreenX * scaleX;
        const deltaPixiY = deltaScreenY * scaleY;
        
        // Update container position
        this.container.x = containerStartX + deltaPixiX;
        this.container.y = containerStartY + deltaPixiY;
      } else if (this.isDragging) {
        // Fallback: use screen coordinates directly
        const deltaX = e.clientX - dragStartScreenX;
        const deltaY = e.clientY - dragStartScreenY;
        this.container.x = containerStartX + deltaX;
        this.container.y = containerStartY + deltaY;
      }
    };

    const handleGlobalUp = () => {
      this.isDragging = false;
    };

    // Add window event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', handleGlobalMove);
      window.addEventListener('pointerup', handleGlobalUp);

      // Cleanup on destroy
      this.container.on('destroyed', () => {
        window.removeEventListener('pointermove', handleGlobalMove);
        window.removeEventListener('pointerup', handleGlobalUp);
      });
    }
  }

  /**
   * Gets the content container where child elements should be added
   */
  getContentContainer(): PIXI.Container {
    return this.contentContainer;
  }

  measure(): MeasuredSize {
    const panelBoxModel = this.panel.getBoxModel();
    const panelWidth = typeof panelBoxModel.width === 'number' ? panelBoxModel.width : 200;
    const panelHeight = typeof panelBoxModel.height === 'number' ? panelBoxModel.height : 300;
    
    return {
      width: panelWidth,
      height: panelHeight + 24
    };
  }

  layout(availableWidth: number, availableHeight: number): void {
    const measured = this.measure();
    this.computedLayout.width = measured.width;
    this.computedLayout.height = measured.height;
    this.layoutDirty = false;
  }

  protected render(): void {
    // Rendering is handled by child components
  }
}

