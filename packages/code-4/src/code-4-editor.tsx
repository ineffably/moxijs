/* eslint-disable @typescript-eslint/no-require-imports */
import { ReactHTMLElement, useEffect, useState } from 'react';
import Editor, { EditorProps } from '@monaco-editor/react';
import { vFiles } from './v-files';
import { transpileTypescript } from './transpile-typescript';
import type { languages } from 'monaco-editor';
import { FileSpec } from './types';
import { getHostHtml } from './host-html';

export const requireIntercept = (userRequireMap = {}, iframeRef: HTMLIFrameElement) => (moduleName) => {
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
}

export const Code4Editor = ({
  virtualFiles = {},
  requireMap = {},
  renderTarget = null,
  tsDefaultsPlugin = (d) => null,
  editorProps = {},
}) => {
  if(!renderTarget) {
    return <div>please provide a render target</div>;
  }
  const [codeText, setCodeText] = useState('document.body.style.backgroundColor = "orange";');
  const [iframeRef] = useState<HTMLIFrameElement>(renderTarget);
  const [jsCode, setJsCode] = useState('');
  const [lastError, setLastError] = useState(null as any);
  const [lastIframeCode, setIframeCode] = useState('');
  const [renderId, setRenderId] = useState(1);
  
  const requireMapping = requireIntercept(requireMap, iframeRef);

  useEffect(() => {
    const { iframeCode, sourceCode, error } = transpileTypescript(codeText);
    console.log('transpileTypescript', { iframeCode, sourceCode, error, codeText });

    iframeRef.srcdoc=getHostHtml({ code: iframeCode });
    
    
    if (error) {
      setLastError({ error });
    }
    else {
      setLastError({});
      setIframeCode(iframeCode);
      setRenderId(renderId + 1);
    }
  }, [codeText]);

  useEffect(() => {
    if (iframeRef) {
      window.setTimeout(() => {
        try {
          const { run } = (iframeRef?.contentWindow?.window as any) || {};
          if (run) {
            // console.log('running: renderId:', renderId);
            run({
              require: requireMapping, renderId, exports: {}
            });
          }
        }
        catch (e) {
          // setLastError({message, source, lineno, colno, error, targetLines})
          setLastError({ name: e.name, message: e.message });
          // console.log('contentWindow', e)
        }
      }, 350);
    }
  }, [lastIframeCode]);

  return (
    <Editor
      height='90vh'
      width="100%"
      theme="vs-dark"
      language={'typescript'}
      value={codeText}
      onChange={(value) => setCodeText(value)}
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

/*
      <div style={{ display: 'flex', flexDirection: 'column', height: '90vh', width: '50vw' }}>
        <div id="render-target">
          <iframe style={{ height: '90vh', width: '50vw' }} ref={r => { setIframeRef(r); }} srcDoc={getHostHtml({ code: iframeCode })} />
        </div>
        <div id="logs"></div>
      </div>
*/
