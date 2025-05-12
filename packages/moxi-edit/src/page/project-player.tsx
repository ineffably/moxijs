import { Button, Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { init as basicPixiOnlyInit } from '../../example-projects/basic-pixi-only/basic-pixi-only';
import { init as basicReactPixiInit } from '../../example-projects/basic-moxi/basic-moxi';
import { init as moxiProgressBar } from '../../example-projects/progress-bar/progress-bar-example';
import { init as exampleProject01Init } from '../../example-projects/example-project-01/example-project-01';
import { init as bunnyAdventureInit } from '../../example-projects/bunny-adventure/bunny-adventure';
import { useLocation } from 'wouter';

export type AvailableExamples = 'basic-moxi' | 'basic-pixi-only'

const exampleNameMap = {
  'basic-moxi': basicReactPixiInit,
  'basic-pixi-only': basicPixiOnlyInit,
  'moxi-progress-bar': moxiProgressBar,
  'example-project-01': exampleProject01Init,
  'bunny-adventure': bunnyAdventureInit,
}

export interface DirectPlayerProps {
  exampleName?: AvailableExamples;
}

export const ProjectPlayer = ({ exampleName }) => {
  const [selectedExample, setSelectedExample] = useState(exampleName);
  const [location, navigate] = useLocation();

  useEffect(() => {
    (window as any).moxiedit = false;
    const example = exampleNameMap[selectedExample];
    if (example) {
      example();
    }
  }, [selectedExample]);

  const menuProps = {
    onClick: (key) => {
      if(selectedExample === key.key) return;
      // TODO: unload correctly and clean-up memory 
      document.getElementById('app').innerHTML = '';
      setSelectedExample(key.key);
      navigate(`example/${key.key}`);
    },
    items: Object.keys(exampleNameMap).map((exampleName) => {
      return ({
        label: exampleName,
        key: exampleName
      });
    })
  };

  return (
    <div style={{ position: 'absolute', top: 0, right: 0 }}>
      <Dropdown
        menu={menuProps} >
        <Button>
          <Space>
            Examples
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>
    </div>
  );
};

