import { EditorProps } from '@monaco-editor/react';
import type { languages } from 'monaco-editor';
import { FileSpec } from './types';
export declare const requireIntercept: (userRequireMap?: {}) => (moduleName: any) => any;
export interface Code4UIProps {
    tsDefaultsPlugin?: (d: languages.typescript.LanguageServiceDefaults) => void;
    requireMap?: Record<string, any>;
    virtualFiles?: Record<string, FileSpec>;
    renderTarget?: HTMLIFrameElement;
    editorProps?: EditorProps;
}
export declare const Code4Editor: ({ virtualFiles, requireMap, renderTarget, tsDefaultsPlugin, editorProps, }: {
    virtualFiles?: {};
    requireMap?: {};
    renderTarget?: any;
    tsDefaultsPlugin?: (d: any) => any;
    editorProps?: {};
}) => import("react/jsx-runtime").JSX.Element;
