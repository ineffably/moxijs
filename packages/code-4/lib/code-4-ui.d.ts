import type { languages } from 'monaco-editor';
export declare const requireIntercept: (userRequireMap: {}, iframeRef: HTMLIFrameElement) => (moduleName: any) => any;
export interface Code4UIProps {
    tsDefaultsPlugin?: (d: languages.typescript.LanguageServiceDefaults) => void;
    requireMap?: Record<string, any>;
}
export declare const Code4UI: ({ requireMap, tsDefaultsPlugin }: {
    requireMap?: {};
    tsDefaultsPlugin?: (d: any) => any;
}) => import("react/jsx-runtime").JSX.Element;
