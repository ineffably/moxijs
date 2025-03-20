import { Splitter } from 'antd';
import * as moxi from 'moxi';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import PIXI from 'pixi.js';
import { Code4Editor } from 'code-4';

const requireMap = {
  'React': React,
  'ReactDOM': ReactDOM,
  'moxi': moxi,
  'pixi.js': PIXI,
};

export const BasicEditor = () => {
  const [iframeRef, setIframeRef] = useState(null as HTMLIFrameElement);

  return (
    <div>
      <Splitter>
        <Splitter.Panel>
          <div style={{ height: '95vh', width: '100%' }}>
            <Code4Editor
              renderTarget={iframeRef}
              requireMap={requireMap}
            />
          </div>
        </Splitter.Panel>
        <Splitter.Panel>
          <div id="render-target">
            <iframe
              style={{ height: '95vh', width: '100%', overflow: 'hidden' }}
              ref={r => { setIframeRef(r); }}
            />
          </div>
        </Splitter.Panel>
      </Splitter>
    </div>
  );
};