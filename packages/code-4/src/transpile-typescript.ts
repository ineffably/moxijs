import { transpile } from 'typescript';

export const transpileTypescript = (code: string, tsConfig = {}) => {
  let finalAttempt = null;
  const defaultTsConfig = {
    allowNonTsExtensions: true,
    target: 99,
    module: 1,
    moduleResolution: 1,
    resolveJsonModule: true,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    ...tsConfig
  };

  const finalPass = transpile(code, defaultTsConfig);
  finalAttempt = finalPass;

  const iframeCode = `
    ({require, renderId, exports} = {}) => {
      // console.log('==RUNNING==', renderId);
      ${finalPass} 
      return true;
    }
 `;

  return {
    error: null,
    iframeCode,
    sourceCode: finalPass,
  };

};