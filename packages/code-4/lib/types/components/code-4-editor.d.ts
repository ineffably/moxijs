import { EditorProps } from '@monaco-editor/react';
import type { languages } from 'monaco-editor';
import { FileSpec } from '../types';
export interface Code4UIProps {
    extraLibsPlugin?: (d: languages.typescript.LanguageServiceDefaults) => void;
    requireMap?: Record<string, any>;
    file?: FileSpec | null;
    renderTarget?: HTMLIFrameElement;
    consoleTarget?: HTMLTextAreaElement;
    editorProps?: EditorProps;
    onCodeChange?: (file: FileSpec, code: string) => void;
}
export declare const Code4Editor: ({ file, requireMap, renderTarget, extraLibsPlugin, editorProps, consoleTarget, onCodeChange, }: Code4UIProps) => import("react/jsx-runtime").JSX.Element;
