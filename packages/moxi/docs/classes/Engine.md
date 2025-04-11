[**Moxi v0.1.0**](../README.md)

***

[Moxi](../globals.md) / Engine

# Class: Engine

Defined in: [engine.ts:21](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/engine.ts#L21)

The core game engine class that manages the game loop, scene rendering,
and update cycles. Coordinates with the PIXI.Ticker to drive the animation.

## Example

```typescript
// Create a new engine with a scene
const engine = new Engine(scene);

// Start the game loop
engine.start();

// Stop the game loop when needed
engine.stop();
```

## Constructors

### Constructor

> **new Engine**(`stage`): `Engine`

Defined in: [engine.ts:53](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/engine.ts#L53)

Creates a new Engine instance

#### Parameters

##### stage

[`Scene`](Scene.md) = `null`

The initial scene to use, if any

#### Returns

`Engine`

## Properties

### ticker

> **ticker**: `Ticker`

Defined in: [engine.ts:25](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/engine.ts#L25)

The PIXI Ticker instance that drives the game loop

***

### root

> **root**: [`Scene`](Scene.md)

Defined in: [engine.ts:30](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/engine.ts#L30)

The current active scene/stage

***

### logger()

> **logger**: (`msg`) => `void`

Defined in: [engine.ts:35](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/engine.ts#L35)

Optional logging function for debugging

#### Parameters

##### msg

`string`

#### Returns

`void`

***

### loggerFrequencyMs

> **loggerFrequencyMs**: `number`

Defined in: [engine.ts:40](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/engine.ts#L40)

How often to log messages (in milliseconds)

***

### nextLogTime

> **nextLogTime**: `number`

Defined in: [engine.ts:46](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/engine.ts#L46)

**`Internal`**

Timestamp for the next log message

## Methods

### start()

> **start**(): `Engine`

Defined in: [engine.ts:71](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/engine.ts#L71)

Starts the game loop

#### Returns

`Engine`

The Engine instance for chaining

***

### stop()

> **stop**(): `Engine`

Defined in: [engine.ts:81](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/engine.ts#L81)

Stops the game loop

#### Returns

`Engine`

The Engine instance for chaining

***

### loadStage()

> **loadStage**(`stage`): `Engine`

Defined in: [engine.ts:107](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/engine.ts#L107)

Sets a new active scene

#### Parameters

##### stage

[`Scene`](Scene.md)

The new scene to use

#### Returns

`Engine`

The Engine instance for chaining
