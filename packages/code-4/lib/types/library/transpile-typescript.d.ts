import { type CompilerOptions } from 'typescript';
export declare const transpileTypescript: (code: string, tsConfig?: CompilerOptions) => {
    error: any;
    iframeCode: string;
    sourceCode: string;
};
