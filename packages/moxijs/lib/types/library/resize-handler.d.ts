export interface ResizeHandlerOptions {
    rootElement: HTMLElement;
    width: number;
    height: number;
    rootStyles?: Record<string, string>;
    canvasStyles?: Record<string, string>;
    pixelArtMode?: boolean;
}
export declare function createResizeHandler(options: ResizeHandlerOptions): () => void;
export declare function setupResponsiveCanvas(options: ResizeHandlerOptions): () => void;
