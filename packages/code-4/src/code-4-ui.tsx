/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { vFiles } from './v-files';
import { getHostHtml } from './host-html';
import { transpileTypescript } from './transpile-typescript';
import type { languages } from 'monaco-editor';

export const requireIntercept = (userRequireMap = {}, iframeRef: HTMLIFrameElement) => (moduleName) => {
  if (moduleName.endsWith('.css')) {
    // css module loading is lame, loading all in main.css with webpack.
    // can't load from node_modules because tilde references ~@ux...
    // need some fancy loader stuff I'm not spending time on atm
    return '';
  }

  const reference = (({ ...userRequireMap })[moduleName]);
  if (!reference) {
    console.error(`module for ${moduleName} was not found`);
    return null;
  }

  // debugging why charts isn't loading...
  if (moduleName.toLowerCase() === '@ux/charts') {
    console.log(reference);
  }
  return reference;
};


export interface Code4UIProps {
  tsDefaultsPlugin?: (d: languages.typescript.LanguageServiceDefaults) => void;
  requireMap?: Record<string, any>;
}

export const Code4UI = ({ requireMap = {}, tsDefaultsPlugin = (d) => null }) => {
  const vfile = vFiles['simple.ts'];
  const [codeText, setCodeText] = useState(vfile.value);
  const [iframeRef, setIframeRef] = useState(null as HTMLIFrameElement);
  const [jsCode, setJsCode] = useState('');
  const [lastError, setLastError] = useState(null as any);
  const [iframeCode, setIframeCode] = useState('');
  const [renderId, setRenderId] = useState(1);
  const [sourceCode, setSourceCode] = useState('');

  const requireMapping = requireIntercept(requireMap, iframeRef);

  useEffect(() => {
    const { iframeCode, sourceCode, error } = transpileTypescript(codeText);

    if (error) {
      // console.log(error);
      setLastError({ error });
    }
    else {
      setLastError({});
      setSourceCode(sourceCode);
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
            // console.log(run);
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
  }, [iframeCode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ height: '90vh', width: '50vw' }}>
        <Editor
          height='90vh'
          theme="vs-dark"
          language={vfile.language}
          value={codeText}
          onChange={(value) => setCodeText(value)}
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
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', height: '90vh', width: '50vw' }}>
        <div id="render-target">
          <iframe style={{ height: '90vh', width: '50vw' }} ref={r => { setIframeRef(r); }} srcDoc={getHostHtml({ code: iframeCode })} />
        </div>
        <div id="logs"></div>
      </div>
    </div>
  );
};
