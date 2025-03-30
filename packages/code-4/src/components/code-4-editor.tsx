/* eslint-disable @typescript-eslint/no-require-imports */
import { useEffect, useState } from 'react';
import Editor, { EditorProps } from '@monaco-editor/react';
import { transpileTypescript } from '../library/transpile-typescript';
import type { languages } from 'monaco-editor';
import { FileSpec } from '../types';
import { getHostHtml } from '../library/host-html';
import { CompilerOptions } from 'typescript';
import { requireIntercept } from '../library/require-intercept';

export interface Code4UIProps {
  extraLibsPlugin?: (d: languages.typescript.LanguageServiceDefaults) => void;
  requireMap?: Record<string, any>;
  file?: FileSpec | null;
  renderTarget?: HTMLIFrameElement;
  consoleTarget?: HTMLTextAreaElement;
  editorProps?: EditorProps;
  onCodeChange?: (file: FileSpec, code: string) => void;
  onMount?: (editor: any, monaco: any, compilerOptions: languages.typescript.CompilerOptions) => void;
}

export const Code4Editor = ({
  file = null,
  requireMap = {},
  renderTarget = null,
  extraLibsPlugin = (d) => null,
  editorProps = {},
  consoleTarget = null,
  onCodeChange = null,
  onMount = (editor, monaco) => {}
}: Code4UIProps) => {
  if (!renderTarget) {
    return <div>please provide a render target</div>;
  }
  const [codeText, setCodeText] = useState(file?.value || '');
  const [iframeRef] = useState<HTMLIFrameElement>(renderTarget);
  const [lastError, setLastError] = useState(null as any);
  const [renderId, setRenderId] = useState(1);
  const [editorCompilerOptions, setCompilerOptions] = useState<CompilerOptions>(null);

  const requireMapping = requireIntercept(requireMap);

  const runIframeCode = () => {
    if (iframeRef) {
      const { run } = (iframeRef?.contentWindow?.window as any) || {};
      if (run) {
        run({ require: requireMapping, renderId, exports: {} });
      }
    }
  };

  useEffect(() => {
    if (iframeRef) {
      iframeRef.addEventListener('load', () => {
        runIframeCode();
      });
    }

    window.addEventListener('error', (ev) => {
      const { error } = ev;
      setLastError(ev);
      console.log('error', error);
    }, true);
  }, []);

  useEffect(() => {
    if(!file) return;
    setCodeText(file.value);
  }, [file?.value]);

  useEffect(() => {
    if(!editorCompilerOptions) return;
    const { iframeCode } = transpileTypescript(codeText, editorCompilerOptions);
    const srcDoc = getHostHtml({ code: iframeCode });
    iframeRef.srcdoc = srcDoc;
    if (onCodeChange) {
      onCodeChange(file, codeText);
    }
    setRenderId(renderId + 1);
  }, [codeText, editorCompilerOptions]);

  return (
    <Editor
      width="100%"
      theme="vs-dark"
      language="typescript"
      value={codeText}
      onChange={(value) => {
        setCodeText(value);
      }}
      options={{ automaticLayout: true }}
      onMount={(editor, monaco) => {
        const { typescript } = monaco.languages;
        const defaults = typescript.typescriptDefaults;
        typescript.javascriptDefaults.setEagerModelSync(true)
        extraLibsPlugin(defaults);
        const compilerOptions = defaults.getCompilerOptions();
        compilerOptions.module = typescript.ModuleKind.CommonJS;
        compilerOptions.target = typescript.ScriptTarget.ESNext;
        compilerOptions.strict = false;
        compilerOptions.noImplicitUseStrict = true;
        compilerOptions.moduleResolution = typescript.ModuleResolutionKind.Classic;
        compilerOptions.resolveJsonModule = true;
        compilerOptions.allowSyntheticDefaultImports = true;
        compilerOptions.esModuleInterop = true;
        onMount(editor, monaco, compilerOptions);
        setCompilerOptions(compilerOptions);
        defaults.setCompilerOptions(compilerOptions);
        console.log('editor mounted');
      }}
      {...editorProps} // users overrides
    />
  );
};
