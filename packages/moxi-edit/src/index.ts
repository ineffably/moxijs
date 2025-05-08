// Set appLoaded flag immediately
(window as any).appLoaded = true;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { EditorRoot } from './page/editor-root';

const container = document.getElementById('editor-ui');
if(container){
  const element = React.createElement(EditorRoot);
  ReactDOM.createRoot(container).render(element);
}

export { EditorRoot };

export default EditorRoot;
