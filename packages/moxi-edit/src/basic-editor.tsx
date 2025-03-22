import { Splitter } from 'antd';
import * as moxi from 'moxi';
import React, { useEffect, useState } from 'react';
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
  const [consoleRef, setConsoleRef] = useState(null as HTMLTextAreaElement);
  const [lastSourceDoc, setSourceDoc] = useState('');

  useEffect(() => {}, [lastSourceDoc]);

  return (
    <div>
      <div>
        <Splitter>
          <Splitter.Panel>
            <div style={{ height: '85vh', width: '100%' }}>
              <Code4Editor
                renderTarget={iframeRef}
                requireMap={requireMap}
                consoleTarget={consoleRef}
                onSourceChange={(srcDoc) => {
                  setSourceDoc(srcDoc);
                }}
              />
            </div>
          </Splitter.Panel>
          <Splitter.Panel>
            <div style={{ height: '85vh', width: '100%', overflow: 'hidden' }}>
              <iframe
                style={{ height: '100%', width: '100%', overflow: 'hidden' }}
                ref={r => { setIframeRef(r); }}
                srcDoc={lastSourceDoc}
              />
            </div>
          </Splitter.Panel>
        </Splitter>
      </div>
      <div style={{ height: '10vh', width: '100%' }}>
        <textarea
          ref={r => setConsoleRef(r)}
          style={{ 
            height: '100%', 
            width: '100%',
            backgroundColor: '#222',
            color: 'white', 
          }}
          value={''}
        />
      </div>
    </div>
  );
};