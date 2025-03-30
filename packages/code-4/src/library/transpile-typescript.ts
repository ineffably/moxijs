import { type CompilerOptions, transpile } from 'typescript';

export const transpileTypescript = (code: string, tsConfig = {} as CompilerOptions) => {
  let finalAttempt = null;

  const defaultTsConfig = {
    allowNonTsExtensions: true,
    target: 99,
    module: 1,
    moduleResolution: 1,
    resolveJsonModule: true,
    strict: false,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    noImplicitUseStrict: false,
    ...tsConfig
  } as CompilerOptions;

  const finalPass = transpile(code, defaultTsConfig);

  // compiler options to remove the "use strict"; don't seem to work.
  // brute force works every time...
  finalAttempt = finalPass.replace('"use strict";', '');
  
  const iframeCode = `
    ({require, renderId, exports} = {}) => {
      // console.log('==RUNNING==', renderId);
      ${finalAttempt} 
      return true;
    }
 `;

  return {
    error: null,
    iframeCode,
    sourceCode: finalPass,
  };

};

