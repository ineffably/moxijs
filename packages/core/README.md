# MoxiJS

Game framework built on PIXI.js with Entity-Component-System (ECS) architecture, physics integration, and UI components.

🎮 **[View Live Examples](https://ineffably.github.io/moxijs/packages/moxijs-examples/dist/)** - Interactive examples with source code viewer

## Quick Start

```typescript
import { setupMoxi, asEntity, Logic } from '@moxijs/core';

// Initialize
const { scene, engine, renderer } = await setupMoxi({
  hostElement: document.getElementById('app'),
  renderOptions: { width: 1280, height: 720, backgroundColor: 0x1a1a2e }
});

// Create entity with logic
const sprite = asEntity(new PIXI.Sprite(texture));
sprite.moxiEntity.addLogic(new MyLogic());
scene.addChild(sprite);

// Start
scene.init();
engine.start();
```

## Core Concepts

### setupMoxi

Main entry point. Returns `{ scene, engine, renderer, camera, loadAssets, physicsWorld? }`.

```typescript
const result = await setupMoxi({
  hostElement: HTMLElement,           // Required: container element
  renderOptions?: {},                 // PIXI render options
  physics?: boolean | PhysicsWorldOptions,  // Enable physics
  pixelPerfect?: boolean,             // Pixel-art mode (resolution:1, no antialias)
  showLoadingScene?: boolean          // Show loading overlay
});
```

### Entity System

Convert PIXI objects to entities with `asEntity()`:

```typescript
const entity = asEntity(new PIXI.Sprite(texture));
entity.moxiEntity.addLogic(new MovementLogic());
entity.moxiEntity.getLogic<MovementLogic>('MovementLogic');
```

### Logic Components

Extend `Logic<T>` to add behavior:

```typescript
class MovementLogic extends Logic<PIXI.Sprite> {
  speed = 5;

  init(entity, renderer) {
    // Called once when scene.init()
  }

  update(entity, deltaTime) {
    // Called every frame
    entity.x += this.speed * deltaTime;
  }
}
```

Properties:
- `active: boolean` - Enable/disable updates
- `name?: string` - Identifier for getLogic()

### Scene & Engine

```typescript
const scene = new Scene(renderer);  // Extends PIXI.Container
const engine = new Engine(scene);

scene.addChild(entity);
scene.init();      // Calls init() on all entity logic
engine.start();    // Starts game loop
engine.stop();     // Pauses game loop
```

## Physics (Planck.js)

```typescript
const { physicsWorld } = await setupMoxi({ physics: true });

// Add physics to entity
const entity = asEntity(new PIXI.Sprite(texture));
entity.moxiEntity.addLogic(new PhysicsBodyLogic(physicsWorld, {
  type: 'dynamic',           // 'static' | 'dynamic' | 'kinematic'
  shape: { type: 'box', width: 32, height: 32 },
  collisionTags: ['player'],
  collidesWith: ['terrain', 'enemy']
}));

// Collision callbacks
physicsWorld.onCollision('player', 'enemy', (event) => {
  console.log('Hit!', event.bodyA, event.bodyB);
});

// Debug rendering
physicsWorld.enableDebugRenderer(scene);
```

### Shape Types

```typescript
shape: { type: 'box', width, height }
shape: { type: 'circle', radius }
shape: { type: 'polygon', vertices: [{x,y}...] }
```

### Physics Helpers

```typescript
import { asPhysicsEntity, hasPhysics, getPhysicsBody } from '@moxijs/core';

const entity = asPhysicsEntity(sprite, physicsWorld, options);
if (hasPhysics(entity)) {
  const body = getPhysicsBody(entity);
  body.setVelocity(new Point(100, 0));
}
```

## UI Components

Flexbox-based UI system with pixel grid alignment.

### Pixel Grid

```typescript
import { px, units, GRID } from '@moxijs/core';

px(10);        // 10 grid units -> 40 pixels (at 4x scale)
units(40);     // 40 pixels -> 10 grid units
GRID.scale;    // Current scale (default 4)
```

### FlexContainer

```typescript
import { FlexContainer, FlexDirection, FlexJustify, FlexAlign, EdgeInsets } from '@moxijs/core';

const container = new FlexContainer({
  direction: FlexDirection.Row,      // Row | Column
  justify: FlexJustify.SpaceBetween, // Start | End | Center | SpaceBetween | SpaceAround
  align: FlexAlign.Center,           // Start | End | Center | Stretch
  gap: 8,
  padding: EdgeInsets.all(16),
  backgroundColor: 0x333333
});

container.addChild(button1);
container.addChild(button2);
container.layout(400, 300);  // Available width, height
```

### UIButton

```typescript
import { UIButton } from '@moxijs/core';

const button = new UIButton({
  label: 'Click Me',
  width: 120,
  height: 40,
  backgroundColor: 0x4a90d9,
  hoverColor: 0x5aa0e9,
  pressedColor: 0x3a80c9,
  onClick: () => console.log('Clicked!')
});
```

### UILabel

```typescript
const label = new UILabel({
  text: 'Hello World',
  fontSize: 16,
  color: 0xffffff,
  fontFamily: 'Arial',
  align: 'center'  // 'left' | 'center' | 'right'
});
```

### UIPanel

```typescript
const panel = new UIPanel({
  width: 300,
  height: 200,
  backgroundColor: 0x222222,
  borderRadius: 8,
  padding: EdgeInsets.all(16)
});
panel.addChild(label);
```

### UITextInput

```typescript
const input = new UITextInput({
  width: 200,
  height: 32,
  placeholder: 'Enter text...',
  onChange: (value) => console.log(value)
});
```

### UISelect

```typescript
const select = new UISelect({
  width: 200,
  options: [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' }
  ],
  onChange: (value) => console.log(value)
});
```

### UIScrollContainer

```typescript
const scroll = new UIScrollContainer({
  width: 300,
  height: 400,
  scrollbarWidth: 12
});
scroll.addChild(tallContent);
scroll.scrollTo(100);
scroll.scrollToBottom();
```

### UITabs

```typescript
const tabs = new UITabs({
  width: 400,
  tabs: [
    { id: 'tab1', label: 'Tab 1', content: panel1 },
    { id: 'tab2', label: 'Tab 2', content: panel2 }
  ],
  onTabChange: (id) => console.log('Tab:', id)
});
```

## Utilities

### Asset Loading

```typescript
const { loadAssets, PIXIAssets } = await setupMoxi({...});

await loadAssets([
  { src: './player.png', alias: 'player' },
  { src: './tileset.png', alias: 'tiles' }
]);

const texture = PIXIAssets.get('player');
```

### Camera

```typescript
const { camera } = await setupMoxi({...});

camera.follow(playerEntity);
camera.setZoom(2);
camera.pan(100, 50);
camera.shake(10, 500);  // intensity, duration
```

### State Machine

```typescript
import { StateMachine, StateLogic } from '@moxijs/core';

class IdleState extends StateLogic<Player> {
  name = 'idle';

  update(entity, deltaTime) {
    if (keys.space) this.machine.transition('jump');
  }
}

const stateMachine = new StateMachine<Player>();
stateMachine.addState(new IdleState());
stateMachine.addState(new JumpState());
stateMachine.start('idle');
```

### Parallax Backgrounds

```typescript
import { ParallaxBackground } from '@moxijs/core';

const parallax = new ParallaxBackground({
  layers: [
    { texture: skyTexture, speed: 0.1 },
    { texture: mountainsTexture, speed: 0.3 },
    { texture: treesTexture, speed: 0.6 }
  ]
});
scene.addChild(parallax);
```

### Texture Utilities

```typescript
import { asTextureFrames, TextureFrameSequences } from '@moxijs/core';

// Split spritesheet into frames
const frames = asTextureFrames(spritesheet.source, {
  frameWidth: 32,
  frameHeight: 32
});

// Named animation sequences
const sequences = new TextureFrameSequences(spritesheet.source, {
  idle: { start: 0, end: 3 },
  walk: { start: 4, end: 11 },
  jump: { start: 12, end: 15 }
});
const walkFrames = sequences.get('walk');
```

### PIXI Helpers

```typescript
import { asSprite, asText, asGraphics, asContainer } from '@moxijs/core';

// Create configured PIXI objects
const sprite = asSprite(texture, { x: 100, y: 50, scale: 2, anchor: 0.5 });
const text = asText('Hello', { x: 0, y: 0, style: { fill: 0xffffff } });
const graphics = asGraphics({ x: 0, y: 0 });
```

### SVG to Texture

```typescript
import { svgToTexture } from '@moxijs/core';

const texture = await svgToTexture(renderer, svgString, {
  width: 64,
  height: 64
});
```

### Input Handling

```typescript
import { ClientEvents } from '@moxijs/core';

const input = ClientEvents.getInstance();

// In update loop
if (input.isKeyDown('ArrowRight')) player.x += 5;
if (input.isKeyDown('Space')) player.jump();

// Mouse state
const mousePos = input.movePosition;
const isMouseDown = input.mouseDownEvent !== null;
```

### Event System

```typescript
import { EventEmitter } from '@moxijs/core';

interface GameEvents {
  'player:death': (player: Player) => void;
  'score:change': (score: number) => void;
}

const events = new EventEmitter<GameEvents>();
events.on('player:death', (player) => console.log('Dead!'));
events.emit('player:death', player);
```

## Type Exports

```typescript
// Core
export type { AsEntity, MoxiLogic } from '@moxijs/core';

// Physics
export type {
  BodyType, ShapeType, CollisionTag, ShapeConfig,
  PhysicsWorldOptions, PhysicsBodyOptions, CollisionEvent
} from '@moxijs/core';

// UI
export type {
  BoxModel, FlexContainerProps, UIButtonProps, UILabelProps,
  UIPanelProps, UISelectProps, SelectOption
} from '@moxijs/core';
```
