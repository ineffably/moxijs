/**
 * Tool Card - Drawing tool selector
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
import { ToolType } from '../theming/tool-icons';
export interface ToolCardOptions {
    x: number;
    y: number;
    renderer: PIXI.Renderer;
    tools?: ToolType[];
    selectedToolIndex?: number;
    onToolSelect?: (toolIndex: number, tool: ToolType) => void;
}
export interface ToolCardResult {
    card: PixelCard;
    getSelectedToolIndex: () => number;
    getSelectedTool: () => ToolType;
    setSelectedToolIndex: (index: number) => void;
}
/**
 * Creates a tool selection card
 */
export declare function createToolCard(options: ToolCardOptions): ToolCardResult;
