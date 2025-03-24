import { Button, Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { examplesLibrary } from './example-projects';
import { init as basicPixiOnlyInit } from './example-projects/basic-pixi-only/basic-pixi-only';
import { init as basicReactPixiInit } from './example-projects/basic-moxi/basic-moxi';

export const ProjectPlayer = () => {
  const [selectedExample, setSelectedExample] = useState(examplesLibrary[0].name);

  useEffect(() => {
    if(selectedExample === 'Basic Pixi Only') {
      basicPixiOnlyInit();
    } else if(selectedExample === 'Basic Moxi') {
      basicReactPixiInit();
    }
  }, [selectedExample]);

  const menuProps = {
    onClick: (key) => {
      // TODO: unload correctly and clean-up memory 
      document.getElementById('app').innerHTML = '';
      setSelectedExample(key.key);
    },
    items: examplesLibrary.map((project) => {
      return ({
        label: project.name,
        key: project.name
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

