import { FormStateManager } from '../../src/services/form-state-manager';

describe('FormStateManager', () => {
  describe('constructor', () => {
    it('should initialize with default value in uncontrolled mode', () => {
      const manager = new FormStateManager({ defaultValue: 'default' });

      expect(manager.getValue()).toBe('default');
      expect(manager.isControlledMode()).toBe(false);
    });

    it('should initialize with value in controlled mode', () => {
      const manager = new FormStateManager({ value: 'controlled' });

      expect(manager.getValue()).toBe('controlled');
      expect(manager.isControlledMode()).toBe(true);
    });

    it('should prefer value over defaultValue', () => {
      const manager = new FormStateManager({
        value: 'controlled',
        defaultValue: 'default'
      });

      expect(manager.getValue()).toBe('controlled');
      expect(manager.isControlledMode()).toBe(true);
    });

    it('should default to empty string if no value provided', () => {
      const manager = new FormStateManager<string>({});

      expect(manager.getValue()).toBe('');
    });
  });

  describe('uncontrolled mode', () => {
    it('should update internal state on setValue', () => {
      const manager = new FormStateManager({ defaultValue: 'initial' });

      manager.setValue('updated');

      expect(manager.getValue()).toBe('updated');
    });

    it('should call onChange when value changes', () => {
      const onChange = jest.fn();
      const manager = new FormStateManager({
        defaultValue: 'initial',
        onChange
      });

      manager.setValue('updated');

      expect(onChange).toHaveBeenCalledWith('updated');
    });

    it('should not call onChange when value is the same', () => {
      const onChange = jest.fn();
      const manager = new FormStateManager({
        defaultValue: 'initial',
        onChange
      });

      manager.setValue('initial');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('controlled mode', () => {
    it('should not update internal state on setValue', () => {
      const manager = new FormStateManager({ value: 'initial' });

      manager.setValue('updated');

      expect(manager.getValue()).toBe('initial');
    });

    it('should call onChange on setValue', () => {
      const onChange = jest.fn();
      const manager = new FormStateManager({
        value: 'initial',
        onChange
      });

      manager.setValue('updated');

      expect(onChange).toHaveBeenCalledWith('updated');
    });

    it('should update internal state on updateValue', () => {
      const manager = new FormStateManager({ value: 'initial' });

      manager.updateValue('updated');

      expect(manager.getValue()).toBe('updated');
    });

    it('should not update if value is the same on updateValue', () => {
      const manager = new FormStateManager({ value: 'initial' });
      const originalValue = manager.getValue();

      manager.updateValue('initial');

      expect(manager.getValue()).toBe(originalValue);
    });
  });

  describe('setOnChange', () => {
    it('should update the onChange callback', () => {
      const manager = new FormStateManager({ defaultValue: 'initial' });
      const newCallback = jest.fn();

      manager.setOnChange(newCallback);
      manager.setValue('updated');

      expect(newCallback).toHaveBeenCalledWith('updated');
    });
  });

  describe('error handling', () => {
    it('should catch errors in onChange callback', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      const manager = new FormStateManager({
        defaultValue: 'initial',
        onChange: () => { throw new Error('Test error'); }
      });

      expect(() => manager.setValue('updated')).not.toThrow();
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('with different types', () => {
    it('should work with numbers', () => {
      const manager = new FormStateManager({ defaultValue: 0 });

      manager.setValue(42);

      expect(manager.getValue()).toBe(42);
    });

    it('should work with booleans', () => {
      const manager = new FormStateManager({ defaultValue: false });

      manager.setValue(true);

      expect(manager.getValue()).toBe(true);
    });

    it('should work with objects', () => {
      const manager = new FormStateManager({ defaultValue: { a: 1 } });

      manager.setValue({ a: 2 });

      expect(manager.getValue()).toEqual({ a: 2 });
    });
  });
});
