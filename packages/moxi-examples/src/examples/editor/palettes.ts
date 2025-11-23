/**
 * Color palette definitions for sprite editor
 */

/**
 * PICO-8 color palette (16 colors)
 * Standard palette used in PICO-8 fantasy console
 */
export const PICO8_PALETTE = [
  0x000000, // black
  0x1d2b53, // dark blue
  0x7e2553, // dark purple
  0x008751, // dark green
  0xab5236, // brown
  0x5f574f, // dark gray
  0xc2c3c7, // light gray
  0xfff1e8, // white
  0xff004d, // red
  0xffa300, // orange
  0xffec27, // yellow
  0x00e436, // green
  0x29adff, // blue
  0x83769c, // lavender
  0xff77a8, // pink
  0xffccaa  // peach
];

/**
 * TIC-80 color palette (16 colors)
 * Standard palette used in TIC-80 fantasy console
 */
export const TIC80_PALETTE = [
  0x000000, // black
  0x1d2b53, // dark blue
  0x7e2553, // dark purple
  0x008751, // dark green
  0xab5236, // brown
  0x5f574f, // dark gray
  0xc2c3c7, // light gray
  0xfff1e8, // white
  0xff004d, // red
  0xffa300, // orange
  0xffec27, // yellow
  0x00e436, // green
  0x29adff, // blue
  0x83769c, // lavender
  0xff77a8, // pink
  0xffccaa  // peach
];

/**
 * CC-29 color palette (29 colors)
 * From Lospec.com/palette-list
 */
export const CC29_PALETTE = [
  0xf2f0e5, // Light cream
  0xb8b5b9, // Light gray
  0x868188, // Medium gray
  0x646365, // Dark gray
  0x45444f, // Darker gray
  0x3a3858, // Dark blue-gray
  0x212123, // Very dark
  0x352b42, // Dark purple
  0x43436a, // Medium blue
  0x4b80ca, // Blue
  0x68c2d3, // Light blue
  0xa2dcc7, // Mint green
  0xede19e, // Light yellow
  0xd3a068, // Tan
  0xb45252, // Red
  0x6a536e, // Purple-gray
  0x4b4158, // Dark purple-gray
  0x80493a, // Brown
  0xa77b5b, // Light brown
  0xe5ceb4, // Beige
  0xc2d368, // Yellow-green
  0x8ab060, // Green
  0x567b79, // Teal
  0x4e584a, // Dark green
  0x7b7243, // Olive
  0xb2b47e, // Light olive
  0xedc8c4, // Light pink
  0xcf8acb, // Pink
  0x5f556a  // Dark purple-gray
];

export type PaletteType = 'pico8' | 'tic80' | 'cc29';

export function getPalette(type: PaletteType): number[] {
  switch (type) {
    case 'pico8':
      return PICO8_PALETTE;
    case 'tic80':
      return TIC80_PALETTE;
    case 'cc29':
      return CC29_PALETTE;
  }
}

