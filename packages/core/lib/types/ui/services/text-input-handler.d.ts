export interface TextInputHandlerConfig {
    value: string;
    maxLength?: number;
    type?: 'text' | 'number';
    multiline?: boolean;
    onChange?: (value: string) => void;
}
export declare class TextInputHandler {
    private value;
    private cursorPosition;
    private maxLength;
    private type;
    private multiline;
    private onChange?;
    constructor(config: TextInputHandlerConfig);
    getValue(): string;
    setValue(value: string): void;
    getCursorPosition(): number;
    setCursorPosition(position: number): void;
    handleKeyDown(event: KeyboardEvent): boolean;
    private insertCharacter;
    private handleBackspace;
    private handleDelete;
    private moveCursor;
    private moveCursorVertically;
    private moveToLineStart;
    private moveToLineEnd;
    setOnChange(callback: (value: string) => void): void;
}
