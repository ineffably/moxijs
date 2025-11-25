/**
 * Color palette definitions for sprite editor
 */
/**
 * PICO-8 color palette (16 colors)
 * Standard palette used in PICO-8 fantasy console
 */
export declare const PICO8_PALETTE: number[];
/**
 * TIC-80 color palette (16 colors)
 * Standard palette used in TIC-80 fantasy console
 */
export declare const TIC80_PALETTE: number[];
/**
 * CC-29 color palette (29 colors)
 * From Lospec.com/palette-list
 */
export declare const CC29_PALETTE: number[];
/**
 * Aerugo color palette (32 colors)
 * The editor's UI palette
 * From https://lospec.com/palette-list/aerugo
 */
export declare const AERUGO_PALETTE: number[];
export type PaletteType = 'pico8' | 'tic80' | 'cc29' | 'aerugo';
export declare function getPalette(type: PaletteType): number[];
