export declare function debounce<T extends unknown[], U>(callback: (...args: T) => PromiseLike<U> | U, wait: number): (...args: T) => Promise<U>;
export declare const getHashCode: (str?: string) => number;
export declare function trueDebounce(func: () => void, waitMs?: number): void;
export declare namespace trueDebounce {
    var funcDictionary: {};
}
