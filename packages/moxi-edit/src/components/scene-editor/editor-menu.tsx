import { Space, Menu, MenuProps } from 'antd';

interface EditorMenuProps {
  onMenuEvent?: (event: string) => void;
}
type MenuItem = Required<MenuProps>['items'][number];

const getMenuItems = (): MenuItem[] => {
  const items = [{
    label: 'Scene',
    key: 'scene',
  },
  {
    label: 'Project',
    key: 'project',
  },
  {
    label: 'Create',
    key: 'create',
    children: [{
      label: 'Rectangle',
      key: 'create-rect',
    }
  ],
  },
  {
    label: 'Debug',
    key: 'debug',
  }
  ];
  return items;
};

export const EditorMenu = ({ onMenuEvent = () => null }: EditorMenuProps) => {
  return (
    <div style={{ background: '#f0f0f0', padding: '1px' }}>
      <Menu mode="horizontal" items={getMenuItems()} />
    </div>
  );
};