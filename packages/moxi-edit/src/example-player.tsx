import { useEffect } from 'react';
// import { init } from './example-projects/basic-pixi-only/basic-pixi-only';
import { init } from './example-projects/basic-moxi/basic-moxi';

export const ExamplePlayer = () => {
  useEffect(() => {
    init();
  }, []);

  return (
    <span></span>
  );
};

