import { Code4UI } from './code-4-ui';
import React from 'react';
import ReactDOM from 'react-dom/client';
import PIXI from 'pixi.js';
import * as moxi from 'moxi';

const requireMap = {
  'React': React,
  'ReactDOM': ReactDOM,
  'moxi': moxi,
  'pixi.js': PIXI,
};


export const Code4 = ({ tsDefaultsPlugin = (d) => null }) => {
  return (
    <Code4UI 
      requireMap={requireMap}
      tsDefaultsPlugin={tsDefaultsPlugin} 
    />
  );
};
