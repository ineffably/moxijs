import { Point } from 'pixi.js';
import { ClientEventsArgs } from '.';
export declare class ClientEvents {
    wheelDelta: {
        yValue: number;
        xValue: number;
    };
    mouseUpEvent: MouseEvent;
    mouseDownEvent: MouseEvent;
    lastMouseDown: MouseEvent;
    lastMouseUp: MouseEvent;
    keyDownEvent: KeyboardEvent;
    keyUpEvent: KeyboardEvent;
    keydown: Record<string, KeyboardEvent>;
    wheelOffets: Point;
    movePosition: Point;
    lastMovePosition: Point;
    moveDelta: Point;
    static instance: ClientEvents;
    constructor({ initWheelOffset, onAnyEvent }?: ClientEventsArgs);
    isKeyDown(key: string): boolean;
    isKeyUp(key: string): boolean;
}
