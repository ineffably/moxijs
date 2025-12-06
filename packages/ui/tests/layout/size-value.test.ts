import {
  parseSizeValue,
  resolveParsedSize,
  isPercentage,
  isFixed,
  isAuto,
  formatSizeValue,
  SizeValue,
  ParsedSize,
} from '../../src/layout/size-value';

describe('size-value', () => {
  describe('parseSizeValue', () => {
    it('should parse undefined as auto', () => {
      const result = parseSizeValue(undefined);

      expect(result.type).toBe('auto');
      expect(result.value).toBe(0);
    });

    it('should parse "auto" as auto', () => {
      const result = parseSizeValue('auto');

      expect(result.type).toBe('auto');
      expect(result.value).toBe(0);
    });

    it('should parse "fill" as 100% percent', () => {
      const result = parseSizeValue('fill');

      expect(result.type).toBe('percent');
      expect(result.value).toBe(100);
    });

    it('should parse number as fixed', () => {
      const result = parseSizeValue(200);

      expect(result.type).toBe('fixed');
      expect(result.value).toBe(200);
    });

    it('should parse percentage string', () => {
      const result = parseSizeValue('50%');

      expect(result.type).toBe('percent');
      expect(result.value).toBe(50);
    });

    it('should parse decimal percentage', () => {
      const result = parseSizeValue('33.33%' as SizeValue);

      expect(result.type).toBe('percent');
      expect(result.value).toBeCloseTo(33.33);
    });

    it('should throw on invalid value', () => {
      expect(() => parseSizeValue('invalid' as SizeValue)).toThrow(
        'Invalid size value'
      );
    });
  });

  describe('resolveParsedSize', () => {
    it('should return fixed value unchanged', () => {
      const parsed: ParsedSize = { type: 'fixed', value: 150 };

      const result = resolveParsedSize(parsed, 800);

      expect(result).toBe(150);
    });

    it('should return auto as "auto"', () => {
      const parsed: ParsedSize = { type: 'auto', value: 0 };

      const result = resolveParsedSize(parsed, 800);

      expect(result).toBe('auto');
    });

    it('should calculate percent of parent', () => {
      const parsed: ParsedSize = { type: 'percent', value: 50 };

      const result = resolveParsedSize(parsed, 800);

      expect(result).toBe(400);
    });

    it('should calculate 100% as full parent size', () => {
      const parsed: ParsedSize = { type: 'percent', value: 100 };

      const result = resolveParsedSize(parsed, 600);

      expect(result).toBe(600);
    });

    it('should handle fractional percentages', () => {
      const parsed: ParsedSize = { type: 'percent', value: 33.33 };

      const result = resolveParsedSize(parsed, 300);

      expect(result).toBeCloseTo(99.99);
    });
  });

  describe('isPercentage', () => {
    it('should return true for "fill"', () => {
      expect(isPercentage('fill')).toBe(true);
    });

    it('should return true for percentage string', () => {
      expect(isPercentage('50%')).toBe(true);
    });

    it('should return false for number', () => {
      expect(isPercentage(100)).toBe(false);
    });

    it('should return false for "auto"', () => {
      expect(isPercentage('auto')).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isPercentage(undefined)).toBe(false);
    });
  });

  describe('isFixed', () => {
    it('should return true for number', () => {
      expect(isFixed(100)).toBe(true);
    });

    it('should return false for "auto"', () => {
      expect(isFixed('auto')).toBe(false);
    });

    it('should return false for "fill"', () => {
      expect(isFixed('fill')).toBe(false);
    });

    it('should return false for percentage', () => {
      expect(isFixed('50%')).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isFixed(undefined)).toBe(false);
    });
  });

  describe('isAuto', () => {
    it('should return true for undefined', () => {
      expect(isAuto(undefined)).toBe(true);
    });

    it('should return true for "auto"', () => {
      expect(isAuto('auto')).toBe(true);
    });

    it('should return false for number', () => {
      expect(isAuto(100)).toBe(false);
    });

    it('should return false for "fill"', () => {
      expect(isAuto('fill')).toBe(false);
    });

    it('should return false for percentage', () => {
      expect(isAuto('50%')).toBe(false);
    });
  });

  describe('formatSizeValue', () => {
    it('should format undefined as "auto"', () => {
      expect(formatSizeValue(undefined)).toBe('auto');
    });

    it('should format "auto" as "auto"', () => {
      expect(formatSizeValue('auto')).toBe('auto');
    });

    it('should format "fill" as "fill"', () => {
      expect(formatSizeValue('fill')).toBe('fill');
    });

    it('should format number with "px" suffix', () => {
      expect(formatSizeValue(100)).toBe('100px');
    });

    it('should return percentage string as-is', () => {
      expect(formatSizeValue('50%')).toBe('50%');
    });
  });
});
