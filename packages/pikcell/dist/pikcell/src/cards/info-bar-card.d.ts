/**
 * Info Bar Card - Displays contextual information
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
export interface InfoSection {
    label: string;
    value: string;
}
export interface InfoBarCardOptions {
    x: number;
    y: number;
    renderer: PIXI.Renderer;
    width?: number;
    sections?: InfoSection[];
}
export interface InfoBarCardResult {
    card: PixelCard;
    updateSections: (sections: InfoSection[]) => void;
}
/**
 * Creates an info bar for displaying contextual information in horizontal sections
 */
export declare function createInfoBarCard(options: InfoBarCardOptions): InfoBarCardResult;
