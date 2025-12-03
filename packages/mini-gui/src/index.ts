/**
 * @moxijs/mini-gui
 *
 * Minimal debug GUI for MoxiJS - lightweight control panels.
 * Inspired by rad-gui, built natively with PIXI.js.
 *
 * @example
 * ```ts
 * import { GUI } from '@moxijs/mini-gui';
 *
 * const gui = new GUI({ title: 'Settings' });
 * gui.add(player, 'speed', 0, 10);
 * gui.add(player, 'isAlive');
 * scene.addChild(gui);
 * ```
 */

// Main GUI
export { GUI, type GUIOptions, type GUIConfig, type ChangeEvent } from './gui';

// Controls
export {
  Control,
  type ControlOptions,
  type ChangeCallback,
  NumberControl,
  type NumberControlOptions,
  BooleanControl,
  StringControl,
  OptionControl,
  type OptionList,
} from './controls';

// Grid utilities
export { px, units, GUI_CONST, GUI_COLORS, GUI_GRID } from './gui-grid';
