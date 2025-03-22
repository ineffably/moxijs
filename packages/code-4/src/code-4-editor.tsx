/* eslint-disable @typescript-eslint/no-require-imports */
import { useEffect, useState } from 'react';
import Editor, { EditorProps } from '@monaco-editor/react';
import { transpileTypescript } from './transpile-typescript';
import type { languages } from 'monaco-editor';
import { FileSpec } from './types';
import { getHostHtml } from './host-html';

export const requireIntercept = (userRequireMap = {}) => (moduleName) => {
  if (moduleName.endsWith('.css')) {
    return '';
  }

  const reference = (({ ...userRequireMap })[moduleName]);
  if (!reference) {
    console.error(`module for ${moduleName} was not found`);
    return null;
  }

  return reference;
};

export interface Code4UIProps {
  tsDefaultsPlugin?: (d: languages.typescript.LanguageServiceDefaults) => void;
  requireMap?: Record<string, any>;
  virtualFiles?: Record<string, FileSpec>;
  renderTarget?: HTMLIFrameElement;
  editorProps?: EditorProps;
  onSourceChange?: (srcDoc: string) => void;
}

export const Code4Editor = ({
  virtualFiles = {},
  requireMap = {},
  renderTarget = null,
  tsDefaultsPlugin = (d) => null,
  editorProps = {},
  consoleTarget = null,
  onSourceChange = null,
}) => {
  if (!renderTarget) {
    return <div>please provide a render target</div>;
  }
  const [codeText, setCodeText] = useState('document.body.style.backgroundColor = "orange";');
  const [iframeRef] = useState<HTMLIFrameElement>(renderTarget);
  const [lastError, setLastError] = useState(null as any);
  const [renderId, setRenderId] = useState(1);

  const requireMapping = requireIntercept(requireMap);

  const runIframeCode = () => {
    if (iframeRef) {
      const { run } = (iframeRef?.contentWindow?.window as any) || {};
      if (run) {
        const result = run({
          require: requireMapping, renderId, exports: {}
        });
        // console.log('==RESULT==', result);
      }
    }
  };

  useEffect(() => {
    if(iframeRef) {
      iframeRef.addEventListener('load', () => {
        runIframeCode();
      });
    }

    window.addEventListener('error', (ev) => {
      const { error } = ev;
      setLastError(ev);
      console.log(error.message);
      console.log(error.stack);
    }, true);
  }, []);

  useEffect(() => {
    const { iframeCode } = transpileTypescript(codeText);
    const srcDoc = getHostHtml({ code: iframeCode });
    iframeRef.srcdoc = srcDoc;

    if (onSourceChange) {
      onSourceChange(srcDoc);
    }

    setRenderId(renderId + 1);
    // console.log('codeText', codeText);
  }, [codeText]);

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
        const compilerOptions = defaults.getCompilerOptions();
        compilerOptions.module = typescript.ModuleKind.ESNext;
        compilerOptions.moduleResolution = typescript.ModuleResolutionKind.Classic;
        compilerOptions.resolveJsonModule = true;
        compilerOptions.allowSyntheticDefaultImports = true;
        compilerOptions.esModuleInterop = true;
        defaults.setCompilerOptions(compilerOptions);
        tsDefaultsPlugin(defaults);
      }}
      {...editorProps} // users overrides
    />
  );
};
