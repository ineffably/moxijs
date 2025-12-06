import { UIScaleMode } from '../src/UIScaleMode';

describe('UIScaleMode', () => {
  it('should have None mode', () => {
    expect(UIScaleMode.None).toBe('none');
  });

  it('should have ScaleUI mode', () => {
    expect(UIScaleMode.ScaleUI).toBe('scaleUI');
  });

  it('should have LockRatio mode', () => {
    expect(UIScaleMode.LockRatio).toBe('lockRatio');
  });

  it('should have exactly 3 modes', () => {
    const modes = Object.values(UIScaleMode);
    expect(modes).toHaveLength(3);
    expect(modes).toContain('none');
    expect(modes).toContain('scaleUI');
    expect(modes).toContain('lockRatio');
  });
});
