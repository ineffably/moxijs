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
 * Creates a resize handler function that maintains the aspect ratio of a canvas
 * and centers it within its parent element.
 *
 * @param options - Configuration options for the resize handler
 * @returns A function that can be called to handle resize events
 */
export declare function createResizeHandler(options: ResizeHandlerOptions): () => void;
/**
 * Sets up responsive resizing for a PIXI canvas application
 *
 * @param options - Configuration options for the resize handler
 * @returns A cleanup function to remove the event listener
 */
export declare function setupResponsiveCanvas(options: ResizeHandlerOptions): () => void;
