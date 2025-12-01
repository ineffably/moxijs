import {
  PICO8_PALETTE,
  TIC80_PALETTE,
  CC29_PALETTE,
  AERUGO_PALETTE,
  getPalette,
  getPaletteInfo,
  getAllPaletteTypes,
  getColorNames,
} from '../../src/theming/palettes';

describe('Palettes', () => {
  describe('PICO-8 palette', () => {
    it('should have 16 colors', () => {
      expect(PICO8_PALETTE).toHaveLength(16);
    });

    it('should have black as first color', () => {
      expect(PICO8_PALETTE[0]).toBe(0x000000);
    });

    it('should have all valid hex values', () => {
      PICO8_PALETTE.forEach((color) => {
        expect(typeof color).toBe('number');
        expect(color).toBeGreaterThanOrEqual(0);
        expect(color).toBeLessThanOrEqual(0xffffff);
      });
    });
  });

  describe('TIC-80 palette', () => {
    it('should have 16 colors', () => {
      expect(TIC80_PALETTE).toHaveLength(16);
    });

    it('should have all valid hex values', () => {
      TIC80_PALETTE.forEach((color) => {
        expect(typeof color).toBe('number');
        expect(color).toBeGreaterThanOrEqual(0);
        expect(color).toBeLessThanOrEqual(0xffffff);
      });
    });
  });

  describe('CC-29 palette', () => {
    it('should have 29 colors', () => {
      expect(CC29_PALETTE).toHaveLength(29);
    });
  });

  describe('Aerugo palette', () => {
    it('should have 32 colors', () => {
      expect(AERUGO_PALETTE).toHaveLength(32);
    });
  });

  describe('getPalette', () => {
    it('should return PICO-8 palette', () => {
      expect(getPalette('pico8')).toBe(PICO8_PALETTE);
    });

    it('should return TIC-80 palette', () => {
      expect(getPalette('tic80')).toBe(TIC80_PALETTE);
    });

    it('should return CC-29 palette', () => {
      expect(getPalette('cc29')).toBe(CC29_PALETTE);
    });

    it('should return Aerugo palette', () => {
      expect(getPalette('aerugo')).toBe(AERUGO_PALETTE);
    });
  });

  describe('getPaletteInfo', () => {
    it('should return PICO-8 info', () => {
      const info = getPaletteInfo('pico8');
      expect(info.name).toBe('PICO-8');
      expect(info.colorCount).toBe(16);
      expect(info.description).toBeDefined();
    });

    it('should return TIC-80 info', () => {
      const info = getPaletteInfo('tic80');
      expect(info.name).toBe('TIC-80');
      expect(info.colorCount).toBe(16);
    });
  });

  describe('getAllPaletteTypes', () => {
    it('should return all palette types', () => {
      const types = getAllPaletteTypes();
      expect(types).toContain('pico8');
      expect(types).toContain('tic80');
      expect(types).toContain('cc29');
      expect(types).toContain('aerugo');
    });
  });

  describe('getColorNames', () => {
    it('should return color names for PICO-8', () => {
      const names = getColorNames('pico8');
      expect(names).toHaveLength(16);
      expect(names[0]).toBe('black');
    });
  });
});
