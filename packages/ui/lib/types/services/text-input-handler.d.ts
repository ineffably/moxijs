export interface TextInputHandlerConfig {
    stateManager: {
        getValue: () => string;
        setValue: (value: string) => void;
    };
    maxLength?: number;
    type?: 'text' | 'number';
    multiline?: boolean;
}
export declare class TextInputHandler {
    private stateManager;
    private cursorPosition;
    private maxLength;
    private type;
    private multiline;
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
}
