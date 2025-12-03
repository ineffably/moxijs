export interface FormStateConfig<T> {
    value?: T;
    defaultValue?: T;
    onChange?: (value: T) => void;
}
export declare class FormStateManager<T> {
    private value;
    private isControlled;
    private onChange?;
    constructor(config: FormStateConfig<T>);
    getValue(): T;
    setValue(value: T): void;
    updateValue(value: T): void;
    isControlledMode(): boolean;
    setOnChange(callback: (value: T) => void): void;
}
