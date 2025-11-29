/**
 * Options for configuring the resize handler
 */
export interface ResizeHandlerOptions {
  /** Root element containing the canvas */
  rootElement: HTMLElement;
  /** The desired width of the game viewport */
  width: number;
  /** The desired height of the game viewport */
  height: number;
  /** Optional CSS properties to apply to the root element */
  rootStyles?: Record<string, string>;
  /** Optional CSS properties to apply to the canvas element */
  canvasStyles?: Record<string, string>;
  /** Whether to use pixel art optimized rendering */
  pixelArtMode?: boolean;
}

/**
 * Default styles applied to the root element
 */
const DEFAULT_ROOT_STYLES: Record<string, string> = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden'
};

/**
 * Default styles applied to the canvas element in pixel art mode
 */
const PIXEL_ART_CANVAS_STYLES: Record<string, string> = {
  imageRendering: 'pixelated'
};

/**
 * Creates a resize handler function that maintains the aspect ratio of a canvas
 * and centers it within its parent element.
 * 
 * @param options - Configuration options for the resize handler
 * @returns A function that can be called to handle resize events
 */
export function createResizeHandler(options: ResizeHandlerOptions): () => void {
  const {
    rootElement,
    width,
    height,
    rootStyles = DEFAULT_ROOT_STYLES,
    canvasStyles = {},
    pixelArtMode = false
  } = options;

  // Apply root element styles
  Object.entries(rootStyles).forEach(([key, value]) => {
    rootElement.style.setProperty(key, value);
  });

  // Combine default canvas styles with user-provided ones
  const finalCanvasStyles = pixelArtMode
    ? { ...PIXEL_ART_CANVAS_STYLES, ...canvasStyles }
    : canvasStyles;

  return () => {
    // Get the parent dimensions
    const parentWidth = rootElement.clientWidth;
    const parentHeight = rootElement.clientHeight;

    // Maintain aspect ratio
    const ratio = Math.min(
      parentWidth / width,
      parentHeight / height
    );

    // Update the canvas element if it exists
    if (rootElement.firstElementChild instanceof HTMLCanvasElement) {
      const canvas = rootElement.firstElementChild;
      
      // Set dimensions while maintaining aspect ratio
      canvas.style.width = `${Math.round(width * ratio)}px`;
      canvas.style.height = `${Math.round(height * ratio)}px`;
      canvas.style.display = 'block';
      
      // Apply custom canvas styles
      Object.entries(finalCanvasStyles).forEach(([key, value]) => {
        canvas.style.setProperty(key, value);
      });
    }
  };
}

/**
 * Sets up responsive resizing for a PIXI canvas application
 * 
 * @param options - Configuration options for the resize handler
 * @returns A cleanup function to remove the event listener
 */
export function setupResponsiveCanvas(options: ResizeHandlerOptions): () => void {
  const resizeHandler = createResizeHandler(options);
  
  // Initial resize
  resizeHandler();
  
  // Add event listener
  window.addEventListener('resize', resizeHandler);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', resizeHandler);
  };
} 