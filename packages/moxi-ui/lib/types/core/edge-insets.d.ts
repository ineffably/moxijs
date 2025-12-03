export declare class EdgeInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
    constructor(top: number, right: number, bottom: number, left: number);
    static all(value: number): EdgeInsets;
    static symmetric(vertical: number, horizontal: number): EdgeInsets;
    static only(edges: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    }): EdgeInsets;
    static zero(): EdgeInsets;
    get horizontal(): number;
    get vertical(): number;
    clone(): EdgeInsets;
}
