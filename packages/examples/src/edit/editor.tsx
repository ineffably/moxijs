import Editor from '@monaco-editor/react';
import './editor.css';

export const TestEditor = () => {
  return (
    <Editor
      width="100vw"
      height="100vh"
      theme="vs-dark"
      defaultLanguage="typescript"
      value={'const x: string = "Hello, world!"'}
    />
  );
}